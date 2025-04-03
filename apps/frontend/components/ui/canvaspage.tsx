"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "@/app/draw";

export default function CanvasPage({roomId} :{roomId :string}){

    const Canvasref = useRef(null);

    useEffect(()=>{

        if(Canvasref.current){
            const canvas = Canvasref.current
            initDraw(canvas,roomId)
        }

    },[Canvasref])

    return (
        <div>
            <canvas ref={Canvasref} width={2000} height={1000}></canvas>
        </div>
    )
}