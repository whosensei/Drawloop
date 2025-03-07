import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8080});

/*
 decode the token first
get the used id
check the type of message first. Does the user want to join or leave or chat in the room
check which room is the user id connected to

*/

wss.on("connection",(socket)=>{
    socket.on("message", (data)=>{
        console.log("working");
        socket.send("pong");
    })
}
)