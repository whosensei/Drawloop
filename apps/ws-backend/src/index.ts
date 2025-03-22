import { WebSocketServer , WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config";
import { db } from "@repo/db";
import { chats } from "@repo/db/schema";

const wss = new WebSocketServer({port:8080});

/*
 decode the token first
get the user id
check the type of message first. Does the user want to join or leave or chat in the room
check which room is the user id connected to
*/

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
            console.log("Received message:", parsedData);

            switch(parsedData.type) {
                case "join":
                    if (!user.rooms.includes(parsedData.roomId)) {
                        user.rooms.push(parsedData.roomId);
                        console.log(`User ${userId} joined room ${parsedData.roomId}`);
                        
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
                    const { roomId, message } = parsedData;
                    
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