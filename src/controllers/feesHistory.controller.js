import FeesHistory from '../models/FeesHistory.js';
import Student from '../models/Student.js'; // Assuming the Student model is in the same directory

// Create Fees History
export const createFeesHistory = async (req, res) => {
    const { student, feeType, amount, paymentDate, remarks } = req.body;

    if ([student, feeType, amount, paymentDate].some(field => !field || field.length === 0)) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required',
        });
    }

    try {
        const existingStudent = await Student.findById(student);
        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        const feesHistory = new FeesHistory({
            student,
            feeType,
            amount,
            paymentDate,
            remarks: remarks || '',
            status: 'Pending',
        });

        await feesHistory.save();

        existingStudent.feesHistory.push(feesHistory._id);
        await existingStudent.save();

        return res.status(201).json({
            success: true,
            message: 'Fees details added successfully',
            data: feesHistory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all Fees History
export const getAllFeesHistory = async (req, res) => {
    try {
        const feesHistory = await FeesHistory.find().populate('student', 'name email');

        return res.status(200).json({
            success: true,
            data: feesHistory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Fees History by Student ID
export const getFeesHistoryByStudentId = async (req, res) => {
    const { id } = req.params;

    try {
        const feesHistory = await FeesHistory.find({ student: id });

        return res.status(200).json({
            success: true,
            data: feesHistory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Fees History
export const updateFeesHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const feesHistory = await FeesHistory.findById(id);
        if (!feesHistory) {
            return res.status(404).json({
                success: false,
                message: 'Fees history not found',
            });
        }

        const { feeType, amount, paymentDate, remarks } = req.body;

        // Update fields conditionally
        if (feeType) feesHistory.feeType = feeType;
        if (amount) feesHistory.amount = amount;
        if (paymentDate) feesHistory.paymentDate = paymentDate;
        if (remarks) feesHistory.remarks = remarks;

        await feesHistory.save();

        return res.status(200).json({
            success: true,
            message: 'Fees history updated successfully',
            data: feesHistory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Fees History
export const deleteFeesHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const feesHistory = await FeesHistory.findById(id);
        if (!feesHistory) {
            return res.status(404).json({
                success: false,
                message: 'Fees history not found',
            });
        }

        await feesHistory.deleteOne();

        const student = await Student.findById(feesHistory.student);
        if (student) {
            student.feesHistory.pull(id); 
            await student.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Fees history deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
