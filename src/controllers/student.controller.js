import bcrypt from "bcryptjs";
import deleteImage from "../utils/removeFromCloudinary.js";
import uploadCloudinary from "../utils/uploadOnCloundinary.js";
import Student from "../models/student.model.js";

// Create new student with photo upload
export const createStudent = async (req, res) => {
    console.log(req.body, 'createStudent');
    const { name, email,dateOfBirth, gender, studentClass, 
            contactInfo, guardian } = req.body;
    const filePath = req?.file?.path;
    const parseContactInfo = JSON.parse(contactInfo);
    const parseGuardian = JSON.parse(guardian);
console.log(filePath, 'createStudent');
    // Validate required fields
    if (![name, email, dateOfBirth, gender, studentClass, filePath].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    try {
        // Check for existing email
        const existingStudent = await Student.findOne({ email: parseContactInfo.email });
        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        const response = await uploadCloudinary(filePath, req.file.filename);

        // Create student with photo
        const student = await Student.create({
            name,
            dateOfBirth,
            gender,
            class: studentClass,
            contactInfo: parseContactInfo,
            guardian: parseGuardian,
            photo: {
                publicId: response.public_id,
                url: response.url,
            },
        });

        return res.status(201).json({
            success: true,
            message: `Student ${student.name} created successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get student profile
export const getStudentProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await Student.findById(id)

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all students
export const getAllStudents = async (req, res) => {
    try {

        const students = await Student.find({});

        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update student profile
export const updateStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await Student.findById(id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Update basic info
        const updateFields = ['name', 'dateOfBirth', 'gender', 'class' 
                            ,'status'];

                            const parseContactInfo = JSON.parse(req.body.contactInfo);
                            const parseGuardian = JSON.parse(req.body.guardian);
        updateFields.forEach(field => {
            if (req.body[field]) {
                student[field] = req.body[field];
            }
        });

        // Update photo if provided
        if (req.file && req.file.path) {
            if (student.photo && student.photo.publicId) {
                await deleteImage(student.photo.publicId);
            }
            const response = await uploadCloudinary(req.file.path, req.file.filename);
            student.photo = {
                publicId: response.public_id,
                url: response.url
            };
        }

        // Update password if provided
        if (req.body.currentPassword && req.body.newPassword) {
            const isCorrectPassword = await bcrypt.compare(
                req.body.currentPassword, 
                student.password
            );
            if (!isCorrectPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }
            student.password = await bcrypt.hash(req.body.newPassword, 10);
        }
        if(parseContactInfo) {
            student.contactInfo = parseContactInfo;
        }    
        if(parseGuardian) {
            student.guardian = parseGuardian;
        }

        const updatedStudent = await student.save();

        return res.status(200).json({
            success: true,
            message: `Student ${updatedStudent.name} updated successfully`,
            data: {
                _id: updatedStudent._id,
                name: updatedStudent.name,
                dateOfBirth: updatedStudent.dateOfBirth,
                gender: updatedStudent.gender,
                class: updatedStudent.class,
                contactInfo: updatedStudent.contactInfo,
                guardian: updatedStudent.guardian,
                status: updatedStudent.status,
                photo: updatedStudent.photo
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete student
export const deleteStudent = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await LibraryHistory.deleteMany({ student: id });
        await FeesHistory.deleteMany({ student: id });

        if (student.photo && student.photo.publicId) {
            await deleteImage(student.photo.publicId);
        }

        await Student.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: `Student ${student.name} and all associated records deleted successfully`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export default {
    createStudent,
    getStudentProfile,
    getAllStudents,
    updateStudent,
    deleteStudent
};