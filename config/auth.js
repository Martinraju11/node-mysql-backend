const jwt=require("jsonwebtoken")
const HttpError = require("./HttpError")
const queryDatabase = require("./dbquery")

const auth=async (req,res,next)=>{
    if(req.method==="OPTIONS")
        {
            return next()
        }
    const token=req.cookies.token
    if(!token)
    {
        return next(new HttpError("Token is required", 400))
    }
    const decodedToken=jwt.verify(token,process.env.SECRET_KEY)
    if(!decodedToken)
    {
        return next(new HttpError("Unauthorized access", 400))
    }

    const userId=decodedToken.userId

    const result=await queryDatabase("SELECT * FROM users WHERE id=?",[userId])
    
    if(result.length===0)
    {
        return next(new HttpError("Unauthorized access", 400))
    }
  
    req.user=userId
    next()
}

module.exports=auth