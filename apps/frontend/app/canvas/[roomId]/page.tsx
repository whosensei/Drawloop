"use client"
import { initDraw } from "@/app/draw";
import { useEffect, useRef } from "react";

export default function Canvas(){

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