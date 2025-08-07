import { WebSocketServer , WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config";
import { db } from "@repo/db";
import { chats, Room } from "@repo/db/schema";
import * as dotenv from "dotenv";
import path from "path";
import { eq } from "drizzle-orm";

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const wss = new WebSocketServer({port: PORT});

interface User {
    ws :WebSocket,
    rooms : string[],
    id : string
}

const users : User[] = [];

function checkUser(token: string) {
    try{
        const decodedData =  jwt.verify(token,JWT_SECRET)

        if(typeof decodedData === "string"){
            return null;
        }

        if(!decodedData || !decodedData.id){
            return null;
        }
        return decodedData.id;
    }
    catch(err){
        console.log("token is invalid");
        return null;
    }
}

wss.on("connection",(ws,request)=>{
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);

    if(userId === null){
        ws.close();
        return;
    }

    const user: User = {
        ws,
        rooms: [],
        id: userId
    };
    users.push(user);

    console.log(`User ${userId} connected`);

    ws.on("message", async (msg) => {
        try {
            const parsedData = JSON.parse(msg.toString());
            const { roomId } = parsedData;
            console.log("Received message:", parsedData);

            switch(parsedData.type) {
                case "join":
                    if (!user.rooms.includes(parsedData.roomId)) {
                        user.rooms.push(parsedData.roomId);
                        console.log(`User ${userId} joined room ${parsedData.roomId}`);
                        // On join, send current room settings to the joining user.
                        try {
                            const room = await db.query.Room.findFirst({
                                where: eq(Room.id, Number(parsedData.roomId))
                            });

                            let bgColor = "#121212"; // default
                            try {
                                if (room?.roomSettings) {
                                    const roomSettings = JSON.parse(room.roomSettings || "{}");
                                    if (roomSettings && typeof roomSettings.selectedbgColor === "string" && roomSettings.selectedbgColor.trim().length > 0) {
                                        bgColor = roomSettings.selectedbgColor;
                                    } else {
                                        // Persist default if empty
                                        await db.update(Room)
                                            .set({ roomSettings: JSON.stringify({ selectedbgColor: bgColor }) })
                                            .where(eq(Room.id, Number(parsedData.roomId)));
                                    }
                                } else {
                                    await db.update(Room)
                                        .set({ roomSettings: JSON.stringify({ selectedbgColor: bgColor }) })
                                        .where(eq(Room.id, Number(parsedData.roomId)));
                                }
                            } catch (e) {
                                console.warn("Failed to parse room settings; defaulting", e);
                                await db.update(Room)
                                    .set({ roomSettings: JSON.stringify({ selectedbgColor: bgColor }) })
                                    .where(eq(Room.id, Number(parsedData.roomId)));
                            }

                            const settingsMessage = JSON.stringify({
                                type: "settings",
                                roomId: parsedData.roomId,
                                data: { selectedbgColor: bgColor }
                            });
                            ws.send(settingsMessage);
                        } catch (e) {
                            console.error("Error loading/sending room settings on join:", e);
                            ws.send(JSON.stringify({
                                type: "settings",
                                roomId: parsedData.roomId,
                                data: { selectedbgColor: "#121212" }
                            }));
                        }
                        // Notify other users in the room
                        const joinMessage = JSON.stringify({
                            type: "user_joined",
                            roomId: parsedData.roomId,
                            userId: user.id
                        });
                        
                        users.forEach(u => {
                            if (u.rooms.includes(parsedData.roomId)) {
                                u.ws.send(joinMessage);
                            }
                        });
                    }
                    break;

                case "leave":
                    user.rooms = user.rooms.filter(room => room !== parsedData.roomId);
                    console.log(`User ${userId} left room ${parsedData.roomId}`);
                    break;

                case "chat":
                    const { message } = parsedData;
                    
                    // Store message in database
                    try {
                        await db.insert(chats).values({
                            roomId: Number(roomId),
                            userId: Number(userId),
                            message
                        });
                        console.log(`Message stored in database for room ${roomId}`);
                    } catch (error) {
                        console.error("Error storing message:", error);
                        return;
                    }

                    // Broadcast message to all users in the room
                    const messageToSend = JSON.stringify({
                        type: "chat",
                        message,
                        roomId,
                        userId
                    });

                    users.forEach(user => {
                        if (user.rooms.includes(roomId)) {
                            try {
                                user.ws.send(messageToSend);
                                console.log(`Message sent to user ${user.id} in room ${roomId}`);
                            } catch (error) {
                                console.error(`Error sending message to user ${user.id}:`, error);
                            }
                        }
                    });
                    break;

                case "settings" :
                    const { selectedbgColor } = parsedData.data;
                    console.log("ws-backend settings")
                      // Broadcast to other users in the room
                    try{
                        await db.update(Room).set({roomSettings: JSON.stringify({selectedbgColor})})
                        .where(eq(Room.id, Number(roomId)));

                        console.log("Entry added to db")
                    }catch(e){
                        console.log("Db update failed")
                        console.log(e)
                    }

                    const settingsMessage = JSON.stringify({
                        type: "settings",
                        roomId: parsedData.roomId,
                        data: {
                            selectedbgColor: selectedbgColor
                        }
                    });

                    users.forEach(u => {
                        if (u.rooms.includes(parsedData.roomId) && u.id !== userId) {
                            try {
                                console.log("msg sent")
                                u.ws.send(settingsMessage);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    });
                    break;

                default:
                    console.log("Unknown message type:", parsedData.type);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        const index = users.findIndex(u => u.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
            console.log(`User ${userId} disconnected`);
        }
    });

    ws.on("error", (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
    });
});