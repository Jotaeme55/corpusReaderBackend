const express = require('express');
const router = express.Router();
const Project = require("../models/project");
const User = require('../models/user');
const mongoose = require('mongoose');

router.post("/",async (req,res)=>{
    const user = await User.findOne({ email: 'josemanueltr2000@gmail.com' })
    const userId = user._id

    const nuevoProyecto = new Project({
        _id: new mongoose.Types.ObjectId(),
        payed: false,
        user_id_asociated: userId,
      });
      
        // Guardar el proyecto en la base de datos
        nuevoProyecto.save((err, proyectoGuardado) => {
            if (err) {
            console.error('Error al guardar el proyecto:', err);
            } else {
            console.log('Proyecto guardado:', proyectoGuardado);
            }
        
        res.json({res:"funciona"})

        
      
})})

module.exports = router;