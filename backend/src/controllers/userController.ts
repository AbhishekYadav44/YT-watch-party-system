import dotenv from 'dotenv';
dotenv.config();
import userModel from "../models/usermodel.js";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'
import { z } from "zod"

const jwt_secret = process.env.JWT_SECRET!;


export async function signupController(req: Request, res: Response) {
    console.log("hi there")
    try {
        const { username, email, password } = req.body;

        const requiredbody = z.object({
            username: z.string(),
            email: z.string(),
            password: z.string()
        })

        const parsedbody = requiredbody.safeParse(req.body);
        if (!parsedbody.success) {
            return res.json({
                message: "Incorrect format",
            })
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({
                messsage: "user already exist!"
            })
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const newuser = await userModel.create({
            username: username,
            email: email,
            password: hashedpassword
        })

        console.log(newuser);
        res.status(200).json({
            message: "user created!"
        })
    } catch (e) {
        console.log(e)
        return res.json({
            message: "err while creating user"
        })
    }


}

export async function signinController(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const requiredbody = z.object({
            email: z.string(),
            password: z.string()
        })

        const parsedbody = requiredbody.safeParse(req.body);
        if (!parsedbody.success) {
            return res.json({
                message: "Incorect format!"
            })
        }

        const user = await userModel.findOne({ email })
        if (!user || !user.password) {
            return res.json({
                message: " user not exist!"
            })
        }

        const ispasswordMatched = await bcrypt.compare(password, user?.password)
        if (ispasswordMatched) {
            const token = jwt.sign({ id: user._id }, jwt_secret)
            res.json({
                message: "user succesfully logged in ",
                token
            })
        } else {
            return res.json({
                message: "Wrong PAssword!"
            })
        }


    } catch (e) {
        console.log(e)
        return res.json({
            message: "err while login user"
        })
    }
}