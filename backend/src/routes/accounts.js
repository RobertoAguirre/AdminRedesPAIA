import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { PLATFORMS } from '../constants.js';
import { toApiAccount } from '../utils/map.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ accounts: (data || []).map(toApiAccount) });
  } catch {
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
});

router.get('/platforms', (_req, res) => {
  res.json({ platforms: PLATFORMS });
});

router.post('/', async (req, res) => {
  try {
    const { platform, accountName, accountId, accessToken } = req.body;

    if (!platform || !accountName?.trim()) {
      return res.status(400).json({ error: 'Plataforma y nombre de cuenta son obligatorios' });
    }

    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: 'Plataforma no soportada' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('social_accounts')
      .insert({
        user_id: req.userId,
        platform,
        account_name: accountName.trim(),
        account_id: accountId?.trim() || null,
        access_token: accessToken?.trim() || null,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Esta cuenta ya está conectada' });
      }
      throw error;
    }

    res.status(201).json({ account: toApiAccount(data) });
  } catch {
    res.status(500).json({ error: 'Error al conectar cuenta' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { accountName, isActive } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (accountName !== undefined) updates.account_name = accountName.trim();
    if (isActive !== undefined) updates.is_active = isActive;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('social_accounts')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cuenta no encontrada' });

    res.json({ account: toApiAccount(data) });
  } catch {
    res.status(500).json({ error: 'Error al actualizar cuenta' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cuenta no encontrada' });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
});

export default router;
