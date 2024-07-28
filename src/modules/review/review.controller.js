import { asyncHandler } from "../../utils/asyncHandler.js";
import { Review } from "../../../DB/models/review.model.js";
import { Product } from "../../../DB/models/product.model.js";
// create category
export const addReview = asyncHandler(async(req,res,next)=>{
    // user , content >>> data
    const { content, productId } = req.body;
    // check product
    if(!(await Product.findById(productId)))
        return next(new Error("Product not found!"));
    // add review to model 
    const review = await Review.create({
        user: req.user._id,
        content,
    });
    // add review to product 
    const product = await Product.findByIdAndUpdate(productId,{
        $push: {reviews:{ id: review._id}},
    });
    return res.json({success:true,message:"review added successfully!"});
})