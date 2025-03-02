import express, { Request, Response } from "express";
import {SigninSchema, SignupSchema} from "@repo/common/zod";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { db } from "@repo/db";
import { User } from "@repo/db/schema";

const app = express();

app.use(express.json());


app.post("/signup", async (req: Request, res: Response) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.status(400).json({
            message: "Invalid credentials"
        });
        return;
    }
    try {
        await db.insert(User).values({
            email: parsedData.data.email,
            username: parsedData.data.username,
            password: parsedData.data.password
        });
        res.status(200).json({
           message: "User successfully signed up"
       });
        
    } catch (error) {
        console.log(error)
    }
});

app.get("/hello",(req,res)=>{
    res.json({
        message:"hello world"
    }) 
});
app.listen(3002,()=>
{
    console.log("server started on port 3002")
});







// app.post("signin",(req,res)=>{
//     const ParsedData = SigninSchema.safeParse(req.body);
//     if(!ParsedData.success){
//         console.log(ParsedData.error);
//         res.status(400).json({
//             message:"invalid credentials"
//         })
//         return;
//     }

//     //db call to check
//     //if exists then find the user id and generate the token
    
//     // const token = jwt.sign(UserId , process.envv.JWT_SECRET);
//     res.json({
//         message:"user successfully signed up"
//     })


// })

// // app.post("create-room",middleware,(req,res)=>{

// // })
