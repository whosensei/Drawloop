"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "@/app/draw";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import DrawingToolbar from "@/components/drawing-toolbar"

// import { WebSocket } from "ws";


export function Canvas({ roomId, socket }:
    {
        socket: WebSocket,
        roomId: string
    }) {

    type Tool = "pen"|"line" | "circle" | "rectangle" | "eraser" | "text" | null;
    const [selectedTool, setSelectedTool] = useState<Tool>(null)
    const [selectedColor, setSelectedColor] = useState("#000000")
    const [clear,setclear] = useState<true | false>(false)

    const Canvasref = useRef(null);

    useEffect(() => {
        
        if (Canvasref.current) {
            const canvas = Canvasref.current
            initDraw(canvas, roomId, socket, selectedTool,selectedColor)
        }

    }, [Canvasref, selectedTool,selectedColor,clear])

    return (
        <div>
            <canvas ref={Canvasref} width={2000} height={1000}></canvas>
            <div className="absolute top-1/128 left-1/2 -translate-x-1/2">
                <div className="w-full max-w-3xl">
                    <DrawingToolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} selectedColor={selectedColor} setSelectedColor={setSelectedColor} clear={clear} setclear={setclear} roomId={roomId} />
                </div>
            </div>
        </div>
    )
}