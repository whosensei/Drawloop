// import { NextFunction } from "express";
// import jwt from "jsonwebtoken";

// export default function middleware(req :Request,res :Response,next :NextFunction) {
//     // const token = req.headers["authorization"];

//         // const tokencheck = jwt.verify(token,JWT_SECRET);
//         if(!tokencheck){
//             res.status(401).json({
//                 message:"Unauthorized"
//             })
//         }
//         else{
//             req.UserId = tokencheck.UserId;
//             next();
//         }
//     }
// }