import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";


export default function Canvas({roomId, socket}:{roomId:string, socket:WebSocket}){

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(()=>{
    
            if(canvasRef.current){
                initDraw(canvasRef.current, roomId, socket);
            }
    
        },[canvasRef]);

    return(
        <canvas ref={canvasRef} width={1920} height={1080} className="bg-black"></canvas>
    )
}