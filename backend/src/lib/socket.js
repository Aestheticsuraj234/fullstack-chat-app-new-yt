import {Server} from "socket.io";
import { auth } from "./auth.js";

const onlineUsers = new Map();

export function setupSocketIo(httpServer){
    const io = new Server(httpServer , {
        cors:{
            origin:"*",
            credentials:true
        }
    })

    io.use(async (socket , next)=>{
        try {
            const cookie = socket.handshake.headers.cookie;

            if(!cookie){
                 return next(new Error("Authentication required"));
            }

            const session = await auth.api.getSession({
                headers:{cookie}
            });

            if(!session?.user?.id){
                return next(new Error("Invalid session"))
            }

            socket.userId = session.user.id;
            socket.user = session.user;

            next()
        } catch (error) {
             next(new Error("Authentication failed"));
        }
    })

    io.on("connection" , (socket)=>{
        const userId = socket.userId;
        socket.join(userId);
      
        if(!onlineUsers.has(userId)){
            onlineUsers.set(userId , new Set())
        }

        onlineUsers.get(userId).add(socket.id);

        socket.broadcast.emit("user_online" , {userId , user:socket.user})

        socket.on("join" , (conversationId)=>{
            socket.join(conversationId);
            console.log(`User ${userId} joined conversation ${conversationId}`);
        })

         socket.on("leave", (conversationId) => {
            socket.leave(conversationId);
            console.log(`User ${userId} left conversation ${conversationId}`);
        });

        socket.on("typing" , ({conversationId , isTyping})=>{
            socket.to(conversationId).emit("user_typing" , {
                  userId,
                user: socket.user,
                isTyping,
            })
        });

        socket.on("check_online" , (targetUserId , callback)=>{
            const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId).size > 0
            if(callback) callback({userId:targetUserId , isOnline})
        });

        socket.on("disconnect" , ()=>{
            console.log(`User disconnected: ${userId}` );

            if(onlineUsers.has(userId)){
                onlineUsers.get(userId).delete(socket.id);
                if (onlineUsers.get(userId).size === 0) {
                    onlineUsers.delete(userId);
                    // Broadcast user offline status
                    socket.broadcast.emit("user_offline", { userId });
                }
            }
        })
    })
    return io;
}

export function isUserOnline(userId){
     return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}