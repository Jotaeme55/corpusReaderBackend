const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    public: Boolean,
    description: String,
    token: String,
    userAsociated: {
        type: String,
        required: true,
    },
    creationDate:{
        type: Date,
        default: Date.now,
    }
}); 

module.exports = mongoose.model('Project', projectSchema);