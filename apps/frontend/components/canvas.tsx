"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "@/app/draw";
import {useState} from "react"
import {Button} from "@/components/ui/button"
// import { WebSocket } from "ws";


export function Canvas({ roomId, socket }:
    {
        socket: WebSocket,
        roomId: string
    }) {

    const [tool,setTool] = useState<string | null>(null)

    const Canvasref = useRef(null);

    useEffect(() => {

        if (Canvasref.current) {
            const canvas = Canvasref.current
            initDraw(canvas, roomId, socket ,tool)
        }

    }, [Canvasref,tool])

    return (
        <div>
            <canvas ref={Canvasref} width={2000} height={1000}></canvas>
            <div className="absolute top-0 left-0 flex gap-2">
            <Button onClick={()=>{setTool("rectangle")}}>Rectangle</Button>
            <Button onClick={()=>{setTool("circle")}}>Circle</Button>
            <Button onClick={()=>{setTool("line")}}>Line</Button>
            <Button onClick={()=>{setTool("erase")}}>Erase</Button>
            <Button onClick={()=>{setTool("clear")}}>Clear</Button>
            </div>
        </div>
    )
}