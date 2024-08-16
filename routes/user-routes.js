const express=require("express")
const router=express.Router()

const userController=require("../controllers/user-controller")
const auth = require("../config/auth")

router.post("/create",userController.createUser)

router.post("/login",userController.loginUser)

router.get("/allusers",userController.getAllUsers)

router.use(auth)

router.get("/",userController.getUserById)

router.put("/",userController.updateUserById)

router.delete("/",userController.deleteUserById)

router.put("/changepassword",userController.changePassword)

module.exports=router