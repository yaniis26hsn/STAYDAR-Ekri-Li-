import { Router } from 'express';
import { chatWithBot } from '../controllers/chatbot.js';


const router = Router();

router.post('/chatbot', chatWithBot);
// even non loged in users can use it 

export default router;