import React , {createContext , useContext , useEffect , useState} from "react";
import {io , Socket} from "socket.io-client";
import { useAuth } from "./auth-context";
import { userService } from "@/services/user.service";
import { SOCKET_URL } from "@/utils";


interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadMessages: number;
    pendingFriendRequests: number;
    setUnreadMessages: (count: number) => void;
    setPendingFriendRequests: (count: number) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    unreadMessages: 0,
    pendingFriendRequests: 0,
    setUnreadMessages: () => { },
    setPendingFriendRequests: () => { },
})

export const useSocket = ()=>useContext(SocketContext);

export const SocketProvider = ({children}:{children:React.ReactNode})=>{
     const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
    const { user, getCookie } = useAuth();

    useEffect(()=>{
        if(!user){
            if(socket){
                socket.disconnect();
                setSocket(null);
                setIsConnected(false)
            }

            return;
        }

        const cookie = getCookie();

        const newSocket = io("http://192.168.1.50:3000",{
            extraHeaders:{
                cookie:cookie || "",
            },
            transports:["websocket" , "polling"]
        })

        newSocket.on('connect' , ()=>{
            console.log("Socket Connected:" , newSocket.id);
            setIsConnected(true)
        })

         newSocket.on('disconnect' , ()=>{
            console.log("Socket disConnected:");
            setIsConnected(false)
        })

        
        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
            setIsConnected(false);
        });

          // Listen for real-time updates
        newSocket.on("notification:new_message", (message) => {
            // Only increment if we are not in the chat with this person? 
            // Actually, the global count should probably increment, and the chat screen should 
            // handle marking it as read if it's open.
            setUnreadMessages((prev) => prev + 1);
        });

        newSocket.on("friend_request_received", () => {
            setPendingFriendRequests((prev) => prev + 1);
        });


        setSocket(newSocket);

        return ()=>{
            newSocket.disconnect()
        }
    },[user])

    return (
        <SocketContext.Provider
        value={{
              socket,
            isConnected,
            unreadMessages,
            pendingFriendRequests,
            setUnreadMessages,
            setPendingFriendRequests
        }}
        >
            {children}
        </SocketContext.Provider>
    )
}