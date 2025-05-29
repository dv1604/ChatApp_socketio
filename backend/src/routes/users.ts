import { Router } from "express";
import { getUserById, getUsers } from "../controllers/usersController";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.get('/', authenticateUser, getUsers);
router.get('/:id', authenticateUser, getUserById);

export default router;