import {isAuthenticated} from "../../middleware/authentication.middleware.js";
import { Router } from "express";
import { cancelOreder, createOrder } from "./order.controller.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
const router = Router();

//create order
router.post("/", isAuthenticated, isValid(createOrderSchema) ,createOrder)

// cancel order
router.patch("/:orderId", isAuthenticated, isValid(cancelOrderSchema),cancelOreder)




export default router;