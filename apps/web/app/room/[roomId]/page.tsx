import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../../components/ChatRoom";

async function getRoom(slug:string) {
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
    return response.data.room.id;
}

async function getToken(){
    const response = await axios.post(`${BACKEND_URL}/signin`,{
        username:"tarun@gmail.com",
        password:"123123"
    })
    return response.data.token;
}


export default async function Page({params}:{params:{roomId:string}}){
    const slug = (await params).roomId;
    const roomId = await getRoom(slug);
    const token = await getToken();
    return(
        <div>
            <ChatRoom id={roomId} token={token}/>
        </div>
    )
}