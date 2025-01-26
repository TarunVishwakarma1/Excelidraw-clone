import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape = {
    type: "rect" | "circle" | "pencil";
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: {x: number, y: number}[];
} 

export async function initDraw(canvas: HTMLCanvasElement, roomId:string, socket:WebSocket) {
    const ctx = canvas.getContext("2d");
    let existingShapes: Shape[] = await getExistingShapes(roomId);
    
    if (!ctx) return;

    let clicked = false;
    let startX = 0;
    let startY = 0;
    let currentPath: {x: number, y: number}[] = [];

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if(message.type === "chat"){
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape.shape);
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    clearCanvas(existingShapes, canvas, ctx);

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX - canvas.offsetLeft;
        startY = e.clientY - canvas.offsetTop;
        
        //@ts-ignore
        const selectedTool = window.selectedTool;
        if (selectedTool === "pencil") {
            currentPath = [{x: startX, y: startY}];
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
    });

    canvas.addEventListener("mouseup", (e) => {
        if (!clicked) return;
        clicked = false;
        
        //@ts-ignore
        const selectedTool = window.selectedTool;
        var shape : Shape | null = null;
        if (selectedTool === "rect") {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
             shape = {
                type: "rect",
                x: startX,
                y: startY,
                width: width,
                height: height
            }
        }

        if(selectedTool === "circle"){
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            const centerX = (startX + e.clientX) / 2;
            const centerY = (startY + e.clientY) / 2;
            const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
            shape = {
                type: "circle",
                x: centerX,
                y: centerY,
                width: radius,
                height: radius
            }
        }

        if (selectedTool === "pencil" && currentPath.length > 1) {
            shape = {
                type: "pencil",
                x: startX,
                y: startY,
                points: currentPath
            }
            currentPath = [];
        }

        if(!shape){
            return
        }

        existingShapes.push(shape);
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({shape}),
                roomId: roomId
            }));

    });

    canvas.addEventListener("mousemove", (e) => {
        if (!clicked) return;
        
        const currentX = e.clientX - canvas.offsetLeft;
        const currentY = e.clientY - canvas.offsetTop;
        
        //@ts-ignore
        const selectedTool = window.selectedTool;
        
        if (selectedTool === "rect") {
            const width = currentX - startX;
            const height = currentY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(startX, startY, width, height);
        }

        if (selectedTool === "circle") {
            const width = currentX - startX;
            const height = currentY - startY;
            const centerX = (startX + currentX) / 2;
            const centerY = (startY + currentY) / 2;
            const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
            
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        if (selectedTool === "pencil") {
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            currentPath.push({x: currentX, y: currentY});
        }
    });
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    existingShapes.forEach((shape) => {
        ctx.strokeStyle = "rgba(255,255,255)";
        
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width!, shape.height!);
        }

        if(shape.type === "circle"){
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.width!, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        if (shape.type === "pencil" && shape.points) {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            shape.points.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
    });
}

async function getExistingShapes(roomId: string): Promise<Shape[]> {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;
    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    });
    return shapes;
}