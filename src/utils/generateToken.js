import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
    return jwt.sign(
        {
            _id: userId,
            role: role
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export default generateToken;