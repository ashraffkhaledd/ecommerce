import {Router} from "express"
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { addToCartSchema, removeProductFromCartSchema, updateCartSchema } from "./cart.validation.js";
import { addToCart, userCart,updateCart,removeProductFromCart,clearCart } from "./cart.controller.js";


const router = Router()

// CRUD
// add prouduct to cart
router.post("/",isAuthenticated,isValid(addToCartSchema),addToCart)

// user cart
router.get("/",isAuthenticated, userCart)


// update cart
router.patch("",isAuthenticated,isValid(updateCartSchema), updateCart);


// clear cart
router.put("/clear",isAuthenticated,clearCart);

// remove product from cart
router.patch("/:productId",
    isAuthenticated,
    isValid(removeProductFromCartSchema),
    removeProductFromCart ) // localhost:3000/cart/ haga dynamek y3ny momken tbaa clear ely t7t
    //f bdelhom ashan e2raa el haga el static el awl 
    // fe hal ani momken a8er el method nfsha put w patch



// clear cart
router.patch("/clear",isAuthenticated,clearCart);









export default router;