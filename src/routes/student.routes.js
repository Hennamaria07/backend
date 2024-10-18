import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { createStudent, deleteStudent, getAllStudents, getStudentProfile, updateStudent } from "../controllers/student.controller.js";
import { authorizedAdminOrStaff, verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = Router();


router.route('/create').post(verifyUser, upload.single('photo'), createStudent);
router.route('/all').get(verifyUser, getAllStudents);
router.route('/:id').get(verifyUser, authorizedAdminOrStaff, getStudentProfile)
.put(verifyUser, authorizedAdminOrStaff, upload.single('photo'), updateStudent).delete(verifyUser, authorizedAdminOrStaff, deleteStudent);

export default router