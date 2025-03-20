import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config";
const wss = new WebSocketServer({port:8080});

/*
 decode the token first
get the user id
check the type of message first. Does the user want to join or leave or chat in the room
check which room is the user id connected to

*/
function checkuser(token: string) {
    const decodedData =  jwt.verify(token,JWT_SECRET)
    if(decodedData.success){
        return decodedData.id;
    }
}
wss.on("connection",(socket)=>{
    socket.on("message", (data)=>{
        console.log("working");
        socket.send("pong");
    })
}
)