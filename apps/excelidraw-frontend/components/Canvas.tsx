import { initDraw } from "@/draw";
import { useEffect, useRef ,useState } from "react";
import {LineIcon} from "./Icons";
import { Circle, Pencil, Square } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "pencil" | "rect" | "circle"

export default function Canvas({roomId, socket}:{roomId:string, socket:WebSocket}){

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

    useEffect(()=>{
        if(game){
            game.setTool(selectedTool);
        }
    },[selectedTool, game])

    useEffect(()=>{
    
            if(canvasRef.current){
                const g = new Game(canvasRef.current, roomId, socket);
                setGame(g);
                g.destroy();
            }
    
        },[canvasRef]);

    return(
        <div className="overflow-hidden">
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="bg-black"></canvas>
            <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
        </div>        
    )
}

function TopBar({
    selectedTool,
    setSelectedTool
}:{
    selectedTool:Tool,
    setSelectedTool:(tool:Tool)=>void
}){
    return(
        <div className="fixed top-10 left-10">
            <div className="flex gap-2">
                <LineIcon icon={<Pencil/>} onClick={()=>{setSelectedTool("pencil")}} activated={selectedTool==="pencil"}/>
                <LineIcon icon={<Square/>} onClick={()=>{setSelectedTool("rect")}} activated={selectedTool==="rect"}/>
                <LineIcon icon={<Circle/>} onClick={()=>{setSelectedTool("circle")}} activated={selectedTool==="circle"}/>
            </div>
        </div>
    )
}