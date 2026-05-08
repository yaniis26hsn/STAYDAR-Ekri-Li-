import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const SECRET = process.env.JWT_SECRET;

export const ifAuthenticated = async (req, res) => {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'missing or invalid authorization header' });
    }

    const token = header.split(' ')[1];

    try {
        const payload = jwt.verify(token, SECRET);
        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        return res.json(user);
    } catch {
        return res.status(403).json({ error: 'invalid token' });
    }
};
