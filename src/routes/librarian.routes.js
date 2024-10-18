import { Router } from "express";
import { allLibrarians, createLibrarian, deleteLibrarian, librarianProfile, logout, signIn, updateLibrarian } from "../controllers/librarian.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/all').get(allLibrarians);
router.route('/create').post(upload.single('photo'), createLibrarian);
router.route('/login').post(signIn);
router.route('/logout').post(logout);
router.route('/:id').get(librarianProfile)
.put(upload.single('photo'), updateLibrarian).delete(deleteLibrarian);

export default router