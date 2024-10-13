import FeesHistory from '../models/feesHistory.model';
import LibraryHistory from '../models/libraryHistroy.model';
import Student from './models/Student';

export const createStudent = async (req, res) => {
    const { 
        name, 
        dateOfBirth, 
        gender, 
        standard, 
        contactInfo, 
        guardian 
    } = req.body;

    if ([name, dateOfBirth, gender, standard, contactInfo, guardian].some(field => !field)) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
    }

    const { phone, email, address } = contactInfo || {};
    if (![phone, email, address].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "Contact information (phone, email, and address) is required",
        });
    }

    const { street, city, state, postalCode } = address || {};
    if (![street, city, state, postalCode].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "Complete address is required",
        });
    }
    const { guardianName, relationship, guardianPhone, guardianEmail } = guardian || {};
    if (![guardianName, relationship, guardianPhone, guardianEmail].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "Complete guardian details are required (name, relationship, phone, and email)",
        });
    }

    try {
        const existingStudent = await Student.findOne({ 
            $or: [{ 'contactInfo.email': email }, { 'guardian.email': guardianEmail }] 
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "A student or guardian with this email already exists",
            });
        }

        const student = await Student.create({
            name,
            dateOfBirth,
            gender,
            class: standard,
            contactInfo: {
                phone,
                email,
                address,
            },
            guardian: {
                name: guardianName,
                relationship,
                phone: guardianPhone,
                email: guardianEmail,
            },
        });

        return res.status(201).json({
            success: true,
            message: `${student.name} created successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        return res.status(200).json({
            success: true,
            students
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findById(id);
        return res.status(200).json({
            success: true,
            student
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await LibraryHistory.deleteMany({ student: id });
        await FeesHistory.deleteMany({ student: id });
        await Student.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: `Student deleted successfully`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { 
        name, 
        dateOfBirth, 
        gender, 
        standard, 
        contactInfo, 
        guardian,
        status,
        enrollmentDate
    } = req.body;

    if (![name, dateOfBirth, gender, standard, contactInfo, guardian].some(field => field)) {
        return res.status(400).json({
            success: false,
            message: "At least one of the required fields must be provided",
        });
    }

    const { phone, email, address } = contactInfo || {};
    if (contactInfo && ![phone, email, address].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "Contact information (phone, email, and address) is required",
        });
    }

    const { street, city, state, postalCode } = address || {};
    if (address && ![street, city, state, postalCode].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "Complete address is required",
        });
    }

    const { guardianName, relationship, guardianPhone, guardianEmail } = guardian || {};
    if (guardian && ![guardianName, relationship, guardianPhone, guardianEmail].every(field => field)) {
        return res.status(400).json({
            success: false,
            message: "Complete guardian details are required (name, relationship, phone, and email)",
        });
    }

    try {
        const existingStudent = await Student.findOne({ 
            _id: { $ne: id },
            $or: [{ 'contactInfo.email': email }, { 'guardian.email': guardianEmail }] 
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "A student or guardian with this email already exists",
            });
        }

        const student = await Student.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(dateOfBirth && { dateOfBirth }),
                ...(gender && { gender }),
                ...(standard && { class: standard }),
                ...(status && { status }), 
                ...(enrollmentDate && { enrollmentDate }),
                ...(contactInfo && {
                    contactInfo: {
                        ...(phone && { phone }),
                        ...(email && { email }),
                        ...(address && {
                            address: {
                                ...(street && { street }),
                                ...(city && { city }),
                                ...(state && { state }),
                                ...(postalCode && { postalCode }),
                            }
                        })
                    }
                }),
                ...(guardian && {
                    guardian: {
                        ...(guardianName && { name: guardianName }),
                        ...(relationship && { relationship }),
                        ...(guardianPhone && { phone: guardianPhone }),
                        ...(guardianEmail && { email: guardianEmail }),
                    }
                }),
            },
            { new: true } 
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `${student.name} updated successfully`,
            student,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

