const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => { 

    const user = await User.create({ ...req.body }); 
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ token: token, user: {name: user.name} });
    
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) { 
        throw new BadRequestError("Please provide email and password");
    }
    //compare password
    
    const user = await User.findOne({ email }); //search the DB wrt email to get the user
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!user) {
        throw new UnauthenticatedError('Invalid email');
    }
    else if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid password');
    }
    else { 
        const token = user.createJWT();
        res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
    } 
}

module.exports = {
    register,
    login
}