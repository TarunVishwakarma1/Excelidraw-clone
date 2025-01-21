"use client"

import { WS_URL, HARD_CODE_TOKEN } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react"
import Canvas from "./Canvas";

export default function RoomCanvas({roomId}:{roomId:string}){

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=${HARD_CODE_TOKEN}`);
        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId:roomId
            }))
        }

    },[]);

    if(!socket){
        return (
            <>
                Connecting to server...
            </>
        )
    }

    return(
        <Canvas roomId={roomId} socket={socket}/>
    )
}