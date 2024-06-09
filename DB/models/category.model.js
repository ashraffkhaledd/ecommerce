import mongoose, {Types,model, Schema} from "mongoose";

//schema 
const categorySchema = new Schema({
    name:{ type: String, required: true},
    slug: {type:String, required: true},
    image:{
        url: {type: String, required:true},
        id: {type: String, required:true},
    },
    createdBy: {type: Types.ObjectId, ref:"User", required: true},
    brandId: {type: Types.ObjectId, ref: "Brand", required: true}
},
    {timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }}
);

categorySchema.virtual("subcategory", {
    ref: "subcategory",
    localField: "_id", //category model
    foreignField: "categoryId", //subcategory
});
//model
export const category = mongoose.models.category || model("category",categorySchema);