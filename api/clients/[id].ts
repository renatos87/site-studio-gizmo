import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clientModelToRow, deleteSupabaseRow, getSupabaseAdminClient, requireCrudAuth } from '../_shared/crudHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = (req.method || 'GET').toUpperCase();
  const id = String(req.query.id || '').trim();
  if (!id) return res.status(400).json({ error: 'ID do cliente é obrigatório.' });

  const auth = await requireCrudAuth(req);
  if (!auth) return res.status(401).json({ error: 'Não autorizado.' });

  if (method === 'DELETE') {
    const deleted = await deleteSupabaseRow('clients', id);
    if (!deleted.success && deleted.status !== 404) {
      return res.status(500).json({ error: 'Erro ao excluir cliente.', details: deleted.error });
    }
    return res.status(200).json({ success: true, message: 'Cliente excluído com sucesso.' });
  }

  if (method === 'PUT') {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return res.status(500).json({ error: 'Supabase não configurado.' });
    const payload = clientModelToRow({ ...req.body, id, updatedAt: new Date().toISOString() });
    const { data, error } = await supabase.from('clients').update(payload).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: 'Erro ao salvar cliente.', details: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
