import { Router } from "express";
import {isAuthenticated} from "../../middleware/authentication.middleware.js";
import {isAuthorized} from "../../middleware/authorization.middleware.js";
import {fileUpload, filterObject} from "../../utils/multer.js";
import { createProductSchema,deleteProductSchema, singleProductSchema } from "./product.validation.js";
import { addProduct,allProducts,deleteProduct,singleProduct } from "./product.controller.js";
import { isValid } from "../../middleware/validation.middleware.js";

const router = Router({ mergeParams:true });

//crud

//create product
router.post(
"/", 
isAuthenticated,
isAuthorized("admin"),
fileUpload(filterObject.image).fields([    //fields>>>>>When you have multiple file inputs in your form, each with a unique name and possibly different maximum file counts.
    { name: "defaultImage", maxCount: 1 }, //ashan ha5od mgmo3ten mn el sor
    { name: "subImages", maxCount: 3},
]),
isValid(createProductSchema),
addProduct
)

//delete product
router.delete(
    "/:productId", 
    isAuthenticated,
    isAuthorized("admin"),
    isValid(deleteProductSchema),
    deleteProduct
    )

// get all products  && products of a certain category
router.get("/",allProducts)


// single product 
router.get("/single/:productId",isValid(singleProductSchema) ,singleProduct);


export default router;