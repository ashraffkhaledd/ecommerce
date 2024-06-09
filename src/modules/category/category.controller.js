import { category } from "../../../DB/models/category.model.js";
import { subcategory } from "../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudnairy from "../../utils/cloud.js"; 
import slugify from "slugify";

//create category
export const creatCategory = asyncHandler(async (req ,res ,next) => {
    //file
    if (!req.file) return next(new Error("image is required!"));

    const {secure_url, public_id} = await cloudnairy.uploader.upload(
        req.file.path, {folder: `${process.env.FOLDER_CLOUD_NAME}/category`}
    );

    // save image in db
    const Category = await category.create({
        name: req.body.name,
        createdBy:req.user._id,
        image:{id: public_id, url: secure_url},
        slug : slugify(req.body.name)
    });
    // send response
    return res.status(201).json({success:true, results: Category});
})


//update category
export const updateCategory = asyncHandler(async (req ,res ,next) => {
    //check category
    const Category = await category.findById(req.params.categoryId)
    if (!Category) return next(new Error("category not found"));
    //check owner
    if (req.user._id.toString() !== brand.createdBy.toString())
        return next(new Error("You are not  authorized!"))
    //name
    Category.name = req.body.name ? req.body.name : Category.name;
    //slug
    Category.slug = req.body.name ? slugify(req.body.name) : Category.slug
//files
if (req.file) {
    const {secure_url, public_id} = await cloudnairy.uploader.upload(
        req.file.path,{
            public_id:Category.image.id
        }
    );
    Category.image.url = secure_url
}
//save category
await Category.save();

// send response
    return res.status(201).json({success:true});
})


// delete category
export const deleteCategory = asyncHandler(async (req ,res ,next) => {
    //check category
    const Category = await category.findById(req.params.categoryId);
    if (!Category) return next(new Error("invalid category Id!"));
        //check owner
    if (req.user._id.toString() !== brand.createdBy.toString())
        return next(new Error("You are not  authorized!"))
    //delete image
    const result = await cloudnairy.uploader.destroy(Category.image.id);
    console.log(result);

    //delete category
    await category.findByIdAndDelete(req.params.categoryId)

    //delete subcategories
    await subcategory.deleteMany({ categoryId: req.params.categoryId})

    return res.json({ success:true, message:"category deleted!"})
})


//get all categories
export const allCategories = asyncHandler(async(req,res,next) =>{
    const categories = await category.find().populate({
        path:"subcategory",
        populate: [{ path: "createdBy"}]
    });//nested populate
    return res.json({ success:true, results: categories})
})






