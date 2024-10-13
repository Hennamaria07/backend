import LibraryHistory from "../models/libraryHistroy.model.js";
import Student from "../models/student.model.js";

export const createLibraryHistory = async (req, res) => {
    const { student, bookName, borrowDate, returnDate, status = 'Borrowed' } = req.body;
    if ([student, bookName, borrowDate].some(field => !field || field.length === 0)) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    try {
        const newLibraryHistory = new LibraryHistory({
            student,
            bookName,
            borrowDate,
            returnDate,
            status
        });

        await newLibraryHistory.save();
        const studentInfo = await Student.findById(student);
        if (!studentInfo) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        studentInfo.libraryHistory.push(newLibraryHistory._id);
        await studentInfo.save();

        res.status(201).json({
            success: true,
            data: newLibraryHistory,
            message: 'Library history created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getLibraryHistories = async (req, res) => {
    try {
        const libraryHistories = await LibraryHistory.find().populate('student', 'name class');
        res.status(200).json({
            success: true,
            data: libraryHistories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getLibraryHistoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const libraryHistory = await LibraryHistory.findById(id).populate('student', 'name class');
        if (!libraryHistory) {
            return res.status(404).json({
                success: false,
                message: 'Library history not found'
            });
        }
        res.status(200).json({
            success: true,
            data: libraryHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateLibraryHistory = async (req, res) => {
    const { id } = req.params;
    const { bookName, borrowDate, returnDate, status } = req.body;

    try {
        const updatedLibraryHistory = await LibraryHistory.findByIdAndUpdate(
            id,
            { bookName, borrowDate, returnDate, status },
            { new: true }
        );

        if (!updatedLibraryHistory) {
            return res.status(404).json({
                success: false,
                message: 'Library history not found'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedLibraryHistory,
            message: 'Library history updated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message
         });
    }
};

export const deleteLibraryHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const libraryHistory = await LibraryHistory.findById(id);
        const student = await Student.findById(libraryHistory.student);
        if (student) {
            student.feesHistory.pull(id); 
            await student.save();
        }
        const deletedLibraryHistory = await LibraryHistory.findByIdAndDelete(id);
        if (!deletedLibraryHistory) {
            return res.status(404).json({
                success: false,
                message: 'Library history not found'
             });
        }
        res.status(200).json({
            success: true,
            message: 'Library history deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getLibraryHistoryByStudentId = async (req, res) => {
    const { id } = req.params;
    try {
        const libraryHistories = await LibraryHistory.find({student: id}).populate('student', 'name class');
        res.status(200).json({
            success: true,
            data: libraryHistories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
