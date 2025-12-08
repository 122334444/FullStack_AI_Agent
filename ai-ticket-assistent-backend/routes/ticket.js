import exprress from 'express';
import {authenticate} from '../middlewares/auth.js';
import {getUser,login,signup,updateUser} from '../controllers/ticket.js';
const router = exprress.Router(); 

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);

export default router;

