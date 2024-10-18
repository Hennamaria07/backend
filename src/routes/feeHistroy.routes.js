import { Router } from "express";
import { createFeesHistory, deleteFeesHistory, getAllFeesHistory, getFeesHistoryByStudentId, updateFeesHistory } from "../controllers/feesHistory.controller.js";

const router = Router();

router.route('/all').get(getAllFeesHistory);
router.route('/create').post(createFeesHistory);
router.route('/:id').get(getFeesHistoryByStudentId)
.put(updateFeesHistory).delete(deleteFeesHistory);

export default router