import { Router } from 'express';
import { getSupabase } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { publishPost } from '../services/publisher.js';
import { enrichPosts, setPostAccounts } from '../db/posts.js';
import { toApiPost, toApiAccount } from '../utils/map.js';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const posts = await enrichPosts(data || []);
    res.json({ posts });
  } catch {
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('status')
      .eq('user_id', req.userId);

    if (error) throw error;

    const stats = { total: 0, drafts: 0, scheduled: 0, published: 0, failed: 0 };
    for (const row of data || []) {
      stats.total += 1;
      if (row.status === 'draft') stats.drafts += 1;
      if (row.status === 'scheduled') stats.scheduled += 1;
      if (row.status === 'published') stats.published += 1;
      if (row.status === 'failed') stats.failed += 1;
    }

    res.json({ stats });
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Publicación no encontrada' });

    const [post] = await enrichPosts([data]);
    res.json({ post });
  } catch {
    res.status(500).json({ error: 'Error al obtener publicación' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, mediaUrl, accountIds, scheduledAt } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'El contenido es obligatorio' });
    }

    if (!accountIds?.length) {
      return res.status(400).json({ error: 'Selecciona al menos una cuenta' });
    }

    const supabase = getSupabase();
    const { data: accounts, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .in('id', accountIds)
      .eq('user_id', req.userId)
      .eq('is_active', true);

    if (accError) throw accError;
    if (!accounts?.length) {
      return res.status(400).json({ error: 'No hay cuentas válidas seleccionadas' });
    }

    const platforms = [...new Set(accounts.map((a) => a.platform))];
    const status = scheduledAt ? 'scheduled' : 'draft';

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: req.userId,
        title: title?.trim() || '',
        content: content.trim(),
        media_url: mediaUrl?.trim() || null,
        platforms,
        status,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      })
      .select('*')
      .single();

    if (error) throw error;

    await setPostAccounts(post.id, accounts.map((a) => a.id));

    res.status(201).json({
      post: toApiPost(post, accounts.map(toApiAccount)),
    });
  } catch {
    res.status(500).json({ error: 'Error al crear publicación' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: existing, error: findError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: 'Publicación no encontrada' });

    if (existing.status === 'published') {
      return res.status(400).json({ error: 'No se puede editar una publicación ya publicada' });
    }

    const { title, content, mediaUrl, accountIds, scheduledAt } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (mediaUrl !== undefined) updates.media_url = mediaUrl.trim() || null;

    if (accountIds?.length) {
      const { data: accounts, error: accError } = await supabase
        .from('social_accounts')
        .select('*')
        .in('id', accountIds)
        .eq('user_id', req.userId)
        .eq('is_active', true);

      if (accError) throw accError;
      if (!accounts?.length) {
        return res.status(400).json({ error: 'No hay cuentas válidas seleccionadas' });
      }

      updates.platforms = [...new Set(accounts.map((a) => a.platform))];
      await setPostAccounts(existing.id, accounts.map((a) => a.id));
    }

    if (scheduledAt !== undefined) {
      updates.scheduled_at = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      updates.status = scheduledAt ? 'scheduled' : 'draft';
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;

    const [enriched] = await enrichPosts([post]);
    res.json({ post: enriched });
  } catch {
    res.status(500).json({ error: 'Error al actualizar publicación' });
  }
});

router.post('/:id/publish', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: post, error: findError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (findError) throw findError;
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });

    if (post.status === 'published') {
      return res.status(400).json({ error: 'Esta publicación ya fue publicada' });
    }

    const { data: links } = await supabase
      .from('post_accounts')
      .select('account_id')
      .eq('post_id', post.id);

    const accountIds = (links || []).map((l) => l.account_id);
    if (!accountIds.length) {
      return res.status(400).json({ error: 'No hay cuentas asociadas' });
    }

    const { data: accounts, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .in('id', accountIds)
      .eq('user_id', req.userId);

    if (accError) throw accError;
    if (!accounts?.length) {
      return res.status(400).json({ error: 'No hay cuentas asociadas' });
    }

    const apiAccounts = accounts.map(toApiAccount);
    const results = await publishPost(post, apiAccounts);
    const allSuccess = results.every((r) => r.success);
    const anySuccess = results.some((r) => r.success);

    const { data: updated, error } = await supabase
      .from('posts')
      .update({
        publish_results: results,
        published_at: anySuccess ? new Date().toISOString() : null,
        status: allSuccess || anySuccess ? 'published' : 'failed',
        scheduled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id)
      .select('*')
      .single();

    if (error) throw error;

    const [enriched] = await enrichPosts([updated]);
    res.json({ post: enriched, results });
  } catch {
    res.status(500).json({ error: 'Error al publicar' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Publicación no encontrada' });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar publicación' });
  }
});

export default router;
