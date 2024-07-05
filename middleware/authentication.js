const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Unauthenticated } = require('../errors');
const { StatusCode } = require('http-status-codes');

const auth = async (req, res, next) => { 
    //check header 
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
        throw new Unauthenticated('Authentication Invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
    //we are just accessing the userid and name which we passed when creating the token 
        req.user = { userID: payload.userID, name: payload.name };
        next();
    }
    catch (err) { 
        res.status(StatusCode.Unauthenticated).json({err});
        next();
    }
}

module.exports = auth;