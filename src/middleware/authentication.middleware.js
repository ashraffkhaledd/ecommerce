import {asyncHandler} from "./../utils/asyncHandler.js"
import {Token} from "./../../DB/models/token.model.js"
import{User} from "./../../DB/models/user.model.js"
import jwt from 'jsonwebtoken';
export const isAuthenticated = asyncHandler(async(req,res,next) =>{
    
    //check token existence and type
    let token = req.headers["token"];
    if(!token || !token.startsWith(process.env.BEARER_KEY))
    return next(new Error("Valid token is required!",400));
    //check payload
    token = token.split(process.env.BEARER_KEY)[1];
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if(!decoded) return next(new Error("Invalid token!"));
    //check token in DB
    const tokenDB = await Token.findOne({token, isValid: true});
    if(!tokenDB) return next(new Error("Token expired!"));
    //check user existence
    const user = await User.findOne({email:decoded.email});
    if(!user) return next(new Error("user not found!"));
    //pass user
    req.user = user;
    //return next
    
    return next();
});