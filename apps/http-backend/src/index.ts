import express, { Request, Response } from "express";
import { SigninSchema, SignupSchema } from "@repo/common/zod";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { db } from "@repo/db";
import { User, Room ,chats} from "@repo/db/schema";
import middleware from "./middleware";
import { eq,desc} from "drizzle-orm";
const app = express();
import cors from "cors"

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

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

app.get("/chats/:roomId", async(req:Request , res : Response)=>{

  const roomId = req.params.roomId;
  const messages = await db.query.chats.findMany({
    where : eq(chats.roomId,Number(roomId)),
    orderBy : [desc(chats.createdAt)],
    limit : 100
  })
  res.json({
    messages
  })
})

app.get("/room/:slug",async(req:Request,res:Response)=>{
  const slug  = req.params.slug;

  const roomId = await db.query.Room.findFirst({
    where : eq(Room.slug,slug ?? "")
  })

  res.json({
    roomId
  })
})

app.listen(3002, () => {
  console.log("server started on port 3002");
});

