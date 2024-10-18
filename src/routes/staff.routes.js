import { Router } from "express";
import { allStaff, createStaff, deleteStaff, Logout, SignIn, staffProfile, updateProfile } from "../controllers/staff.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { authorizedAdmin, verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = Router();

router.route('/all').get(verifyUser, authorizedAdmin, allStaff);
router.route('/create').post(verifyUser, authorizedAdmin, upload.single('photo'), createStaff);
router.route('/login').post(SignIn);
router.route('/logout').post(Logout);
router.route('/:id').get(verifyUser, authorizedAdmin, staffProfile)
.put(verifyUser, authorizedAdmin, upload.single('photo'), updateProfile).delete(verifyUser, authorizedAdmin, deleteStaff);

export default router