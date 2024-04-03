const axios = require('axios');
const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Project = require('../models/project')
const { header ,body, param, validationResult } = require('express-validator');
const JwtToken = require("../models/jwtToken");
require('dotenv').config()
const jwt = require('jsonwebtoken');


const palabra_secreta_jwt = process.env.VUE_APP_SECRET_WORD_JWT
const palabra_secreta_aes = process.env.VUE_APP_SECRET_WORD_AES || "very_secret_this_is_AES_12345"

router.get("/AllPublicProjects", async (req, res)=>{
    try {
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || ''; // Cadena para filtrar
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};
        const projects = await Project.find(query)
        .skip((page - 1) * limit)
        .limit(limit);
        res.status(200).json(projects)
    } catch (error) {
        console.error(error)
        res.status(400).json(error)
    }

})

router.get("/getNumberOfPublicProjects", async (req, res) => {
    try {
        const numberOfPublicProjects = await Project.countDocuments({'public': true});
        res.status(200).json({ count: numberOfPublicProjects }); // Enviar respuesta como JSON
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message }); // Enviar mensaje de error como JSON
    }
});

router.get("/getProjectsFromUser/:userId", async (req, res)=>{
    try {
        const userId = req.params.userId;
        if (!userId) {
            // El parámetro 'userId' no está presente
            return res.status(400).json({ error: "Se requiere el parámetro 'userId' en la ruta." });
        }
        const user = await User.findById(userId);
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || ''; // Cadena para filtrar
        const query = {
            userAsociated: { $regex: user.username, $options: 'i' },
            title:  { $regex: search, $options: 'i' }
          };
        const projects = await Project.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

        res.status(200).json(projects)
    } catch (error) {
        console.error(error)
        res.status(400).json(error)
    }

})

router.get("/getNumberOfProjectsFromUser/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            // El parámetro 'userId' no está presente
            return res.status(400).json({ error: "Se requiere el parámetro 'userId' en la ruta." });
        }
        const user = await User.findById(userId);
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        const numberOfPrivateProjects = await Project.countDocuments({'userAsociated': user.username});
        console.log(user);
        res.status(200).json({ count: numberOfPrivateProjects }); // Enviar respuesta como JSON
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message }); // Enviar mensaje de error como JSON
    }
});

router.post("/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            // El parámetro 'userId' no está presente
            return res.status(400).json({ error: "Se requiere el parámetro 'userId' en la ruta." });
        }
        const user = await User.findById(userId);
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        // Verificar si los campos "titulo" y "descripcion" existen en el cuerpo de la solicitud
        const { title, description, public } = req.body;

        if (!title || !description || title==="" || description==="") {
            // Al menos uno de los campos no está presente
            return res.status(401).json({ error: "Se requieren campos 'titulo' y 'descripcion' en el cuerpo de la solicitud." });
        }

        // El código aquí para manejar la lógica de tu aplicación
        let project = new Project({
            "_id":new mongoose.Types.ObjectId(),
            "title":title,
            "description":description,
            "userAsociated":user.username,
            "public":public

        }) 

        const savedProject = await project.save();
        console.log(savedProject)
        res.status(200).json({ savedProject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const projectId = req.params.id;

        // Comprobamos si el ID es válido antes de intentar buscar el proyecto
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "ID de proyecto no válido." });
        }

        // Buscamos el proyecto por su ID
        const project = await Project.findById(projectId);

        // Comprobamos si el proyecto existe
        if (!project) {
            return res.status(404).json({ error: "Proyecto no encontrado." });
        }

        // Si todo está bien, enviamos el proyecto encontrado
        res.json(project);
    } catch (error) {
        console.error("Error al buscar proyecto:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});


module.exports = router;