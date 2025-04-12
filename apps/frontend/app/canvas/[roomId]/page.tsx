import { initDraw } from "@/app/draw";
import RoomCanvas from "@/components/RoomCanvas";
import { useEffect, useRef } from "react";

export default async function CanvasPage({params} : {
    params:{
        roomId :string
    }
}){

    const roomId = (await params).roomId

    return <RoomCanvas roomId = {roomId} />
   
}