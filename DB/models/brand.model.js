import mongoose, {Types,model, Schema} from "mongoose";

//schema 
const brandSchema = new Schema({
    name:{ type: String, required: true},
    slug: {type:String, required: true},
    image:{
        url: {type: String, required:true},
        id: {type: String, required:true},
    },
    createdBy: {type: Types.ObjectId, ref:"User", required: true},
    categoryId: { type:Types.ObjectId, ref:"category", required: true}
},
    {timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }}
);


//model
export const Brand = mongoose.models.Brand || model("Brand",brandSchema);