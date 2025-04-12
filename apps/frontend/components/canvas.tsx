"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "@/app/draw";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import DrawingToolbar from "@/components/drawing-toolbar"
import { Game } from "@/app/draw/Game";
import DrawingToolbarProps from "./pill-toolbar";
import BacktoDashboard from "./backtodashboard";

// import { WebSocket } from "ws";

// export type Tool = "pen"|"line" | "circle" | "rectangle" | "eraser" | null;
export type Tool = "lock" | "rectangle" | "triangle" | "circle" | "arrow" | "line" | "pen" |"eraser"| null

export type StrokeThickness = "1" | "3" | "6"

export function Canvas({ roomId, socket }:
    {
        socket: WebSocket,
        roomId: string
    }) {


    const [selectedTool, setSelectedTool] = useState<Tool>(null)
    const [selectedColor, setSelectedColor] = useState("#000000")
    const [selectedbgColor, setSelectedbgColor] = useState("#FFFFFF")
    const [clear, setclear] = useState<true | false>(false)
    const [thickness, setThickness] = useState<StrokeThickness>("1")
    const [game, setGame] = useState<Game>();

    // Wrapper function to handle type conversion
    const handleThicknessChange = (value: string) => {
        setThickness(value as StrokeThickness);
    }

    const Canvasref = useRef<HTMLCanvasElement>(null);

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
        game?.setTool(selectedTool);
        game?.setColor(selectedColor);
        game?.setBgColor(selectedbgColor);
        game?.setThickness(thickness);
    }, [selectedTool, selectedColor, selectedbgColor, thickness, game]);

    useEffect(() => {
        if (clear && game) {
            game.clearAll();
        }
    }, [clear, game]);

    useEffect(() => {

        if (Canvasref.current) {
            const g = new Game(Canvasref.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }

    }, [Canvasref])

    return (
        <div style={{
            height: "100vh",
            overflow: "hidden"
        }}>
            <canvas ref={Canvasref} width={window.innerWidth} height={window.innerHeight}></canvas>

            <div className="absolute top-1/40 right-10">
                <BacktoDashboard />
            </div>
            <div className="absolute top-1/64 left-1/2 -translate-x-1/2">
                <div className="w-full max-w-3xl">
                    <DrawingToolbarProps selectedTool={selectedTool} setSelectedTool={setSelectedTool} selectedColor={selectedColor} setSelectedColor={setSelectedColor} clear={clear} setclear={setclear} roomId={roomId}
                        selectedbgColor={selectedbgColor} setSelectedbgColor={setSelectedbgColor} thickness={thickness} setThickness={handleThicknessChange} saveAsImage={saveAsImage} />
                </div>
            </div>
        </div>
    )
}