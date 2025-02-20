const originalFetch = globalThis.fetch;

// notre sauveur de IPFS merci à lui
globalThis.fetch = async (url, options = {}) => {
  // Force the 'duplex' if there's a body
  if (options.body) {
    options.duplex = options.duplex || 'half';
  }
  return originalFetch(url, options);
};
