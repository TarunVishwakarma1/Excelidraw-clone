import { ReactNode } from "react";

export function LineIcon({icon, onClick, activated}:{
    icon:ReactNode,
    onClick:()=>void,
    activated:boolean
}){
    return(
        <div className={`pointer rounded-full border p-2 text-black dark:text-white bg-slate-300 dark:bg-black hover:bg-gray-400 ${activated ? "bg-gray-400":""}`} onClick={onClick}>
            {icon}
        </div>
    )
}