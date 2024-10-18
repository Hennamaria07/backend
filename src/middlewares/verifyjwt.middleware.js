import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import Staff from "../models/staff.model.js";
import Librarian from "../models/librarian.model.js";
import Student from "../models/student.model.js";

export const verifyUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthenticated request",
                isAuthenticated: false
            });
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        
        // Determine the user model based on the role
        let user;
        switch (decodedToken.role) {
            case 'admin':
                user = await Admin.findById(decodedToken._id);
                break;
            case 'staff':
                user = await Staff.findById(decodedToken._id);
                break;
            case 'librarian':
                user = await Librarian.findById(decodedToken._id);
                break;
            default:
                return res.status(401).json({
                    success: false,
                    message: "Invalid role",
                    isAuthenticated: false
                });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                isAuthenticated: false
            });
        }

        req.user = user;
        next(); 
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            isAuthenticated: false,
            tokenExpired: error.expiredAt
        });
    }
};

export const authorizedAdmin = async (req, res, next) => {
    if(req.user && req.user.role === 'admin') {
        next()
    } else {
        return res.status(401).json({
            success: false,
            message:"Not authorized as an admin",
            isAuthenticated: false
        });
    }
}

export const authorizedAdminOrStaff = async (req, res, next) => {
    if(req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next()
    } else {
        return res.status(401).json({
            success: false,
            message:"Not authorized as an admin or staff",
            isAuthenticated: false
        });
    }
}

export const authorizedLibrarian = async (req, res, next) => {
    if(req.user && req.user.role === 'librarian') {
        next()
    } else {
        return res.status(401).json({
            success: false,
            message:"Not authorized as an librarian",
            isAuthenticated: false
        });
    }
}

export const authorizedStaff = async (req, res, next) => {
    if(req.user && req.user.role === 'staff') {
        next()
    } else {
        return res.status(401).json({
            success: false,
            message:"Not authorized as an staff",
            isAuthenticated: false
        });
    }
}