import joi from "joi"
//doctor register
export const RegisterSchema = joi.object({
    UserName: joi.string().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword:joi.string().valid(joi.ref("password")).required(),
    gender: joi.string().required(),
    phone: joi.string().required(),
    birthday: joi.string().required()
}).required() 

//doctor activation 

export const ActivateSchema = joi.object({
    activationCode: joi.string().required()
}).required()

//doctor login
export const LoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
})
.required();

// send forget code (for doctor)
export const ForgetcodeShema = joi.object({
    email: joi.string().email().required(),
})

//reset password  (for doctor)
export const ResetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    forgetCode: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
}).required()