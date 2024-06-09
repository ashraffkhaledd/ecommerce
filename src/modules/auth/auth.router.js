import {Router} from "express"
import {isValid} from "../../middleware/validation.middleware.js"
import { ActivateSchema, RegisterSchema,LoginSchema,
    ForgetcodeShema,ResetPasswordSchema} from "./auth.validation.js"
import { ActivateAccount,Register,Login,sendForgetCode,resetPassword,allUsers
} from "./auth.controller.js"



const router = Router();

//docotr register
router.post("/register",isValid(RegisterSchema),Register);

//doctor activate account
router.get("/confirmEmail/:activationCode",isValid(ActivateSchema),ActivateAccount);

//docotr login
router.post("/login",isValid(LoginSchema),Login);

//send forget password code (for doctor)
router.patch("/forgetCode",isValid(ForgetcodeShema),sendForgetCode);


//Reset Passowrd (for doctor)
router.patch("/resetPassword",isValid(ResetPasswordSchema),resetPassword);


// get all users
router.get("/allUsers",allUsers)








export default router