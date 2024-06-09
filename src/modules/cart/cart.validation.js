import joi from "joi"
import { isValidObjectId } from "mongoose";
//add to cart

export const addToCartSchema = joi.object({
    productId:joi.string().custom(isValidObjectId).required(),
    quantity:joi.number().integer().min(1).required()
}).required();

// update cart 
export const updateCartSchema = joi.object({
    productId:joi.string().custom(isValidObjectId).required(),
    quantity:joi.number().integer().min(1).required()
}).required();


// remove product from cart
export const removeProductFromCartSchema =  joi.object({
    productId:joi.string().custom(isValidObjectId).required(),
}).required();