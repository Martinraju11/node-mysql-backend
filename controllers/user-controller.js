const HttpError = require("../config/HttpError")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const queryDatabase = require("../config/dbquery")

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

        const token = jwt.sign({ userId: result.insertId, email: email }, process.env.SECRET_KEY, { expiresIn: "1h" });

        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 60 * 60 * 1000 });

        res.status(201).send({ message: "User Created Successfully", status: 201, });

    } catch (err) {
        return next(err);
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(new HttpError("All fields required", 400))
    }
    try {
        const result = await queryDatabase("SELECT * FROM users WHERE email = ?", [email]);

        if (result.length === 0) {
            return next(new HttpError("User not found", 404))
        }

        const hashedPassword = result[0].password

        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword)
        if (!isPasswordCorrect) {
            return next(new HttpError("Incorrect password", 400))
        }

        const token = jwt.sign({ userId: result[0].id, email: email }, process.env.SECRET_KEY, { expiresIn: "1h" })

        await res.cookie('token', token, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 60 * 60 * 1000 });

        res.status(200).send({ message: "Login Successful", status: 200, })
    }
    catch (err) {
        return next(err)
    }
}

const getAllUsers = async (req, res, next) => {
    const result = await queryDatabase("SELECT id,email,userName FROM users", [])
    if(result.length===0){
        return next(new HttpError("No user found", 404))
    }
    res.status(200).send({ message: "fetched users successfully", status: 200,data:result })
}

const getUserById=async(req,res,next)=>{
    const userId=req.user
    const result = await queryDatabase("SELECT id,email,userName FROM users WHERE id=?", [userId])
    if(result.length===0){
        return next(new HttpError("User not found", 404))
    }
    res.status(200).send({ message: "fetched user successfully", status: 200,data:result[0] })
}

const updateUserById=async(req,res,next)=>{
    const userId=req.user
    const {userName}=req.body
    if(!userName)
    {
        return next(new HttpError("Username is required", 400))
    }

    const result = await queryDatabase("SELECT * FROM users WHERE id=?", [userId])
    if(result.length===0){
        return next(new HttpError("User not found", 404))
    }

    const updatedUser=await queryDatabase("UPDATE users SET userName=? WHERE id=?",[userName,userId])

    if(updatedUser)
    {
        res.status(200).send({message:"User updated successfully",status:200})
    }

}

const deleteUserById=async(req,res,next)=>{
    const userId=req.user

    const result = await queryDatabase("SELECT * FROM users WHERE id=?", [userId])
    if(result.length===0){
        return next(new HttpError("User not found", 404))
    }

    const deleteUserTasks=await queryDatabase("DELETE FROM tasks WHERE userId=?",[userId])

    const deletedUser=await queryDatabase("DELETE FROM users WHERE id=?",[userId])

    if(deletedUser&&deleteUserTasks)
    {
        await res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'Strict' });
        res.status(200).send({message:"User deleted successfully",status:200})
    }
}

const changePassword=async(req,res,next)=>{
    const userId=req.user

    const result = await queryDatabase("SELECT * FROM users WHERE id=?", [userId])
    if(result.length===0){
        return next(new HttpError("User not found", 404))
    }

    const {oldPassword,newPassword}=req.body
    if(!oldPassword||!newPassword)
    {
        return next(new HttpError("Old and New passwords required", 400))
    }

    const hashedPassword=result[0].password
    const isPasswordCorrect=await bcrypt.compare(oldPassword,hashedPassword)
    if(!isPasswordCorrect)
    {
        return next(new HttpError("Incorrect old password", 400))
    }

    const newHashedPassword=await bcrypt.hash(newPassword,6)
    const updatedPassword=await queryDatabase("UPDATE users SET password=? WHERE id=?",[newHashedPassword,userId])
    if(updatedPassword)
    {
        res.status(200).send({message:"Password changed successfully",status:200})
    }

}


exports.createUser = createUser
exports.loginUser = loginUser
exports.getAllUsers = getAllUsers
exports.getUserById = getUserById
exports.updateUserById = updateUserById
exports.deleteUserById = deleteUserById
exports.changePassword=changePassword