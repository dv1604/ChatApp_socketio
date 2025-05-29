import { Router } from "express"
import { createNewUser, getUserProfile, loginUser, logoutUser } from "../controllers/authController";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.post('/register', createNewUser);
router.post('/login', loginUser);
// below two routes are protected ie they require authetication
router.get('/me', authenticateUser ,getUserProfile);
router.post('/logout',authenticateUser,logoutUser)

export default router;