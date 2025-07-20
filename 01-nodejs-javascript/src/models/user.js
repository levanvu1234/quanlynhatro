const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }],
    building: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building'
    },
    activity: String,
    roombuilding: String,
    phonenumber: String,
    // schedule: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
