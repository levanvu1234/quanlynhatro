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
    roombuilding: String, // tòa nhà
    phonenumber: String,
    // schedule: Date,
    condition: {
        type: String,
        default: "Hoạt động"
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
