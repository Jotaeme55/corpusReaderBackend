const mongoose = require('mongoose');

const confirmationCodeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true
    },
    code :{
        type: Number,
        required: true,
    } ,
    createdAt : { type: Date, expires: 600 , default: Date.now }
}); 

module.exports = mongoose.model('ConfirmationCode', confirmationCodeSchema);