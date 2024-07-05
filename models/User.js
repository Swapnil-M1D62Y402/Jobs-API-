const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Provide a name'],
        minlength: 4,
        maxlength: 20,
    },
    email: {
        type: String,
        required: [true, 'Please Provide an email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please Provide a password'],
        minlength: 6,
    },
})

//before saving the user data to DB, we want to hash the passwd.
//Note: Here this points to the document, or the user created

UserSchema.pre('save', async function (next) { 

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
})

//Instance Method to create token 
UserSchema.methods.createJWT = function () { 
    return jwt.sign(
        { userID: this._id, name: this.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME },
    );
}

UserSchema.methods.comparePassword = async function (candidatePassword) { 
    //compare the two hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

module.exports = mongoose.model("User", UserSchema);