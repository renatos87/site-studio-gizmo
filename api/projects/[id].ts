import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteSupabaseRow, requireDeleteAuth } from '../_shared/deleteHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if ((req.method || 'GET').toUpperCase() !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireDeleteAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const id = String(req.query.id || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'ID do projeto é obrigatório.' });
  }

  const deleted = await deleteSupabaseRow('projects', id);
  if (!deleted.success && deleted.status !== 404) {
    return res.status(500).json({ error: 'Erro ao excluir projeto.', details: deleted.error });
  }

  return res.status(200).json({ success: true, message: 'Projeto excluído com sucesso.' });
}
