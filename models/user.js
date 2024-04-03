const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    isAdmin: {
        type: Boolean,
        default: false,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    projects:[
        {
            type: mongoose.Schema.Types.ObjectId, ref:"Project"
        }
    ]
}); 

module.exports = mongoose.model('User', userSchema);