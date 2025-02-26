import express from "express";
const app = express();

app.get("/" , (req,res)=>{
    res.json({
        message: "hello there"
    })
})

app.listen(3002);