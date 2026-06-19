import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase.js';
import { toApiUser } from '../utils/map.js';

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export async function loadUser(req, res, next) {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, created_at, updated_at')
      .eq('id', req.userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    req.user = toApiUser(user);
    next();
  } catch {
    return res.status(500).json({ error: 'Error al cargar usuario' });
  }
}
