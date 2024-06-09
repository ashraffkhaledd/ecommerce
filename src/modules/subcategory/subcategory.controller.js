import { asyncHandler } from "../../utils/asyncHandler.js";
import { category } from "../.././../DB/models/category.model.js"
import cloudnairy from "../../utils/cloud.js";
import { subcategory } from "../../../DB/models/subcategory.model.js";
import slugify from "slugify";
// create category
export const createSubcategory = asyncHandler(async(req,res,next)=>{
    // categoryId ?? params
    const { categoryId } = req.params;
    
    //check file
    if (!req.file) return next(new Error("Image is required!" , { cause: 400 }));

    // check category
    const Category = await category.findById(categoryId);
    if (!Category) return next(new Error("Category not found!" , { cause: 404 }));

    // upload file
    const { public_id, secure_url} = await cloudnairy.uploader.upload(
        req.file.path,
        {
            folder: `${process.env.FOLDER_CLOUD_NAME}/subcategory`,
        }
    );

    //save in database
    const Subcategory = await subcategory.create({
        name: req.body.name,
        slug: slugify(req.body.name),
        createdBy: req.user._id,
        image: {id: public_id, url: secure_url},
        categoryId
    });

    return res.json({ success: true, results:Subcategory })
});

// update saubcategory
export const updateSubcategory = asyncHandler(async(req,res,next)=>{
    // check category
    const Category = await category.findById(req.params.categoryId);
    if (!Category) return next(new Error("Category not found!" , { cause: 404 }));
    // check subcategory
    const Subcategory = await subcategory.findOne({
        _id: req.params.subcategoryId,
        categoryId: req.params.categoryId
    });
    if (!Subcategory) return next(new Error("subcategory not found!" , { cause: 404 }));
    //check owner
    if (req.user._id.tostring() !== Subcategory.createdBy.tostring())
        return next(new Error("You are not authrized!"))


    Subcategory.name = req.body.name ? req.body.name : Subcategory.name;
    Subcategory.slug = req.body.name ? slugify(req.body.name) : Subcategory.slug;

    //file
    if(req.file){
        const {secure_url, public_id} = await cloudnairy.uploader.upload(
            req.file.path,{
                public_id:Subcategory.image.id
            }
        );
        Subcategory.image.url = secure_url
    }
    
    await Subcategory.save();
    return res.json({success: true, message:"updated successfully!", results:Subcategory})

});


//delete subcategory
export const deleteSubcategory = asyncHandler(async(req,res,next)=>{
    // check category
    const Category = await category.findById(req.params.categoryId);
    if (!Category) return next(new Error("Category not found!" , { cause: 404 }));
    // check subcategory and delete
    const Subcategory = await subcategory.findOneAndDelete({
        _id: req.params.subcategoryId,
        categoryId: req.params.categoryId
    });
    //check owner
    if (req.user._id.toString() !== brand.createdBy.toString())
    return next(new Error("You are not  authorized!"))
    if (!Subcategory) return next(new Error("subcategory not found!" , { cause: 404 }));
    return res.json({success: true, message:"deleted successfully!"})

});

// all subcategories

export const allSubcategories = asyncHandler(async(req,res,next)=>{
    const subcategories = await subcategory.find().populate("categoryId");
    
    return res.json({ success: true, results: subcategories});
})