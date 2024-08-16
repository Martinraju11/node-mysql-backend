const express=require("express")
const auth = require("../config/auth")
const router=express.Router()
const taskController=require("../controllers/task-controllers")
const {check}=require("express-validator")

router.use(auth)

router.post("/",taskController.createTask)

router.get("/alltasks",taskController.getTaskByUserId)

router.get("/:taskId",taskController.getTaskById)

router.put("/:taskId",[check("taskName").notEmpty(),check("taskDescription").notEmpty(),check("isCompleted").notEmpty(),check("isActive").notEmpty()],taskController.updateTaskById)

router.delete("/:taskId",taskController.deleteTaskById)

module.exports=router