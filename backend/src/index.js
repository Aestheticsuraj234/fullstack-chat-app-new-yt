import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import {auth} from "./lib/auth.js"

const app = express()

app.all("/api/auth/{*any}", toNodeHandler(auth));
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());



app.get("/" , (req , res)=>{
    res.send("Hello World from Backend!")
})

app.listen(3000 ,()=>{
    console.log("Server is running at http://localhost:3000")
})