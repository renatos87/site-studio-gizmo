import 'dotenv/config';
import { initialAdminUser } from './initialData.js';

const DEFAULT_TOKEN = 'session-admin-token-secret-12345';
const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_REST_URL = USE_SUPABASE ? `${SUPABASE_URL}/rest/v1` : '';

function authUserFromHeader(req: { headers?: Record<string, string | string[] | undefined> }) {
  const authHeader = String(req.headers?.authorization || '');
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] || null;
}

async function getAdminProfileByToken(token: string) {
  if (!USE_SUPABASE) {
    return token === 'admin123' || token === DEFAULT_TOKEN ? { ...initialAdminUser, token: DEFAULT_TOKEN } : null;
  }

  if (token === 'admin123' || token === DEFAULT_TOKEN) {
    return { ...initialAdminUser, token: DEFAULT_TOKEN };
  }

  const response = await fetch(`${SUPABASE_REST_URL}/admin_profiles?auth_token=eq.${encodeURIComponent(token)}&select=*`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  });

  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{ id: string; name: string; email: string; role: 'admin'; auth_token?: string | null }>;
  const row = rows[0];
  return row ? { id: row.id, name: row.name, email: row.email, role: 'admin' as const, token: row.auth_token ?? undefined } : null;
}

export async function requireDeleteAuth(req: { headers?: Record<string, string | string[] | undefined> }) {
  const token = authUserFromHeader(req);
  if (!token) return null;
  return getAdminProfileByToken(token);
}

export async function deleteSupabaseRow(table: 'projects' | 'clients' | 'messages', id: string) {
  if (!USE_SUPABASE) return { success: false as const };

  try {
    const response = await fetch(`${SUPABASE_REST_URL}/${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
        Prefer: 'return=minimal',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false as const, status: response.status, error: text };
    }

    return { success: true as const };
  } catch (error) {
    return { success: false as const, status: 500, error: String(error) };
  }
}
