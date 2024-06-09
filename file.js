import { asyncHandler } from "../../utils/asyncHandler.js";
import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { createInvoice } from "../../../createinvoice.js";
import { fileURLToPath } from "url";
import path from "path";
import cloudnairy from "../../utils/cloud.js";
import { clearCart, updateStock } from "./order.service.js";
import { sendEmail } from "../../utils/sendEmails.js";
import { Coupon } from "../../../DB/models/coupon.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// create order
export const createOrder = asyncHandler(async(req,res,next)=>{
    //data
    const { payment, address , phone, coupon } = req.body
    //check coupon
    let checkCoupon;
    if(coupon){
        checkCoupon = await Coupon.findOne({ name: coupon,
            expiredAt: { $gt: Date.now() },
        });
        if(!coupon) return next(new Error("Invalid coupon!"));
    }
    // check cart
    const cart = await Cart.findOne({ user: req.user._id });
    const products = cart.products;
    if(products.length < 1) return next(new Error("Empty cart!"));

    let orderProducts = [];
    let orderPrice = 0;
    //check products
    for (let i = 0; i < products.length; i++) {
        // check product existence
        const product = await Product.findById(products[i].productId);
        if(!product)
            return next(new Error(`product ${products[i].productId} not found!`));
        // check product stock
        if(!product.inStock(products[i].quantity)) 
            return next(new Error(`${product.name} out of stock, only ${product.avaliableItems} items are left`));

        orderProducts.push({
            productId: product._id,
            quantity: products[i].quantity,
            name:product.name,
            itemPrice: product.finalPrice,
            totalPrice:products[i].quantity * product.finalPrice,
        });

        orderPrice +=products[i].quantity * product.finalPrice
        
    }
    // create order
    const order = await Order.create({
        user: req.user._id,
        products: orderProducts,
        address,
        phone,
        coupon: {
            id:checkCoupon?._id,
            name:checkCoupon?.name,
            discount:checkCoupon?.discount
        },
        payment,
        price: orderPrice
    });
    // generate invoice
    
    const user = req.user
    const invoice = {
        shipping:{
        name:user.UserName,
        address: order.address,
        country:"Egypt"
        },
        items: order.products,
        subtotal: order.price,
        paid: order.finalPrice,
        invoice_nr: order._id,
    };

    const pdfPath = path.join(
        __dirname,
        `./../../../invoiceTemp/${order._id}.pdf`
    );
    createInvoice(invoice, pdfPath);
    //upload cloudinary
    const { public_id, secure_url} = await cloudnairy.uploader.upload(
        pdfPath,
        {
            folder: `${process.env.FOLDER_CLOUD_NAME}/order/invoice/${user._id}`,
        }
    );
    // TODO delete file system from filesystem

    // add invoice to order
    order.invoice = { id: public_id, url: secure_url};
    await order.save();


    // send email
    const isSent = await sendEmail({ 
        to: user.email,
        subject: "Order invoice",
        attachments:[
            {
            path: secure_url,
            contentType: "application/pdf",
        },
    ],
    });

    if(isSent){
        //update stock
        updateStock(order.products);
        // clear cart
        clearCart(user._id);
    }
    //res
    return res.json({success: true, message: "order placed successfully! please check your email!"})





});
