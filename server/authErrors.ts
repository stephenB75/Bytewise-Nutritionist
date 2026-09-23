export function isSupabaseRateLimit(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('too many') ||
    lower.includes('once every') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('429')
  );
}

export function rateLimitResponse(message: string) {
  return {
    status: 429 as const,
    body: {
      message,
      code: 'RATE_LIMIT' as const,
    },
  };
}
