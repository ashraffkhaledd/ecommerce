import {Router} from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validation.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { allCategories, creatCategory,deleteCategory,updateCategory} from "./category.controller.js";
import subcategoryRouter from "./../subcategory/subcategory.router.js"
import productRouter from "./../product/product.router.js"

const router = Router();

router.use("/:categoryId/subcategory", subcategoryRouter)
router.use("/:categoryId/products", productRouter)

//CRUD
// create category
router.post("/",
isAuthenticated,
isAuthorized("admin"),
fileUpload(filterObject.image).single("category"),  //form data
isValid(createCategorySchema),
creatCategory)


// update category
router.patch("/:categoryId",isAuthenticated,isAuthorized("admin"),fileUpload(filterObject.image).single("category"),
isValid(updateCategorySchema),updateCategory)


// delete category
router.delete("/:categoryId",isAuthenticated,isAuthorized("admin"),
isValid(deleteCategorySchema),deleteCategory)




// get allCategories
router.get("/", allCategories)






export default router;

