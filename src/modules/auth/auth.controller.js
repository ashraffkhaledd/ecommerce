import { asyncHandler } from "../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import {sendEmail} from "../../utils/sendEmails.js";
import {resetPassTemp, signUpTemp} from "../../utils/generateHTML.js";
import jwt from "jsonwebtoken";
import { Token } from "../../../DB/models/token.model.js";
import randomstring from "randomstring";
import { User } from "../../../DB/models/user.model.js";
import { Cart } from "../../../DB/models/cart.model.js";
// register
export const Register = asyncHandler(async(req,res,next)=>{
    
    //data from request
    const {UserName,email,password,gender,phone} = req.body
    //check user existence
    const isUser = await User.findOne({email})
    if(isUser) return next(new Error("Email already registered!",{cause: 409}))
    //hash password
    const hashPassword = bcryptjs.hashSync(password,Number(process.env.SALT_ROUND))
    //generate activationCode
    const activationCode = crypto.randomBytes(64).toString("hex")

    // create doctor
    const user = await User.create({UserName,email,password:hashPassword,activationCode,
        gender,phone})
    //create confirmationlink
    const link = `http://localhost:3000/auth/confirmEmail/${activationCode}`

    //send email
    const isSent = await sendEmail({to: email, subject: "Activate Account", html: signUpTemp(link)})

    //send response

    return isSent ? res.json({success:true , message:"Please review your email!"}) : next(new Error("Somthing went wrong!"))

})

// activationAccount
export const ActivateAccount = asyncHandler(async(req,res,next)=>{
    
    //find user , delete the activation code , update isComfirmed
    const user = await User.findOneAndUpdate({activationCode:req.params.activationCode},
        {isConfirmed:true,$unset:{activationCode: 1}},{new:true})
    
    //check if the user doesnt exist
    if(!user) {return next(new Error("User not found!"),{cause:400})}
    // create a cart 
    await Cart.create({ user: user._id});
    //res
    return res.send("Congratulations,your account is now activated!,try to login now")  //redirect to login page
})

//login
export const Login = asyncHandler(async (req,res,next) => {
    //data from requests
    const {email,password} = req.body;
    //check user existence
    const user = await User.findOne({email});
    if(!user) return next(new Error("Invalid Email!",{cause:400}));

    //check isConfirmed
    if(!user.isConfirmed) return next(new Error("Unactivated account!" , {cause:400}));

    // check password
    const match = bcryptjs.compareSync(password, user.password);
    if(!match) return next(new Error("Invalid Password!",{cause:400}));

    //generate token 
    const token = jwt.sign({id: user._id, email:user.email},process.env.TOKEN_KEY,
        {
            expiresIn: "2d",
        });
    //save token in token model
    await Token.create({
        token,
        user:user._id,
        agent: req.headers["user-agent"],

    });
    //change user status to online and save patient
    user.status = "online";
    await user.save();
    //send response
    return res.json({ success: true, results: token});    
})

//send forget code (for doctor)
export const sendForgetCode = asyncHandler(async(req,res,next)=>{

    //check user (doctor)
    const user = await User.findOne({email: req.body.email})
    if(!user) return next(new Error("Invalid email!"));
    
    //generate code
    const code = randomstring.generate({
        length:5,
        charset: "numeric",
    });

    // save code in db
    user.forgetCode = code;
    await user.save();

    //send email
    return await sendEmail({to: user.email, subject: "reset password",html: resetPassTemp(code)})
    ? res.json({success: true,message: "check your email"}) : next(new Error("somthing went wrong!"));
});

//resetpassword
export const resetPassword = asyncHandler(async(req,res,next)=>{
    //check user
    let user = await User.findOne({email:req.body.email});
    if(!user) return next(new Error("Invalid Email"));

    // check code
    if(user.forgetCode !== req.body.forgetCode)
        return next(new Error("Invalid code!"));

        user = await User.findOneAndUpdate({email:req.body.email}, {$unset: { forgetCode: 1}});

        user.password = bcryptjs.hashSync(
        req.body.password,
        Number(process.env.SALT_ROUND)
    );

    await user.save();

    //invalidate tokens    //logout from all devices
    const tokens = await Token.find({user:user._id});

    tokens.forEach(async (token)=>{
        token.isValid = false;
        await token.save();
    });

    // send response
    return res.json({ success: true, message: "try to login!"});
})

// get all users
export const allUsers = asyncHandler(async(req,res,next)=>{
    const users = await User.find();
    return res.json({ success: true, results: users});
});





