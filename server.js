const express=require("express");
const app=express()

const bodyParser=require("body-parser")
const cookieParser=require("cookie-parser")
require("dotenv").config()
const userRoutes=require("./routes/user-routes");
const HttpError = require("./config/HttpError");

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*")
    res.setHeader("Access-Control-Allow-Headers","Origin,x-Requested-with,Content-Type,Accept,Authorization")
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PATCH,PUT,DELETE")
    next()
})


app.use("/api/user",userRoutes)

app.use((req,res,next)=>{
    const error=new HttpError("Incorrect URL",404)
    return next(error)
})

app.use((error,req,res,next)=>{
    if(res.headerSent)
    {
        return next(error)
    }
    res.status(error.code||500).json({message:error.message||"An unknown error occured"})
})

app.listen(process.env.PORT,()=>{
    console.log("connected to mysql database at port "+process.env.PORT)
})