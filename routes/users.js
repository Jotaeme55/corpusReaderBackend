const axios = require('axios');
const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { header ,body, param, validationResult } = require('express-validator');
const JwtToken = require("../models/jwtToken");
require('dotenv').config()
const jwt = require('jsonwebtoken');


const palabra_secreta_jwt = process.env.VUE_APP_SECRET_WORD_JWT
const palabra_secreta_aes = process.env.VUE_APP_SECRET_WORD_AES || "very_secret_this_is_AES_12345"

router.get("/numberOfUsers", async (req, res)=>{
    try {
        const userId = req.query.userID || null;
        if(!userId){
            res.status(500).json({"error":"there must be a user in the query"})
        }
        
        const userAdmin = await User.findById(userId)
        if (!userAdmin || !userAdmin.isAdmin){
            res.status(501).json({"error":"the user is not an admin"})
        }
        const numberOfUsers = await User.countDocuments();
        res.status(200).json({"number":numberOfUsers.toString()})
    } catch (error) {
        console.error(error)
        res.status(400).json(error)
    }

})

router.get("/getUser",async (req, res)=>{
    try {
        const userId = req.query.userID || null
        if (!userId) {
            return res.status(400).json({ "error": "No user to make admin or no user ID in the query" });
        }
        var user = await User.findById(userId)
        user = JSON.stringify(user)
        user = JSON.parse(user)
        delete user.password
        res.status(200).json({user:user})
    } catch (error) {
        console.error(error)
        res.status(400).json(error)
    }
})

router.put("/user", async (req, res) => {
    try {
        const actualUserId = req.query.userID || null;
        const userIdToAdmin = req.query.userIdToAdmin || null;

        if (!userIdToAdmin || !actualUserId) {
            return res.status(400).json({ "error": "No user to make admin or no user ID in the query" });
        }

        const userAdmin = await User.findById(actualUserId);
        if (!userAdmin || !userAdmin.isAdmin) {
            return res.status(401).json({ "error": "The user is not an admin" });
        }

        const targetUser = await User.findById(userIdToAdmin);
        if (!targetUser) {
            return res.status(404).json({ "error": "User to make admin not found" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: userIdToAdmin },
            { $set: { isAdmin: !targetUser.isAdmin } },
            { new: false, useFindAndModify: true }
        );


        res.status(200).json({ "msg": "El usuario ha sido actualizado a administrador", "user": updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "error": "Error interno del servidor" });
    }
});

router.get("/checkUserExists",async (req,res)=>{
    try {
        const username = req.query.username
        const user =await User.findOne({username:username})
        if (user){
            res.status(200).json({userExists:"true"})
        }else{
            res.status(200).json({userExists:"false"})
        }
        
    } catch (error) {
        res.status(400).json({msg:"La base de datos no funciona actualmente "+ error})
    }

})

router.get("/", async (req, res)=>{
    try {
        const userId = req.query.userID || null;

        if(!userId){
            res.status(500).json({"error":"there must be a user in the query"})
        }
        
        const userAdmin = await User.findById(userId)
        if (!userAdmin || !userAdmin.isAdmin){
            res.status(501).json({"error":"the user is not an admin"})
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || ''; // Cadena para filtrar
        const query = search ? { username: { $regex: search, $options: 'i' } } : {};
        const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

        res.status(200).json(users)
    } catch (error) {
        console.error(error)
        res.status(400).json(error)
    }

})


router.get('/:email',
    param('email').isEmail(),
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.params.email;

        try {
            const userDB = await User.findOne({"email": email});
            if (userDB!=null && userDB.password!=null){
                res.status(200).json("already exists");
            }else{
                res.status(200).json()
            }
            
        } catch (error) {
            return res.status(400).json({
                mensaje: 'An error has occurred',
                error
            });
        }
    }
);

router.post('/', async(req, res) => {
    const body = req.body;  
    try {
    body._id = new mongoose.Types.ObjectId();
    const userDB = await User.create(body);
    res.status(200).json(userDB); 
    } catch (error) {
        console.error("Error::", error)
    return res.status(500).json({
        mensaje: 'An error has occurred',
        error
    })
    }
});


///////
router.delete("/",async(req, res)=>{
    const userId = req.query.userID || null
    const userIdToDelete = req.query.userIdToDelete || null

    if(!userId){
        res.status(500).json({"error":"there must be a user in the query"})
    }
    
    const userAdmin = await User.findById(userId)
    if (!userAdmin || !userAdmin.isAdmin){
        res.status(501).json({"error":"the user is not an admin"})
    }

    await User.findOneAndDelete({_id:userIdToDelete})

    res.status(200).json({"msg":"el usuario se ha borrado correctamente"})
})  

module.exports = router;