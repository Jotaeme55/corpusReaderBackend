const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Mongoose = require('mongoose');
const ConfirmationCode = require("../models/confirmationCode");

router.get('/:email', async (req, res) => {
    try {
      const aleatorio = Math.floor(Math.random() * Math.pow(10, 6)).toString().padStart(6, '0');
      const email = req.params.email;
  
      const confirmationCode = await ConfirmationCode.findOneAndUpdate(
        { email },
        { code: aleatorio },
        { upsert: true, runValidators: false, new: true, lean: true }
      );
  
      if (!sendConfirmationCode(aleatorio, email)) {
        throw new Error('Failed to send confirmation code. Please check your email address and try again.');
      }
  
      res.status(200).json({ mensaje: 'El código se ha enviado satisfactoriamente', status: 200 });
    } catch (error) {
      res.status(500).json({ mensaje: 'An error has occurred', error: error.message });
    }
  });

router.get('/email/:email/code/:code', async (req, res) => {
    try {
      const { email, code } = req.params;
  
      const confirmationCode = await ConfirmationCode.findOne({ email });
      if (!confirmationCode) {
        throw new Error('Código de confirmación no encontrado');
      }
  
      if (confirmationCode.code !== parseInt(code)) {
        throw new Error('El código no coincide');
      }
  
      const token = generateToken();
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ mensaje: 'An error has occurred', error: error.message });
    }
  });

const sendConfirmationCode = async (code,email) => {
    let res = true
    try{
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'jmtr2000@gmail.com', // Coloca aquí tu correo de Gmail
            pass: 'kdzdrtcldxhxcupi', // Coloca aquí tu contraseña de Gmail
            },
        });
        let info = await transporter.sendMail({
            from: 'jmtr2000@gmail.com',
            to: email,
            subject: 'Código de confirmación',
            text: `Tu código de confirmación es ${code}.`,
        });
        console.log('Mensaje enviado: %s', info.messageId);
    }catch(err){
        res = false
    }
    
    return res
    
    };

    function generateToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
          token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
      }

module.exports = router;