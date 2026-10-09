import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,

    email: {
        type: String,
        required: true
    },
    password: String
})

const userModel = mongoose.model("userModel" , userSchema);

export default userModel;