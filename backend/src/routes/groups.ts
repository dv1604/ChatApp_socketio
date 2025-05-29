import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { createGroup, getGroupDetails, getUserGroups } from "../controllers/groupsController";
import { addGroupMember, removeMember } from "../controllers/groupMembers";

const router = Router();

router.post('/', authenticateUser, createGroup);
router.get('/me', authenticateUser, getUserGroups);
router.get('/:id', authenticateUser, getGroupDetails);
router.post('/:id/members', authenticateUser, addGroupMember);
router.post('/:id/members/:userId', authenticateUser, removeMember);

export default router;
