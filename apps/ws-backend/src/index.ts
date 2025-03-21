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
        const decodedData =  jwt.verify(token,JWT_SECRET) as {id :string}
        return decodedData.id;
        }
    catch(err){
        console.log("token is invalid");
    }
}
wss.on("connection",(ws,request)=>{
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);        ///global userId variable 

    if(userId){
        users.push({
            ws,
            rooms:[],
            id : userId
        })
    }else{
        ws.close();
        return null;
    }

    ws.on("message",async(msg)=>{

        let parsedData;
        if(typeof parsedData !== "string"){
            parsedData = JSON.parse(msg.toString());
        }else{
            parsedData = JSON.parse(parsedData);
        }

        if(parsedData.type === "join"){
            const user = users.find(user=>user.ws === ws);
            if(user){
                user.rooms.push(parsedData.roomId);
                console.log("user joined the room",parsedData.roomId);
            }
        }
         if(parsedData.type === "leave"){
            const user = users.find(user=>user.ws === ws);
            if(user){
                user.rooms = user.rooms.filter(room=> room === parsedData.room)
                console.log("user left the room",parsedData.roomId);
            }
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            await db.insert(chats).values({
                roomId : Number(roomId),
                userId: Number(roomId),
                message
            })

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type : "chat",
                        message : message,
                        roomId
                    }))
                }
            })
        }
    })
})