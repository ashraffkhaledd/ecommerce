import authRouter from "./modules/auth/auth.router.js"
import categoryRouter from "./modules/category/category.router.js"
import subcategoryRouter from "./modules/subcategory/subcategory.router.js"
import brandRouter from "./modules/brand/brand.router.js"
import productRouter from "./modules/product/product.router.js"
import couponRouter from "./modules/coupon/coupon.router.js"
import cartRouter from "./modules/cart/cart.router.js"
import orderRouter from "./modules/order/order.router.js"
import reviewRouter from "./modules/review/review.router.js"
import morgan from "morgan"

export const appRouter = (app,express)=>{
    //morgan
    if(process.env.NODE_ENV === "dev")
    app.use(morgan("common"));

    //Global middleware
    app.use((req,res,next)=>{
        // req.originalUrl'
        if (req.originalUrl === "/order/webhook"){
            return next();
        }
        express.json()(req,res,next)
    }); //parse "req.body" buffer to json 
    //routes
    // auth
    app.use("/auth",authRouter);
    // catogory
    app.use("/category",categoryRouter);

    //subcategory
    app.use("/subcategory", subcategoryRouter);

    //brand
    app.use("/brand",brandRouter);

    //product
    app.use("/product" , productRouter);

    //coupon
    app.use("/coupon", couponRouter);

    //cart
    app.use ("/cart",cartRouter);

    //order
    app.use ("/order",orderRouter);

    //review
    app.use ("/review" , reviewRouter); 

    //not found page router
    app.all("*",(req,res,next)=>{
        return next(new Error("Page not found!",{cause:404}))});
    
    //global error handler
    app.use((error,req,res,next)=>{
        return res.status(error.cause|| 500).json({success:false, message:error.message, stack:error.stack});
    })    
}