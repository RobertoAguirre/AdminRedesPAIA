export function toApiUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toApiAccount(row) {
  return {
    _id: row.id,
    user: row.user_id,
    platform: row.platform,
    accountName: row.account_name,
    accountId: row.account_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toApiPost(row, accounts = []) {
  return {
    _id: row.id,
    user: row.user_id,
    title: row.title,
    content: row.content,
    mediaUrl: row.media_url,
    platforms: row.platforms || [],
    accounts,
    status: row.status,
    scheduledAt: row.scheduled_at,
    publishedAt: row.published_at,
    publishResults: row.publish_results || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
