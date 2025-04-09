"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "@/app/draw";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import DrawingToolbar from "@/components/drawing-toolbar"
import PillToolbar from "./toolbar";

// import { WebSocket } from "ws";


export function Canvas({ roomId, socket }:
    {
        socket: WebSocket,
        roomId: string
    }) {

    type Tool = "pen"|"line" | "circle" | "rectangle" | "eraser" | "text" | null;
    type StrokeThickness = "1" | "3" | "6"

    const [selectedTool, setSelectedTool] = useState<Tool>(null)
    const [selectedColor, setSelectedColor] = useState("#000000")
    const [selectedbgColor, setSelectedbgColor] = useState("#FFFFFF")
    const [clear,setclear] = useState<true | false>(false)
    const [thickness, setThickness] = useState<StrokeThickness>("1")

    // Wrapper function to handle type conversion
    const handleThicknessChange = (value: string) => {
        setThickness(value as StrokeThickness);
    }

    const Canvasref = useRef(null);

    const saveAsImage = () => {
        if (Canvasref.current) {
            const canvas = Canvasref.current as HTMLCanvasElement;
            const link = document.createElement('a');
            link.download = `drawing-${roomId}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    useEffect(() => {
        
        if (Canvasref.current) {
            const canvas = Canvasref.current
            initDraw(canvas, roomId, socket, selectedTool,selectedColor,selectedbgColor,thickness)
        }

    }, [Canvasref, selectedTool,selectedColor,clear,selectedbgColor,thickness])

    return (
        <div>
            <canvas ref={Canvasref} width={2000} height={1000}></canvas>
            <div className="absolute top-1/64 left-1/2 -translate-x-1/2">
                <div className="w-full max-w-3xl">
                    <PillToolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} selectedColor={selectedColor} setSelectedColor={setSelectedColor} clear={clear} setclear={setclear} roomId={roomId}
                    selectedbgColor= {selectedbgColor} setSelectedbgColor={setSelectedbgColor} thickness={thickness} setThickness={handleThicknessChange} saveAsImage={saveAsImage} />
                </div>
            </div>
        </div>
    )
}