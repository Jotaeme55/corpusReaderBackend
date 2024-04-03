const mongoose = require('mongoose');

const jwtToken = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id_asociated: {
        type: String,
        required: true,
        unique: true
    },
    code :{
        type: Number,
        required: true,
    } ,
}); 

module.exports = mongoose.model('jwtToken', jwtToken);