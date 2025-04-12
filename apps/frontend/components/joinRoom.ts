"use client"

import { useEffect, useState } from "react"

// Original JoinRoom hook for use in components that need the socket
export default function JoinRoom(roomId: string) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Authentication token not found");
            return;
        }

        try {
            // Create WebSocket connection with token for authentication
            const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);

            // Handle connection open
            ws.onopen = () => {
                setSocket(ws);
                
                // Send join message to the server
                const joinMessage = JSON.stringify({
                    type: "join",
                    roomId: roomId
                });
                
                ws.send(joinMessage);
            };

            // Handle errors
            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            // Handle connection close
            ws.onclose = () => {
                setSocket(null);
            };

            // Cleanup on component unmount
            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    // Send leave message before closing
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
            // Create WebSocket connection with token for authentication
            const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);

            // Handle connection open
            ws.onopen = () => {
                // Send join message to the server
                const joinMessage = JSON.stringify({
                    type: "join",
                    roomId: roomId
                });
                
                ws.send(joinMessage);
                resolve(ws);
            };

            // Handle errors
            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(error);
            };

            // Handle connection close
            ws.onclose = () => {
                console.log("WebSocket connection closed");
            };
        } catch (error) {
            console.error("Failed to create WebSocket connection:", error);
            reject(error);
        }
    });
}