import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { adminProfile, createAdmin, deleteAdmin, Logout, SignIn, updateProfile } from "../controllers/admin.controller.js";
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = Router();

router.route('/create').get(createAdmin);
router.route('/login').post(SignIn);
router.route('/logout').post(Logout);
router.route('/:id').get(verifyUser, adminProfile)
.put(verifyUser, upload.single('photo'), updateProfile).delete(verifyUser, deleteAdmin);

export default router