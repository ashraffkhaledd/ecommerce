import mongoose,{ Schema,Types,model } from "mongoose";

const reviewSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },

},{timestamps: true});


export const Review = mongoose.models.Review || model("Review",reviewSchema);