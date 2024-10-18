import Staff from "../models/staff.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { COOKIE_OPTIONS, EXPIRED_COOKIE_OPTIONS } from "../utils/constants.js";
import { generatePasswordResetEmail, sendEmail } from "../utils/email.js";
import deleteImage from "../utils/removeFromCloudinary.js";
import { v4 as uuidv4 } from "uuid";
import uploadCloudinary from "../utils/uploadOnCloundinary.js";

export const createStaff = async (req, res) => {
    const { name, email, password } = req.body;
    const filePath = req?.file?.path;
    if (![name, email, password, filePath].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    try {
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const response = await uploadCloudinary(filePath, req.file.filename);

        const staff = await Staff.create({
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
            message: `${staff.name} created successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if ([email, password].some((field) => !field || field.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };
        const staff = await Staff.findOne({ email })
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        };

        const passwordCorrect = await bcrypt.compare(password, staff.password);
        
        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credential"
            });
        }
        const loggedStaff = await Staff.findById(staff._id).select('-password')
        const token = generateToken(loggedStaff._id, loggedStaff.role);

        return res.status(200)
            .cookie("token", token, COOKIE_OPTIONS)
            .json({
                success: true,
                message: `${staff.name} login successfully`,
                data: loggedStaff,
                isAuthenticated: true,
                token
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const Logout = async (req, res) => {
    try {
        res.cookie("token", "", EXPIRED_COOKIE_OPTIONS)
        return res.status(200).json({
            success: true,
            isAuthenticated: false,
            message: "Staff successfully logged out"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


export const staffProfile = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const staff = await Staff.findById(id).select('-password');
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        } else {
            return res.status(200).json({
                success: true,
                data: staff
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const allStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 }).select('-password');
        return res.status(200).json({
            success: true,
            data: staff
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

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

export const updateProfile = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const staff = await Staff.findById(id); 
        if (!staff) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized staff"
            });
        }
        staff.name = req.body.name;
        staff.email = req.body.email;
        staff.role = req.body.role;

        if (req.file && req.file.path) {
            if (staff.photo && staff.photo.publicId) {
                await deleteImage(staff.photo.publicId); 
            }
            const response = await uploadCloudinary(req.file.path, req.file.filename); 
            staff.photo = {
                publicId: response.public_id,
                url: response.url
            };
        }

        if (req.body.password && req.body.newPassword) {
            const isCorrectPassword = await bcrypt.compare(req.body.password, staff.password);
            if (!isCorrectPassword) {
                return res.status(409).json({
                    success: false,
                    message: "Please provide the correct password"
                });
            }
            staff.password = await bcrypt.hash(req.body.newPassword, 10); 
        }

        const updatedStaff = await staff.save();
        return res.status(200).json({
            success: true,
            message: `${staff.name} updated successfully`,
            data: {
                _id: updatedStaff._id,
                name: updatedStaff.name,
                email: updatedStaff.email,
                role: updatedStaff.role,
                photo: updatedStaff.photo
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const deleteStaff = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const staff = await Staff.findById(id);
        if (!staff) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized staff"
            });
        }
        await deleteImage(staff.photo.publicId);
        await Staff.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: `${staff.name} deleted successfully`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


