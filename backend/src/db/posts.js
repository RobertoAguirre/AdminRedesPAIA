import { getSupabase } from '../config/supabase.js';
import { toApiAccount, toApiPost } from '../utils/map.js';

export async function enrichPosts(rows) {
  if (!rows?.length) return [];

  const supabase = getSupabase();
  const postIds = rows.map((r) => r.id);

  const { data: links } = await supabase
    .from('post_accounts')
    .select('post_id, account_id')
    .in('post_id', postIds);

  const accountIds = [...new Set((links || []).map((l) => l.account_id))];
  let accounts = [];

  if (accountIds.length) {
    const { data } = await supabase
      .from('social_accounts')
      .select('id, user_id, platform, account_name, account_id, is_active, created_at, updated_at')
      .in('id', accountIds);
    accounts = data || [];
  }

  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, toApiAccount(a)]));
  const byPost = {};

  for (const link of links || []) {
    if (!byPost[link.post_id]) byPost[link.post_id] = [];
    const acc = accountMap[link.account_id];
    if (acc) byPost[link.post_id].push(acc);
  }

  return rows.map((row) => toApiPost(row, byPost[row.id] || []));
}

export async function setPostAccounts(postId, accountIds) {
  const supabase = getSupabase();

  await supabase.from('post_accounts').delete().eq('post_id', postId);

  if (!accountIds.length) return;

  const rows = accountIds.map((accountId) => ({ post_id: postId, account_id: accountId }));
  const { error } = await supabase.from('post_accounts').insert(rows);
  if (error) throw error;
}
