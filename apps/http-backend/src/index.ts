import express, { Request, Response } from "express";
import { SigninSchema, SignupSchema } from "@repo/common/zod";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { db } from "@repo/db";
import { User, Room } from "@repo/db/schema";
import middleware from "./middleware";
import { eq } from "drizzle-orm";
const app = express();

app.use(express.json());

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
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

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

    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
      return;
    }

    if (user?.password !== parsedData.data.password) {
      res.status(400).json({
        message: "Incorrect password",
      });
      return;
    }
    const token = jwt.sign({ id: user?.id }, JWT_SECRET);
    res.status(200).json({
      message: "User successfully signed in",
      token: token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/create-room",middleware,async(req : Request,res :Response)=>{
  //@ts-ignore

  console.log("authorised");
  //@ts-ignore
  const userId = req.userId;
  const roomId = Math.floor(Math.random() * 1000) + 1
  const roomName = `room${roomId}`

  await db.insert(Room).values({
    id :roomId,
    name : roomName,
    adminId : userId
  })
  res.status(200).json({
    message:"Room created successfully",
    roomId : roomId,
    name : roomName
  })
  return;
})

app.listen(3002, () => {
  console.log("server started on port 3002");
});

