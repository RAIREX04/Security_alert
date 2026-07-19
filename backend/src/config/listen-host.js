const os = require('node:os');

const FALLBACK_HOST = '127.0.0.1';
const WILDCARD_HOSTS = new Set(['0.0.0.0', '::']);
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function getLocalAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(Boolean)
    .map((address) => address.address);
}

function isBindableHost(host) {
  if (!host || LOCAL_HOSTS.has(host) || WILDCARD_HOSTS.has(host)) {
    return true;
  }

  return getLocalAddresses().includes(host);
}

function resolveListenHost(configuredHost) {
  const host = configuredHost || FALLBACK_HOST;

  if (isBindableHost(host)) {
    return { host, configuredHost: host, didFallback: false };
  }

  return { host: FALLBACK_HOST, configuredHost: host, didFallback: true };
}

module.exports = {
  FALLBACK_HOST,
  getLocalAddresses,
  isBindableHost,
  resolveListenHost,
};
