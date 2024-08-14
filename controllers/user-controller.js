const HttpError = require("../config/HttpError")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const queryDatabase=require("../config/dbquery")

const createUser = async (req, res, next) => {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
        return next(new HttpError("All fields required", 400));
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 6);

        const existingUser = await queryDatabase("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return next(new HttpError("Email already exists", 400));
        }

        const result = await queryDatabase(
            "INSERT INTO users (userName, email, password) VALUES (?, ?, ?)",
            [userName, email, hashedPassword]
        );

        const token = jwt.sign({ userId: result.insertId, email: email },process.env.SECRET_KEY,{ expiresIn: "1h" });

        res.cookie('token', token, {httpOnly: true,secure: false,sameSite: "strict",maxAge: 60 * 60 * 1000});

        res.status(201).send({message: "User Created Successfully",status: 201,});

    } catch (err) {
        return next(err);
    }
};

const loginUser=async (req,res,next)=>{
    const {email,password}=req.body
    if(!email||!password)
    {
        return next(new HttpError("All fields required",400))  
    }
    try{
        const result = await queryDatabase("SELECT * FROM users WHERE email = ?", [email]);

        if(result.length===0)
            {
                return next(new HttpError("User not found",404))  
            }
        
        const hashedPassword=result[0].password
         
        const isPasswordCorrect=await bcrypt.compare(password,hashedPassword)
        if(!isPasswordCorrect)
            {
                return next(new HttpError("Incorrect password",400))
            }

        const token=jwt.sign({userId:result[0].id,email:email},process.env.SECRET_KEY,{expiresIn:"1h"})

        await res.cookie('token', token, { httpOnly: true, secure: false ,sameSite:"strict",maxAge:60*60*1000});

        res.status(200).send({message:"Login Successful",status:200,}) 
    }
    catch(err){
        return next(err)
    }
}

exports.createUser=createUser
exports.loginUser=loginUser