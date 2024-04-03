const mongoose = require('mongoose');

const corpusSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    data: mongoose.Schema.Types.Mixed,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    creationDate:{
        type: Date,
        default: Date.now,
    }
}); 

module.exports = mongoose.model('Corpus', corpusSchema);