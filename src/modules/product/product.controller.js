import { Brand } from "../../../DB/models/brand.model.js";
import { category } from "../../../DB/models/category.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { subcategory } from "../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import {nanoid} from "nanoid";

// create product
export const addProduct = asyncHandler(async(req,res,next)=>{
    //data 
    //const {name, description, price, discount, avaliableItems, category, subcategory, brand} = req.body;
    // check category
    const Category = await category.findById(req.body.category);
    if(!Category) return next(new Error("Category not found!"))
    
    // check subcategory
    const Subcategory = await subcategory.findById(req.body.subcategory);
    if(!Subcategory) return next(new Error("subcategory not found!"))
    // files
    if(!req.files)
        return next(new Error("product images are required!" , { cause: 400 }));

    // check brand
    const brand = await Brand.findById(req.body.brand);
    if(!brand) return next(new Error("brand not found!"));

    //create unique folder name
    const cloudFolder = nanoid();
    let images = [];
    // upload sub filles
    for (const file of req.files.subImages) { // it is a field name used in the file upload process.
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            { folder:`${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}`}
        );
        images.push({ id: public_id, url: secure_url});
    }

    // upload default image
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.files.defaultImage[0].path,
            { folder:`${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}`}
        );


        //create product
        const product = await Product.create({
            ...req.body,
            cloudFolder,
            createdBy: req.user._id,
            defaultImage: { url: secure_url, id: public_id},
            images, //[{id: , url: },{id: , url: },{id: , url: }]
        });


// send response
return res.status(201).json({ success: true, results:product})





    
});


// delete product
export const deleteProduct = asyncHandler(async(req,res,next)=>{
    //check product
    const product = await Product.findById(req.params.productId);
    if (!product) return next(new Error("Product not found!"));
    // check owner
    if (req.user._id.toString() != product.createdBy.toString())
        return next(new Error("Not authorized", { cause: 401 }))
    const imagesArr = product.images //[{id: , url},{id: , url}]
    const ids = imagesArr.map((imageObj)=> imageObj.id);
    ids.push(product.defaultImage.id); //add id of default image

    //delete images
    const result = await cloudinary.api.delete_resources(ids);
    //delete folder >>>> the folder must be empty so you can use that method
    await cloudinary.api.delete_folder(`${process.env.FOLDER_CLOUD_NAME}/products/${product.cloudFolder}`);

    // delete product from DB
    await Product.findByIdAndDelete(req.params.productId);

    //send response
    return res.json({ success: true, message: "product deleted successfully!"})
});



// all products
export const allProducts = asyncHandler(async(req,res,next)=>{
    if(req.params.categoryId){
        const Category = await category.findById(req.params.categoryId);
        if (!Category) 
            return next(new Error("Category not found!", { cause: 404 }));

        const products = await Product.find({ category: req.params.categoryId });
        return res.json({ success: true, results: products});
    }


    // filter pagination selection sort
const products = await Product.find({...req.query})
.pagination(req.query.page)
.customSelect(req.query.fields)
.sort(req.query.sort);
    return res.json({ success: true, results: products});
});

// read all products of certain category





// single product
export const singleProduct = asyncHandler(async(req,res,next)=>{
    const product = await Product.findById(req.params.productId);
    if(!product) return next(new Error("Product not found!"));
    return res.json({ success: true, result: product});
})

