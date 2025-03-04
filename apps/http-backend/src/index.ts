import express, { Request, Response } from "express";
import { SigninSchema, SignupSchema } from "@repo/common/zod";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { db } from "@repo/db";
import { User } from "@repo/db/schema";
import { eq } from "drizzle-orm";
const app = express();

app.use(express.json());

app.post("/signin", async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    res.status(400).json({
      message: "invalid format",
    });
    return;
  }
  try {
    const user = await db.query.User.findFirst({
      where: eq(User.email, parsedData.data.email),
    });

    console.log("The email found is ", user?.email);

    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
    }
    console.log(user?.password);
    console.log(parsedData.data.password);

    if (user?.password !== parsedData.data.password) {
      res.status(400).json({
        message: "Incorrect password",
      });
    }
    const token = jwt.sign(parsedData.data.email, JWT_SECRET);
    console.log(token);

    res.status(200).json({
      message: "User sucessfully signed up",
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3002, () => {
  console.log("server started on port 3002");
});

// // app.post("create-room",middleware,(req,res)=>{

// // })

app.post("/signup", async (req: Request, res: Response) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.status(400).json({
            message: "Invalid credentials",
        });
        return;
    }
    try {
        await db.insert(User).values({
            email: parsedData.data.email,
            username: parsedData.data.username,
            password: parsedData.data.password,
        });
        res.status(200).json({
            message: "User successfully signed up",
        });
    } catch (error) {
        console.log(error);
    }
});
