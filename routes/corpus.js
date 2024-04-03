const axios = require('axios');
const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Project = require('../models/project')
const Corpus = require("../models/corpus")
const { header ,body, param, validationResult } = require('express-validator');
const JwtToken = require("../models/jwtToken");
require('dotenv').config()
const jwt = require('jsonwebtoken');


const palabra_secreta_jwt = process.env.VUE_APP_SECRET_WORD_JWT
const palabra_secreta_aes = process.env.VUE_APP_SECRET_WORD_AES || "very_secret_this_is_AES_12345"
router.post("/:projectId", async (req, res) => {
    try {
        const projectId = req.params.projectId;
        
        // Comprobamos si el ID es válido antes de intentar buscar el proyecto
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "ID de proyecto no válido." });
        }

        // Comprobamos si req.body está vacío
        if (!req.body) {
            return res.status(404).json({ error: "Corpus no encontrado" });
        }

        // Buscamos el proyecto por su ID
        const project = await Project.findById(projectId);

        // Comprobamos si el proyecto existe
        if (!project) {
            return res.status(404).json({ error: "Proyecto no encontrado." });
        }

        // Creamos un nuevo objeto Corpus
        const corpus = new Corpus({
            "_id": new mongoose.Types.ObjectId(),
            "data": req.body,
            "project": projectId,
        });

        // Guardamos el nuevo Corpus en la base de datos
        const result = await corpus.save();

        // Enviamos la respuesta con el resultado
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
});


router.get("/:projectId", async (req, res) => {
    try {
        const projectId = req.params.projectId;
        
        // Comprobamos si el ID es válido antes de intentar buscar el proyecto
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "ID de proyecto no válido." });
        }

        // Buscamos el proyecto por su ID y verificamos si existe
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Proyecto no encontrado." });
        }

        // Buscamos todos los corpus relacionados con el proyecto
        const listaCorpus = await Corpus.find({ project: projectId });

        // Devolvemos la lista de corpus encontrados
        return res.status(200).json(listaCorpus);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
});

router.delete("/:corpusId", async (req, res) => {
    try {
        const corpusId = req.params.corpusId;

        // Comprobamos si el ID es válido antes de intentar eliminar el proyecto
        if (!mongoose.Types.ObjectId.isValid(corpusId)) {
            return res.status(400).json({ error: "ID de proyecto no válido." });
        }

        // Buscamos el proyecto por su ID y verificamos si existe
        const corpus = await Corpus.findById(corpusId);
        if (!corpus) {
            return res.status(404).json({ error: "corpus no encontrado." });
        }

        // Eliminamos el proyecto
        await Corpus.findByIdAndDelete(corpusId);

        return res.status(200).json({ message: "corpus eliminado correctamente." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
});



module.exports = router;