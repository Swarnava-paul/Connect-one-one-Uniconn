const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    const token = jwt.sign({...payload},process.env.JWT_SECRET_KEY,{algorithm:'HS256'});
    return token;
}

module.exports = generateToken;