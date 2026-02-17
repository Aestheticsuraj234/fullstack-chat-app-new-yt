import express from "express";
import "dotenv/config";

const app = express()


app.get("/" , (req , res)=>{
    res.send("Hello World from Backend!")
})

app.listen(3000 ,()=>{
    console.log("Server is running at http://localhost:3000")
})