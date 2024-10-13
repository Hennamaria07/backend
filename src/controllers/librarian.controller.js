import Librarian from "../models/librarian.model.js";
import uploadCloudinary from "../utils/uploadOnCloudinary";
import bcrypt from "bcryptjs";
import { sendEmail, generateVerificationEmail } from "../utils/emailUtil.js";
import generateToken from "../utils/generateToken.js";
import { COOKIE_OPTIONS, EXPIRED_COOKIE_OPTIONS } from "../utils/constants.js";
import { generatePasswordResetEmail } from "../utils/email.js";
import deleteImage from "../utils/removeFromCloudinary.js";
import otpGenerator from "otp-generator";
import { v4 as uuidv4 } from "uuid";

export const createLibrarian = async (req, res) => {
    const { name, email, password } = req.body;
    const filePath = req?.file?.path;

    if (![name, email, password, filePath].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    try {
        const existingLibrarian = await Librarian.findOne({ email });
        if (existingLibrarian) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const response = await uploadCloudinary(filePath, req.file.filename);

        const librarian = await Librarian.create({
            name,
            email,
            password: hashedPassword,
            photo: {
                publicId: response.public_id,
                url: response.url,
            },
        });

        const otp = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const emailContent = generateVerificationEmail(otp, librarian._id);
        await sendEmail(email, "Email Verification", emailContent);

        return res.status(201).json({
            success: true,
            message: `A verification email has been sent.`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const emailVerification = async (req, res) => {
    try {
        const { otp } = req.body;
        const { id } = req.params;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }

        const librarian = await Librarian.findById(id);
        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found"
            });
        }

        if (librarian.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Librarian is already verified"
            });
        }

        if (otp !== librarian.verificationToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (librarian.verificationTokenExpiry < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "OTP has expired"
            });
        }

        librarian.isVerified = true;
        librarian.verificationToken = undefined;
        librarian.verificationTokenExpiry = undefined;
        await librarian.save();

        const token = generateToken(librarian._id, librarian.role);

        return res.status(200).cookie("token", token, COOKIE_OPTIONS)
        .json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if ([email, password].some((field) => !field || field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };
        const librarian = await Librarian.findOne({ email })

        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found"
            });
        };
        if(librarian.isVerified === false) {
            const otp = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
            librarian.verificationToken = otp;
            librarian.verificationTokenExpiry = Date.now() + 300000;
            const emailContent = generateVerificationEmail(otp, librarian._id);
            await sendEmail(email, "Email Verification", emailContent);
            return res.status(401).json({
                success: false,
                message: "Librarian is not verified. Please check your email for verification"
            });
        }
        const passwordCorrect = await bcrypt.compare(password, librarian.password);
        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const loggedLibrarian = await Librarian.findById(librarian._id).select('-password');
        const token = generateToken(loggedLibrarian._id, loggedLibrarian.role);

        return res.status(200)
            .cookie("token", token, COOKIE_OPTIONS)
            .json({
                success: true,
                message: "Librarian logged in successfully",
                data: loggedLibrarian,
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

export const logout = async (req, res) => {
    try {
        res.cookie("token", "", EXPIRED_COOKIE_OPTIONS)
        return res.status(200).json({
            success: true,
            isAuthenticated: false,
            message: "Librarian successfully logged out"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const librarianProfile = async (req, res) => {
    try {
        const id = req.params.id || req.user._id;
        const librarian = await Librarian.findById(id).select('-password');
        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found"
            });
        } else {
            return res.status(200).json({
                success: true,
                data: librarian
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const allLibrarians = async (req, res) => {
    try {
        const librarians = await Librarian.find({isVerified: true}).select('-password');
        return res.status(200).json({
            success: true,
            data: librarians
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const librarian = await Librarian.findOne({ email });
        if (!librarian) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found"
            })
        }
        const token = uuidv4();
        librarian.forgotPasswordToken = token;
        librarian.forgotPasswordExpiry = Date.now() + 300000;
        await librarian.save();
        const emailContent = generatePasswordResetEmail(token, librarian._id);
        await sendEmail(email, "Password Reset", emailContent);
        return res.status(200).json({
            success: true,
            message: "Check your email for the reset link",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { librarian, token } = req.query;

        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }
        if (!librarian || !token) {
            return res.status(400).json({
                success: false,
                message: "Invalid Link"
            });
        }
        const librarianInfo = await Librarian.findById(librarian);
        if (!librarianInfo) {
            return res.status(404).json({
                success: false,
                message: "Librarian not found"
            });
        }
        if (token === librarianInfo.forgotPasswordToken && librarianInfo.forgotPasswordExpiry > Date.now()) {
            librarianInfo.password = await bcrypt.hash(password, 10);
            librarianInfo.forgotPasswordToken = undefined;
            librarianInfo.forgotPasswordExpiry = undefined;
            await librarianInfo.save();
            return res.status(200).json({
                success: true,
                message: "Password updated successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid token or token has expired"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateLibrarian = async (req, res) => {
    const id = req.params.id || req.user._id;
    const librarian = await Librarian.findById(id);

    if (!librarian) {
        return res.status(404).json({
            success: false,
            message: "Librarian not found"
        });
    }
    try {
        const { name, email } = req.body;

        const updates = {};

        if (name) updates.name = name;
        if (email) updates.email = email;

        const filePath = req?.file?.path;
        if (filePath) {
            // Delete the old photo from Cloudinary
            await deleteImage(librarian.photo.publicId);
            const response = await uploadCloudinary(filePath, req.file.filename);
            updates.photo = {
                publicId: response.public_id,
                url: response.url,
            };
        }
        
        const updatedLibrarian = await Librarian.findByIdAndUpdate(id, updates, { new: true }).select('-password');

        return res.status(200).json({
            success: true,
            message: "Librarian updated successfully",
            data: updatedLibrarian
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteLibrarian = async (req, res) => {
    const id = req.params.id || req.user._id;

    const librarian = await Librarian.findById(id);
    if (!librarian) {
        return res.status(404).json({
            success: false,
            message: "Librarian not found"
        });
    }
    try {
        await deleteImage(librarian.photo.publicId);
        await librarian.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Librarian deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
