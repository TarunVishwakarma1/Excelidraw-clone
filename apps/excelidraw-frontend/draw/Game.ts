import { getExistingShapes } from "./Http";

type Shape = {
    type: "rect" | "circle" | "pencil";
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: {x: number, y: number}[];
} 

export class Game {

    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    private existingShapes:Shape[];
    private roomId:string;
    private socket:WebSocket;
    private clicked:boolean;
    private startX:number;
    private startY:number;
    private currentPath:{x:number, y:number}[];
    private selectedTool:string

    constructor(canvas:HTMLCanvasElement, roomId:string, socket:WebSocket){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.startX = 0;
        this.startY = 0;
        this.currentPath = [];
        this.selectedTool = "";
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy(){
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool:"circle" | "rect" | "pencil"){
        this.selectedTool = tool;
    }

    async init(){
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    };

    mouseDownHandler = (e:MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX - this.canvas.offsetLeft;
        this.startY = e.clientY - this.canvas.offsetTop;
            
        //@ts-ignore
        const selectedTool = this.selectedTool;
        if (selectedTool === "pencil") {
                this.currentPath = [{x: this.startX, y: this.startY}];
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
        }
    }

    mouseUpHandler = (e:MouseEvent) => {
        if (!this.clicked) return;
            this.clicked = false;
            
            //@ts-ignore
            const selectedTool = this.selectedTool;
            var shape : Shape | null = null;
            if (selectedTool === "rect") {
                const width = e.clientX - this.startX;
                const height = e.clientY - this.startY;
                 shape = {
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    width: width,
                    height: height
                }
            }
    
            if(selectedTool === "circle"){
                const width = e.clientX - this.startX;
                const height = e.clientY - this.startY;
                const centerX = (this.startX + e.clientX) / 2;
                const centerY = (this.startY + e.clientY) / 2;
                const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
                shape = {
                    type: "circle",
                    x: centerX,
                    y: centerY,
                    width: radius,
                    height: radius
                }
            }
    
            if (selectedTool === "pencil" && this.currentPath.length > 1) {
                shape = {
                    type: "pencil",
                    x: this.startX,
                    y: this.startY,
                    points: this.currentPath
                }
                this.currentPath = [];
            }
    
            if(!shape){
                return;
            }
    
            this.existingShapes.push(shape);
                this.socket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({shape}),
                    roomId: this.roomId
                }));
    }

    mouseMoveHandler = (e:MouseEvent) => {
        if (!this.clicked) return;
            
            const currentX = e.clientX - this.canvas.offsetLeft;
            const currentY = e.clientY - this.canvas.offsetTop;
            
            //@ts-ignore
            const selectedTool = this.selectedTool;
            
            if (selectedTool === "rect") {
                const width = currentX - this.startX;
                const height = currentY - this.startY;
                this.clearCanvas();
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            }
    
            if (selectedTool === "circle") {
                const width = currentX - this.startX;
                const height = currentY - this.startY;
                const centerX = (this.startX + currentX) / 2;
                const centerY = (this.startY + currentY) / 2;
                const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
                
                this.clearCanvas();
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
    
            if (selectedTool === "pencil") {
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                this.currentPath.push({x: currentX, y: currentY});
            }
    }

    initHandlers(){
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if(message.type === "chat"){
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.forEach(shape => {
            this.ctx.strokeStyle = "rgba(255, 255, 255)";

            if(shape.type === "rect"){
                this.ctx.strokeRect(shape.x, shape.y, shape.width!, shape.height!);
            }

            if(shape.type === "circle"){
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, shape.width!, 0, 2 * Math.PI);
                this.ctx.stroke();
            }

            if(shape.type === "pencil" && shape.points){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.points![0].x, shape.points![0].y);
                shape.points!.forEach(point => {
                    this.ctx.lineTo(point.x, point.y);
                });
                this.ctx.stroke();
            }

        });
    }

    initMouseHandlers(){

        this.canvas.addEventListener("mousedown", this.mouseDownHandler.bind(this));

        this.canvas.addEventListener("mouseup", this.mouseUpHandler.bind(this));

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler.bind(this));

    }
}