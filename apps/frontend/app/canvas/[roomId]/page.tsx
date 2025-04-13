import { initDraw } from "@/app/draw";
import RoomCanvas from "@/components/RoomCanvas";
import { useEffect, useRef } from "react";

type PageProps = {
  params: {
    roomId: string
  }
}

export default async function CanvasPage({ params }: PageProps) {
  const roomId = (await params).roomId;

  return <RoomCanvas roomId={roomId} />
}