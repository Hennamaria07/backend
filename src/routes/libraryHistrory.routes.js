import { Router } from "express";
import { createLibraryHistory, deleteLibraryHistory, getLibraryHistories, getLibraryHistoryByStudentId, updateLibraryHistory } from "../controllers/libraryHistory.controller.js";

const router = Router();

router.route('/all').get(getLibraryHistories);
router.route('/create').post(createLibraryHistory);
router.route('/:id').get(getLibraryHistoryByStudentId)
.put(updateLibraryHistory).delete(deleteLibraryHistory);

export default router