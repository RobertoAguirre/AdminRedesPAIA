import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabase.js';
import { toApiUser } from '../utils/map.js';
import { auth } from '../middleware/auth.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const supabase = getSupabase();
    const normalizedEmail = email.toLowerCase().trim();

    const { data: exists } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (exists) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
      })
      .select('id, name, email')
      .single();

    if (error) throw error;

    const token = signToken(user.id);
    res.status(201).json({ token, user: toApiUser(user) });
  } catch {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = signToken(user.id);
    res.json({ token, user: toApiUser(user) });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, created_at, updated_at')
      .eq('id', req.userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ user: toApiUser(user) });
  } catch {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

export default router;
