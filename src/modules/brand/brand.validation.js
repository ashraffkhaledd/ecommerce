import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// create brand
export const createbrandSchema = joi.object({
    name: joi.string().min(4).max(15).required(), 
    categoryId:joi.string().custom(isValidObjectId).required()
}) 
.required();


// update brand
export const updatebrandSchema = joi.object({
    name: joi.string().min(4).max(15),
    brandId:joi.string().custom(isValidObjectId).required()
})
.required();

//delete brand
export const deletebrandSchema = joi.object({
    brandId:joi.string().custom(isValidObjectId).required()
})
.required();