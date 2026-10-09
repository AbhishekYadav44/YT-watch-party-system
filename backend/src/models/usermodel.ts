import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,

    email: {
        type: String,
        required: true
    },
    password: String
})

const user = mongoose.model("User" , userSchema);

export default user;