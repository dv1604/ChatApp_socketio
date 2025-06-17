import { Router } from "express"
import { createNewUser, getUserProfile, loginUser, logoutUser } from "../controllers/authController";
import { authenticateUser } from "../middleware/auth";
import { verifyUser } from "../controllers/usersController";

const router = Router();

router.post('/register', createNewUser);
router.post('/login', loginUser);
// below two routes are protected ie they require authetication
router.get('/me', authenticateUser ,getUserProfile);
router.patch('/logout', authenticateUser, logoutUser);

router.get('/verify', verifyUser);

export default router;