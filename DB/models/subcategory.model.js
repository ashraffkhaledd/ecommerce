import mongoose, {Schema,model, Types} from "mongoose"

const subCategorySchema = new Schema(
    {
        name: { type: String, requored: true, min: 5, max:20},
        slug: { type: String, required:true},
        image: {
            id: { type: String, required: true},
            url: { type: String, required: true},
        },
    categoryId: {
        type: Types.ObjectId,
        ref: "category",
        required: true,
    },
    brand: [{type: Types.ObjectId,
        ref: "Brand"
    }],
    createdBy: {type: Types.ObjectId, ref:"User", required: true}
    },
    { timestamps: true }
);

export const subcategory = mongoose.models.subcategory || model("subcategory",subCategorySchema)