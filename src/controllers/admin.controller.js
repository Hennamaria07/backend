import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { COOKIE_OPTIONS, EXPIRED_COOKIE_OPTIONS } from "../utils/constants.js";
import deleteImage from "../utils/removeFromCloudinary.js";
import { v4 as uuidv4 } from "uuid";
import Admin from "../models/admin.model.js";
import uploadCloudinary from "../utils/uploadOnCloundinary.js";
import { sendEmail } from "../utils/email.js";

// Create Admin
export const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    const filePath = req?.file?.path;

    if (![name, email, password, filePath].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const response = await uploadCloudinary(filePath, req.file.filename);

        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            photo: {
                publicId: response.public_id,
                url: response.url,
            },
        });

        return res.status(201).json({
            success: true,
            message: `${admin.name} created successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Sign In
export const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if ([email, password].some((field) => !field || field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const admin = await Admin.findOne({ email })

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        };

        const passwordCorrect = await bcrypt.compare(password, admin.password);
        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = generateToken(admin._id, admin.role);

        return res.status(200)
            .cookie("token", token, COOKIE_OPTIONS)
            .json({
                success: true,
                message: "Admin login successfully",
                data: admin,
                isAuthenticated: true,
                token
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Logout
export const Logout = async (req, res) => {
    try {
        res.cookie("token", "", EXPIRED_COOKIE_OPTIONS);
        return res.status(200).json({
            success: true,
            isAuthenticated: false,
            message: "Admin successfully logged out"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin Profile
export const adminProfile = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const admin = await Admin.findById(id).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        } else {
            return res.status(200).json({
                success: true,
                data: admin
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Profile
export const updateProfile = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const admin = await Admin.findById(id); 
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized admin"
            });
        }

        admin.name = req.body.name;
        admin.email = req.body.email;

        if (req.file && req.file.path) {
            if (admin.photo && admin.photo.publicId) {
                await deleteImage(admin.photo.publicId); 
            }
            const response = await uploadCloudinary(req.file.path, req.file.filename); 
            admin.photo = {
                publicId: response.public_id,
                url: response.url
            };
        }

        if (req.body.password && req.body.newPassword) {
            const isCorrectPassword = await bcrypt.compare(req.body.password, admin.password);
            if (!isCorrectPassword) {
                return res.status(409).json({
                    success: false,
                    message: "Please provide the correct password"
                });
            }
            admin.password = await bcrypt.hash(req.body.newPassword, 10); 
        }

        const updatedAdmin = await admin.save();
        return res.status(200).json({
            success: true,
            message: "Admin updated successfully",
            data: {
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                photo: updatedAdmin.photo
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Admin
export const deleteAdmin = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized admin"
            });
        }
        await deleteImage(admin.photo.publicId);
        await admin.remove();
        return res.status(200).json({
            success: true,
            message: "Admin deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            })
        }
        const token = uuidv4();
        staff.forgotPasswordToken = token;
        staff.forgotPasswordExpiry = Date.now() + 300000;
        await staff.save();
        const emailContent = generatePasswordResetEmail(token, staff._id);
        await sendEmail(email, "Email Verification", emailContent);
        return res.status(200).json({
            success: true,
            data: staff,
            message: "Check your email",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const ResetPassword = async (req, res) => {
    try {
        const { staff, token } = req.query;

        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }
        if (!staff || !token) {
            return res.status(400).json({
                success: false,
                message: "Invalid Link"
            });
        }
        const staffInfo = await Staff.findById(staff);
        if (!staffInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (token === staffInfo.forgotPasswordToken && staffInfo.forgotPasswordExpiry > Date.now()) {
            staffInfo.password = await bcrypt.hash(password, 10);
            staffInfo.forgotPasswordToken = undefined;
            staffInfo.forgotPasswordExpiry = undefined;
            await staffInfo.save();
            return res.status(200).json({
                success: true,
                message: "Password updated successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
