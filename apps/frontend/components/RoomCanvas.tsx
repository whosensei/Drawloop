"use client"
import { useEffect, useRef, useState } from "react";
import {Canvas} from "./canvas"
import JoinRoom from "./joinRoom";
// import { WebSocket } from "ws";
// import dotenv from "dotenv"

export default function RoomCanvas({roomId} :{roomId :string}){
    
    // dotenv.config({ path : "../../../.env"});
    const [isClient, setIsClient] = useState(false);

    // Mark that we're on the client side

    const socket = JoinRoom(roomId)
    useEffect(() => {
        setIsClient(true);
    }, []);


    // Use a consistent initial UI for both server and client
    if(!isClient || !socket){
        return <div>
            Connecting to server...
        </div>
    }

    return (
        <div>
            <Canvas roomId = {roomId} socket = {socket}/>
        </div>
    )
}