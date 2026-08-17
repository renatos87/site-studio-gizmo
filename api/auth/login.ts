import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initialAdminUser } from '../_shared/initialData.js';

const DEFAULT_TOKEN = 'session-admin-token-secret-12345';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (email === initialAdminUser.email && (password === 'admin123' || password === 'admin')) {
    return res.status(200).json({
      success: true,
      user: {
        id: initialAdminUser.id,
        name: initialAdminUser.name,
        email: initialAdminUser.email,
        role: initialAdminUser.role,
        token: DEFAULT_TOKEN,
      },
    });
  }

  return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
}
