"use client"
import { useEffect, useRef, useState } from "react";
import {Canvas} from "./canvas"
// import { WebSocket } from "ws";
// import dotenv from "dotenv"

export default function RoomCanvas({roomId} :{roomId :string}){
    
    // dotenv.config({ path : "../../../.env"});
    const [socket,setsocket] = useState<WebSocket | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Mark that we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Only set up WebSocket on the client side
    useEffect(() => {
        if (!isClient) return;
        
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzQzOTMzODk3fQ.EB6gnTGP5VPFKrJiz4NUxS5nKGjDeAgPamIRS-zs6_k`)

        ws.onopen = () => {
            setsocket(ws)
            const data = JSON.stringify({
                type : "join",
                roomId
            })
            console.log(data)
            ws.send(data)
        }

        // Clean up websocket on unmount
        return () => {
            ws.close();
        };
    }, [isClient, roomId]);

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