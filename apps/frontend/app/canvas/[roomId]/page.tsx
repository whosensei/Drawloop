import { initDraw } from "@/app/draw";
import CanvasPage from "@/components/ui/canvaspage";
import { useEffect, useRef } from "react";

export default async function Canvas({params} : {
    params:{
        roomId :string
    }
}){

    const roomId = (await params).roomId
    console.log(roomId)

    return <CanvasPage roomId = {roomId} />
   
}