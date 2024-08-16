const { validationResult } = require("express-validator")
const queryDatabase = require("../config/dbquery")
const HttpError = require("../config/HttpError")

const createTask=async(req,res,next)=>{
    const userId=req.user

    const {taskName,taskDescription}=req.body

    if(!taskName||!taskDescription)
    {
        return next(new HttpError("Name and Description are required",400))
    }

    const result = await queryDatabase("INSERT INTO tasks (taskName,taskDescription,userId) values(?,?,?)",[taskName,taskDescription,userId])

    if(result)
    {
        res.status(201).send({message:"Task created successfuully",status:201})
    }

}

const getTaskByUserId=async(req,res,next)=>{
    const userId=req.user

    const tasks=await queryDatabase("SELECT * FROM TASKS WHERE userId=?",[userId])
    if(tasks.length===0)
    {
        return next(new HttpError("No tasks found",404))
    }

    res.status(200).send({message:"tasks fetched successfully",status:200,data:tasks})
}

const getTaskById=async(req,res,next)=>{
    const userId=req.user
    const {taskId}=req.params

    const tasks=await queryDatabase("SELECT * FROM TASKS WHERE userId=?",[userId])
    if(tasks.length===0)
    {
        return next(new HttpError("No tasks found",404))
    }

    const selectedTasks=await queryDatabase("SELECT * FROM TASKS WHERE userId=? AND id=?",[userId,taskId])
    if(selectedTasks.length===0)
    {
        return next(new HttpError("Task not found",404))
    }

    res.status(200).send({message:"task fetched successfully",status:200,data:selectedTasks[0]})
}

const updateTaskById=async(req,res,next)=>{
    const userId=req.user
    const {taskId}=req.params
    const {taskName,taskDescription,isCompleted,isActive}=req.body
    const error=validationResult(req)
    if(!error.isEmpty())
    {
        return next(new HttpError("All fields are required",400))  
    }

    const tasks=await queryDatabase("SELECT * FROM TASKS WHERE userId=?",[userId])
    if(tasks.length===0)
    {
        return next(new HttpError("No tasks found",404))
    }

    const selectedTasks=await queryDatabase("SELECT * FROM TASKS WHERE userId=? AND id=?",[userId,taskId])
    if(selectedTasks.length===0)
    {
        return next(new HttpError("Task not found",404))
    }

    const updateTask=await queryDatabase("UPDATE tasks SET taskName=?,taskDescription=?,isCompleted=?,isActive=? WHERE id=? AND userId=?",[taskName,taskDescription,isCompleted,isActive,taskId,userId])

    if(updateTask)
    {
        res.status(200).send({message:"task updated successfully",status:200})   
    }
}

const deleteTaskById=async(req,res,next)=>{
    const userId=req.user
    const {taskId}=req.params

    const tasks=await queryDatabase("SELECT * FROM TASKS WHERE userId=?",[userId])
    if(tasks.length===0)
    {
        return next(new HttpError("No tasks found",404))
    }

    const selectedTasks=await queryDatabase("SELECT * FROM TASKS WHERE userId=? AND id=?",[userId,taskId])
    if(selectedTasks.length===0)
    {
        return next(new HttpError("Task not found",404))
    }

    const deletedTask=await queryDatabase("DELETE FROM tasks WHERE id=? AND userId=?",[taskId,userId])

    if(deletedTask)
    {
        res.status(200).send({message:"task deleted successfully",status:200})  
    }
}

exports.createTask=createTask
exports.getTaskByUserId=getTaskByUserId
exports.getTaskById=getTaskById
exports.updateTaskById=updateTaskById
exports.deleteTaskById=deleteTaskById