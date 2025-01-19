'use client'

export function AuthPage({isSignIn}:{
    isSignIn:boolean
}){
    return(
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-6 m-2 bg-white rounded text-black">
                <div className="p-2">
                    <input type="text" placeholder="Email"></input>
                </div>
                <div className="p-2">
                    <input type="password" placeholder="Password"></input>
                </div>
                <div className="pt-2 text-white ">
                    <button
                        className="bg-black rounded-lg p-2"
                        onClick={()=>{

                        }}
                    >{isSignIn ? "Sing In" : "Sign Up"}</button>
                </div>
            </div>
        </div>
    )
}