import express, { Request, Response } from "express";
import { CreateRoomSchema, SigninSchema, SignupSchema } from "@repo/common/zod";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { db } from "@repo/db";
import { User, Room, chats, userRooms } from "@repo/db/schema";
import middleware from "./middleware";
import { eq, desc } from "drizzle-orm";
const app = express();
import cors from "cors"
import { log } from "console";

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
      res.status(401).json({
        message: "User not found",
      });
      return;
    }
    if (user?.password !== parsedData.data.password) {
      res.status(402).json({
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
  try {
    //@ts-ignore
    console.log("authorised");
    const parsedData = CreateRoomSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      res.status(400).json({
        message: "Invalid room data"
      });
      return;
    }
    //@ts-ignore
    const userId = req.userId;
    const roomId = Math.floor(Math.random() * 1000) + 1
    
    const roomName = parsedData.data.name

    await db.insert(Room).values({
      id: roomId,
      name: roomName,
      adminId: userId,
    })
    
    // Add the user to the room as well
    await db.insert(userRooms).values({
      userId: userId,
      roomId: roomId
    })
    
    res.status(200).json({
      message: "Room created successfully",
      id: roomId,
      name: roomName,
      adminId: userId,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create room"
    });
  }
})

app.delete("/delete-room/:roomId", middleware, async(req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.roomId || '0');
    //@ts-ignore
    const userId = req.userId;
    
    if (isNaN(roomId)) {
      res.status(400).json({ 
        message: 'Invalid room ID format'
      });
      return;
    }
    
    // Delete the user-room association (not the room itself)
    await db.delete(userRooms)
      .where(
        eq(userRooms.userId, userId) && 
        eq(userRooms.roomId, roomId)
      );
    
    res.status(200).json({
      message: "Successfully left the room"
    });
  } catch (error) {
    console.error("Error leaving room:", error);
    res.status(500).json({
      message: "Failed to leave room"
    });
  }
})

app.get("/rooms", middleware, async(req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.userId;
    
    // Get rooms where the user is a member
    const userRoomEntries = await db.select({
      roomId: userRooms.roomId
    })
    .from(userRooms)
    .where(eq(userRooms.userId, userId));
    
    if (userRoomEntries.length === 0) {
      res.status(200).json({
        rooms: []
      });
      return;
    }
    
    const roomIds = userRoomEntries.map(entry => entry.roomId);
    
    // Get the full room details
    const rooms = await db.select()
      .from(Room)
      .where(
        // Check if room.id is in the array of roomIds
        // This is a simplification - you might need a different approach 
        // depending on your SQL dialect
        // Using "in" operator would be better, but for simplicity we'll use this
        roomIds.map(id => eq(Room.id, id)).reduce((prev, curr) => prev || curr)
      );
    
    res.status(200).json({
      rooms
    });
  } catch(error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      message: "Failed to fetch rooms"
    });
  }
});

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


app.delete("/chats/:roomId" ,async(req:Request,res:Response)=>{
  try{

    const roomId = req.params.roomId

    if (isNaN(Number(roomId))) {
      res.status(400).json({ 
        message: 'Invalid room ID format' ,
        roomId
      });
    }else{

    await db.delete(chats).where(eq(chats.roomId,Number(roomId)))
    res.status(200).json({
      message:"Canvas cleared"
    })
  }
}catch(error){
    res.status(500).json({
      message : "failed to clear canvas"
    })
  }
})

// New endpoint to add a user to a room
app.post("/add-user-to-room", middleware, async(req: Request, res: Response): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.userId;
    const roomId = parseInt(req.body.roomId);
    
    if (isNaN(roomId)) {
        res.status(400).json({
        message: "Invalid room ID format"
      });
      return;
    }
    
    // Check if the room exists
    const roomExists = await db.query.Room.findFirst({
      where: eq(Room.id, roomId)
    });
    
    if (!roomExists) {
        res.status(404).json({
        message: "Room not found"
      });
      return;
    }
    
    // Check if the user is already in the room
    const userInRoom = await db.select()
      .from(userRooms)
      .where(
        eq(userRooms.userId, userId) && 
        eq(userRooms.roomId, roomId)
      );
    
    if (userInRoom.length > 0) {
        res.status(200).json({
        message: "User already in room",
        alreadyJoined: true
      });
      return;
    }
    
    // Add user to room
    await db.insert(userRooms).values({
      userId: userId,
      roomId: roomId
    });
    
    // Update room member count if needed
    if (roomExists.members !== null) {
      await db.update(Room)
        .set({ members: (roomExists.members + 1) })
        .where(eq(Room.id, roomId));
    } else {
      // If members is null, initialize it to 1
      await db.update(Room)
        .set({ members: 1 })
        .where(eq(Room.id, roomId));
    }
    
    res.status(200).json({
      message: "Successfully joined room",
      roomName: roomExists.name
    });
    return;
    
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({
      message: "Failed to join room"
    });
    return;
  }
});

app.listen(3002, () => {
  console.log("server started on port 3002");
});

