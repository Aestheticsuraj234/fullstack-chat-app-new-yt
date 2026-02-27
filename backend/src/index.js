import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import {auth} from "./lib/auth.js"
import { friendRouter } from "./modules/friend/friend.routes.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { userRouter } from "./modules/user/user.routes.js";

import { createServer } from "http";
import { setupSocketIo } from "./lib/socket.js";

const app = express()
const httpServer = createServer(app)

export const io = setupSocketIo(httpServer)

app.all("/api/auth/{*any}", toNodeHandler(auth));
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());



app.use("/api/friend" , friendRouter)
app.use("/api/chat" , chatRouter)
app.use("/api/user" , userRouter)

app.get("/" , (req , res)=>{
    res.send("Hello World from Backend!")
})

httpServer.listen(3000 , ()=>{
    console.log(`Server is running on http://localhost:3000`);
  console.log(`Socket.IO server is ready`);
})