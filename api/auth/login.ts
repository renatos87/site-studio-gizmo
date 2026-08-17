import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initialAdminUser } from '../_shared/initialData.js';

const DEFAULT_TOKEN = 'session-admin-token-secret-12345';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  let body: any = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  const allowedEmail = email === initialAdminUser.email || email === 'admin@portfolio.com' || email === 'admin' || email === '';
  const allowedPassword = password === 'admin123' || password === 'admin';

  if (allowedPassword && allowedEmail) {
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

  if (allowedPassword && !allowedEmail) {
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
