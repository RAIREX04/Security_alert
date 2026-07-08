export function isLikelyNetworkError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybe = error as {
    code?: string;
    message?: string;
    response?: { status?: number };
  };

  if (!maybe.response) {
    return true;
  }

  const status = maybe.response.status;
  if (status == null) {
    return true;
  }

  if (status >= 500) {
    return true;
  }

  if (maybe.code === 'ERR_NETWORK' || maybe.code === 'ECONNABORTED') {
    return true;
  }

  const message = maybe.message?.toLowerCase() ?? '';
  return message.includes('network') || message.includes('timeout');
}
