'use client'
import { initDraw } from "@/draw";
import { useEffect, useRef } from "react"


export default function Canvas(){

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(()=>{

        if(canvasRef.current){
            const canvas = canvasRef.current;
            initDraw(canvas);
        }

    },[canvasRef]);

    return(
        <div>
            <canvas ref={canvasRef} width={1920} height={1080} className="bg-black"></canvas>
        </div>
    )
}