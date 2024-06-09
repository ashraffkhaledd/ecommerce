import mongoose, { Schema , model} from "mongoose"

//schema
const UserSchema = new Schema({
   UserName : {
      type: String,
      required:true,
      min:3,
      max:20 
   },
   email :{
      type: String,
      unique: true,
      required:true,
      lowercase:true
   },
   password: {
      type: String,
      required: true 
   },
   gender: {
      type: String,
      enum: ["Male","Female"]
   },
   phone:{
      type: String
   },
   birthday:Date,
   status: {
      type: String,
      enum: ["online","offline"],
      default:"offline"
   },
   isConfirmed:{
      type:Boolean,
      default:false
   },forgetCode:String,
   activationCode:String,
   role: {
      type: String,
      enum: ['admin','user'],// Specify possible roles
      default: "user"
      
   },
   profileImage:{
      url:{
      type:String,
      default:"https://res.cloudinary.com/dz8am1i8t/image/upload/v1709753928/Default_avatar_profile_icon_vector_image_on_VectorStock_fzu64z.jpg"
      },
      id:{
         type:String,
      default:"Default_avatar_profile_icon_vector_image_on_VectorStock_fzu64z"
      }
   },
   address: String,
   
   
},{timestamps : true})

//model
export const User = mongoose.models.User || model("User" , UserSchema)

