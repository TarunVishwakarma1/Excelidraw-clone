import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({port:8080});

interface User {
    ws: WebSocket,
    rooms: String[],
    userId: String
}

const users: User[] = [];

function checkUser(token:string):string|null{
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if(typeof decoded == "string"){
            return null;
        }   

        if(!decoded || !decoded.userId){
            return null;
        }

        return decoded.userId;
    
    } catch (error) {
        console.log(error)
        return null;
    }
}

wss.on('connection', function connection(ws, request){

    const url = request.url;
    if(!url)
        return;

    const queryParam = new URLSearchParams(url.split('?')[1]);
    const token = queryParam.get('token') || "";
   
    const userId = checkUser(token);

    if(userId==null){
        ws.close();
        return null;
    }

    users.push({
        userId,
        rooms:[],
        ws
    })

    ws.on('message', async function message(data){
        const parsedData = JSON.parse(data as unknown as string);
        const user = users.find(x => x.ws === ws);

        if(!user)
            return;

        if(parsedData.type === "join_room"){
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type === "leave_room"){
            user.rooms = user?.rooms.filter(x => x === parsedData.room);
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            
            await prismaClient.chat.create({
                data:{
                    message:message,
                    userId:userId,
                    roomId:roomId
                }
            })

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomId
                    }));
                }
            })
        }
    });

});