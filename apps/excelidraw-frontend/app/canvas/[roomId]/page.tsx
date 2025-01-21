import RoomCanvas from "@/components/RoomCanvas"


export default async function CanvasPage({params}: { params: { roomId: string } }){

    const room = (await params).roomId;

    return(
        <div>
            <RoomCanvas roomId={room}/>
            <div className="fixed bottom-0 right-0 text-white">
                <div>
                    Rectangle
                </div>
                <div>
                    Circle
                </div>
            </div>
        </div>
    )
}