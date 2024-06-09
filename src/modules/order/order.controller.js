import fs from "fs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { createInvoice } from "../../../createinvoice.js";
import { fileURLToPath } from "url";
import path from "path";
import cloudinary from "../../utils/cloud.js"; // corrected spelling
import { clearCart, updateStock } from "./order.service.js";
import { sendEmail } from "../../utils/sendEmails.js";
import { Coupon } from "../../../DB/models/coupon.model.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//create order
export const createOrder = asyncHandler(async (req, res, next) => {
    console.log("createOrder: Starting order creation process...");

    try {
        // Extract data from the request
        const { payment, address, phone, coupon } = req.body;
        console.log("createOrder: Extracted data from request:", { payment, address, phone, coupon });

        // Validate coupon
        let checkCoupon;
        if (coupon) {
            console.log("createOrder: Checking coupon...");
            checkCoupon = await Coupon.findOne({
                name: coupon,
                expiredAt: { $gt: Date.now() },
            });
            if (!checkCoupon) {
                console.error("createOrder: Invalid or expired coupon!");
                return res.status(400).json({ success: false, message: "Invalid or expired coupon!" });
            }
        }

        // Check the cart for products
        console.log("createOrder: Checking cart...");
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || cart.products.length < 1) {
            console.error("createOrder: Empty cart!");
            return res.status(400).json({ success: false, message: "Empty cart!" });
        }

        let orderProducts = [];
        let orderPrice = 0;

        // Validate products in the cart
        for (let i = 0; i < cart.products.length; i++) {
            const product = await Product.findById(cart.products[i].productId);
            if (!product) {
                console.error(`createOrder: Product ${cart.products[i].productId} not found!`);
                return res.status(404).json({ success: false, message: `Product ${cart.products[i].productId} not found!` });
            }
            if (!product.inStock(cart.products[i].quantity)) {
                console.error(`${product.name} out of stock, only ${product.availableItems} items are left`);
                return res.status(400).json({ success: false, message: `${product.name} out of stock, only ${product.availableItems} items are left` });
            }

            orderProducts.push({
                productId: product._id,
                quantity: cart.products[i].quantity,
                name: product.name,
                itemPrice: product.finalPrice,
                totalPrice: cart.products[i].quantity * product.finalPrice,
            });

            orderPrice += cart.products[i].quantity * product.finalPrice;
        }

        // Create order
        console.log("createOrder: Creating order...");
        const order = await Order.create({
            user: req.user._id,
            products: orderProducts,
            address,
            phone,
            coupon: checkCoupon ? {
                id: checkCoupon._id,
                name: checkCoupon.name,
                discount: checkCoupon.discount,
            } : undefined,
            payment,
            price: orderPrice
        });

        // Generate invoice
        const user = req.user;
        const invoice = {
            shipping: {
                name: user.UserName,
                address: order.address,
                country: "Egypt",
            },
            items: order.products,
            subtotal: order.price,
            paid: order.finalPrice,
            invoice_nr: order._id,
        };

        const invoiceDir = path.join(__dirname, './../../../invoiceTemp/');
        const pdfPath = path.join(invoiceDir, `${order._id}.pdf`);

        // Ensure the directory exists
        if (!fs.existsSync(invoiceDir)) {
            console.log(`createOrder: Directory ${invoiceDir} does not exist. Creating...`);
            fs.mkdirSync(invoiceDir, { recursive: true });
        }

        // Create the invoice PDF
        console.log("createOrder: Generating invoice PDF at", pdfPath);
        await new Promise((resolve, reject) => {
            createInvoice(invoice, pdfPath);
            // Adding a delay to ensure file is completely written
            setTimeout(() => {
                if (fs.existsSync(pdfPath)) {
                    resolve();
                } else {
                    reject(new Error("Invoice PDF creation failed"));
                }
            }, 2000);
        });

        // Check if the PDF was created
        if (!fs.existsSync(pdfPath)) {
            console.error(`createOrder: File not found at path: ${pdfPath}`);
            throw new Error(`File not found at path: ${pdfPath}`);
        }

        // Upload the PDF to Cloudinary
        console.log("createOrder: Uploading invoice PDF to Cloudinary...");
        const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
            folder: `${process.env.FOLDER_CLOUD_NAME}/order/invoice/${user._id}`,
        });

        // Delete the local file after upload (optional but recommended)
        console.log("createOrder: Deleting local PDF file...");
        fs.unlinkSync(pdfPath);

        // Attach the invoice URL to the order
        console.log("createOrder: Attaching invoice to order...");
        order.invoice = { id: public_id, url: secure_url };
        await order.save();

        // Send email with the invoice
        console.log("createOrder: Sending email with invoice...");
        const isSent = await sendEmail({
            to: user.email,
            subject: "Order Invoice",
            attachments: [
                {
                    path: secure_url,
                    contentType: "application/pdf",
                },
            ],
        });

        if (isSent) {
            // Update stock and clear cart if email was sent successfully
            console.log("createOrder: Updating stock and clearing cart...");
            updateStock(order.products, true);
            clearCart(user._id);
        }
        // stripe payment ////////////////////////////
if(payment == "visa"){
    const stripe = new Stripe(process.env.STRIPE_KEY)
    let existCoupon;
    if(order.coupon.name !== undefined){
        existCoupon = await stripe.coupons.create({
            percent_off:order.coupon.discount,
            duration: "once"
        })
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        mode:"payment",
        success_url:process.env.SUCCESS_URL,
        cancel_url:process.env.CANCEL_URL,
        line_items:order.products.map((product)=>{
            return {
                price_data:{
                    currency:"egp",
                    product_data:{
                        name: product.name,
                        //image:[product.productId.defaultImage.url]
                    },
                    unit_amount:product.itemPrice * 100,
                },
                quantity : product.quantity,
            };
        }),
        discounts: existCoupon ? [{coupon: existCoupon.id}] : [],
    });
    return res.json({success: true, results: session.url})
}

        // Send response
        console.log("createOrder: Order created successfully!");
        return res.json({ success: true, message: "Order placed successfully! Please check your email!" });

    } catch (error) {
        console.error("createOrder: Error occurred -", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
});

//cancel order
export const cancelOreder = asyncHandler(async(req,res,next)=>{
    
    const order = await Order.findById(req.params.orderId);
    if(!order) return next(new Error("order not found!"));

    if (order.status === "shipped" || order.status === "delivered")
        return next(new Error("can not cancel order!"));

    order.status = "canceled";
    await order.save();
    updateStock(order.products,false)
    return res.json({ success: true, message: "order canceled successfully!"});



    
});






