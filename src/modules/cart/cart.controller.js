import { asyncHandler } from "../../utils/asyncHandler.js"
import { Product} from "../../../DB/models/product.model.js"
import { Cart } from "../../../DB/models/cart.model.js";

//add to cart 
export const addToCart = asyncHandler(async(req,res,next)=>{
    // data id , quantity
    const {productId,  quantity} = req.body;
    //check product
    const product = await Product.findById(productId)
    if(!product) return next(new Error("Product not found!" , { cause: 404}));
    // check stock
   // if(quantity > product.availableItems) return next(
     //   new Error(
 //  `Sorry, only ${product.availableItems} items left on the stock`
 //  ));
if(!product.inStock(quantity))
    return next(
        new Error(
            `Sorry, only ${product.availableItems} items left on the stock`
        )
    )



    // add to cart
    //const cart = await Cart.findOne({ user: req.user._id});
    //cart.products.push({ productId, quantity });
    // await cart.save();

    // another approach
    // check the product existence in the cart >> //TODO
    const isProductInCart = await Cart.findOne({
        user: req.user.id,
        "products.productId": productId,
    });
    if(isProductInCart){
        isProductInCart.products.forEach((productObj)=>{
            if(
                productObj.productId.toString() === productId.toString() &&
                productObj.quantity + quantity < product.availableItems
            ) {
                productObj.quantity = productObj.quantity + quantity;
            }
        });
        await isProductInCart.save();
        //res
        return res.json({
            success: true,
            results: isProductInCart,
            message: "Product added successfully!",
        });
    } else {
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id},
        { $push: { products: { productId, quantity}}},
        { new: true }
    );
    // response 
    return res.json({success: true, results:cart, message: "Product added successfully!"})
    }


})


// user cart 
export const userCart = asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOne({ user: req.user._id}).populate({
    path:"products.productId",
    select:"name defaultImage.url price discount finalPrice"
});
    return res.json({ success: true, results: cart});
})


// update cart 
export const updateCart = asyncHandler(async(req,res,next)=>{
        // data id , quantity
        const {productId,  quantity} = req.body;
        //check product
        const product = await Product.findById(productId)
        if(!product) return next(new Error("Product not found!" , { cause: 404}));
        // check stock
        if(!product.inStock(quantity))
            return next(
                new Error(
                    `Sorry, only ${product.availableItems} items left on the stock`
                )
            )
        // update product
        const cart = await Cart.findOneAndUpdate({
            user: req.user._id,
            "products.productId": productId,
        },{
            $set:{ "products.$.quantity":quantity},
        },{
            new: true
        });
        // send response
        return res.json({ success: true, results: cart});
});

// remove product from cart
export const removeProductFromCart = asyncHandler(async(req,res,next)=>{
    // remove
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id},
        { $pull: { products: { productId: req.params.productId}}},
        { new: true }
    );
    //res
    return res.json({success: true, results: cart, message:"product removed successffully!"});
});

//clear cart
export const clearCart = asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOneAndUpdate({ user: req.user._id},
        { products: []},
        {new: true}
    );
    return res.json({success:true, results: cart, message:"cart cleared!"});
    
});
