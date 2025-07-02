export const scanFingerprint = async (): Promise<string | null> => {
  try {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      console.log('WebAuthn not supported');
      return null;
    }

    // Check if biometric authentication is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) {
      console.log('Biometric authentication not available');
      return null;
    }

    // Create credential for fingerprint
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: 'NeuroScan' },
        user: {
          id: new Uint8Array(16),
          name: 'user@neuroscan.app',
          displayName: 'NeuroScan User'
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000,
        attestation: 'direct'
      }
    }) as PublicKeyCredential;

    if (credential && credential.id) {
      return credential.id;
    }

    return null;
  } catch (error) {
    console.error('Fingerprint scan failed:', error);
    return null;
  }
};