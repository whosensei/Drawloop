"use client"
import { toast } from "./ui/use-toast"
import { useEffect, useState } from "react"


export default function JoinRoom(roomId: string) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    // const[shareRoom,setShareRoom] = useState(false)
    // const [url,setUrl] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({
                variant:"error",
                title:"User not signed in",
                description:"Redirecting to Sign-in"
            })
            const current_url = window.location.href;
            window.location.href = `/signin?redirectUrl=${encodeURIComponent(current_url)}`;
        
        }

        try {
            const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);

            ws.onopen = () => {
                setSocket(ws);
                
                const joinMessage = JSON.stringify({
                    type: "join",
                    roomId: roomId
                });
                
                ws.send(joinMessage);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            ws.onclose = () => {
                setSocket(null);
            };

            return () => {
                if (ws.readyState === WebSocket.OPEN) {
     
                    const leaveMessage = JSON.stringify({
                        type: "leave",
                        roomId: roomId
                    });
                    ws.send(leaveMessage);
                }
                ws.close();
            };
        } catch (error) {
            console.error("Failed to create WebSocket connection:", error);
        }
    }, [roomId]);

    return socket;
}

// Function to initiate WebSocket connection directly (for event handlers)
export function createSocketConnection(roomId: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem("token");
        if (!token) {
            reject(new Error("Authentication token not found"));
            return;
        }

        try {
            const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);

            ws.onopen = () => {

                const joinMessage = JSON.stringify({
                    type: "join",
                    roomId: roomId
                });
                
                ws.send(joinMessage);
                resolve(ws);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(error);
            };

            ws.onclose = () => {
                console.log("WebSocket connection closed");
            };
        } catch (error) {
            console.error("Failed to create WebSocket connection:", error);
            reject(error);
        }
    });
}