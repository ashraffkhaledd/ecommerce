import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { createSubCategorySchema, deleteSubcategorySchema, updateSubcategorySchema } from "./subcategory.validation.js";
import { allSubcategories, createSubcategory, deleteSubcategory, updateSubcategory } from "./subcategory.controller.js";
const router = Router({ mergeParams:true });


// CRUD
//create subcategory
router.post(
    "/",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload(filterObject.image).single("subcategory"),
    isValid(createSubCategorySchema),
    createSubcategory
)

//update subcategory
router.patch(
    "/:subcategoryId",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload(filterObject.image).single("subcategory"),
    isValid(updateSubcategorySchema),
    updateSubcategory
)


// delete subcategory
router.delete("/:subcategoryId",isAuthenticated,isAuthorized("admin"),isValid(deleteSubcategorySchema),deleteSubcategory)




//get all subcategorties (Read)
router.get("/",allSubcategories)






export default router;