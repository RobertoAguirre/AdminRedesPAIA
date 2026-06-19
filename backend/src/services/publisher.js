const PLATFORM_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

async function publishToPlatform(account, post) {
  // Simula publicación; conecta APIs reales con tokens OAuth en producción
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!account.isActive) {
    return {
      success: false,
      message: 'Cuenta inactiva',
    };
  }

  const externalId = `${account.platform}_${Date.now()}`;

  return {
    success: true,
    externalId,
    message: `Publicado en ${PLATFORM_LABELS[account.platform] || account.platform}`,
  };
}

export async function publishPost(post, accounts) {
  const results = [];

  for (const account of accounts) {
    try {
      const result = await publishToPlatform(account, post);
      results.push({
        account: account._id,
        platform: account.platform,
        success: result.success,
        externalId: result.externalId,
        message: result.message,
        publishedAt: result.success ? new Date().toISOString() : undefined,
      });
    } catch (err) {
      results.push({
        account: account._id,
        platform: account.platform,
        success: false,
        message: err.message || 'Error al publicar',
      });
    }
  }

  return results;
}

export { PLATFORM_LABELS };
