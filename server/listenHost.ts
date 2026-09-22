/** Hostnames must never be used for bind — DNS resolves to remote IPs and crashes on Railway. */
const ALLOWED_BIND_HOSTS = new Set(['0.0.0.0', '127.0.0.1', '::', 'localhost']);

export function getListenHost(): string {
  if (process.env.NODE_ENV === 'production') {
    return '0.0.0.0';
  }

  const raw = process.env.HOST?.trim();
  if (!raw || raw === '::') {
    return '0.0.0.0';
  }

  if (ALLOWED_BIND_HOSTS.has(raw)) {
    return raw === '::' ? '0.0.0.0' : raw;
  }

  console.warn(
    `Ignoring HOST="${raw}" — bind only to 0.0.0.0 on cloud hosts (do not set HOST to your database hostname).`
  );
  return '0.0.0.0';
}
