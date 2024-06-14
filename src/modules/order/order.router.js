import {isAuthenticated} from "../../middleware/authentication.middleware.js";
import { Router } from "express";
import { cancelOreder, createOrder,orderWebhook } from "./order.controller.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import express from "express"
const router = Router();

//create order
router.post("/", isAuthenticated, isValid(createOrderSchema) ,createOrder)

// cancel order
router.patch("/:orderId", isAuthenticated, isValid(cancelOrderSchema),cancelOreder)



// webhook end >>>stripe


router.post('/webhook', express.raw({type: 'application/json'}), orderWebhook);








(request, response) => {
    // This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_e1cb1f182d317e0a4609e5a0fc844e6a6617659dd8d8216cf779dce7c5b83495";

const sig = request.headers['stripe-signature'];

let event;

try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
} catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
}

  // Handle the event
switch (event.type) {
    case 'checkout.session.async_payment_failed':
    const checkoutSessionAsyncPaymentFailed = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_failed
    break;
    case 'checkout.session.async_payment_succeeded':
    const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
    break;
    case 'checkout.session.completed':
    const checkoutSessionCompleted = event.data.object;
      // Then define and call a function to handle the event checkout.session.completed
    break;
    case 'checkout.session.expired':
    const checkoutSessionExpired = event.data.object;
      // Then define and call a function to handle the event checkout.session.expired
    break;
    // ... handle other event types
    default:
    console.log(`Unhandled event type ${event.type}`);
}

  // Return a 200 response to acknowledge receipt of the event
response.send();
};




export default router;