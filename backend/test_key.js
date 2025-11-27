const crypto = require('crypto');

const publicKeyBase64 = '"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtD/3aar6UJyZ7shjmX5eFc9my6JZTZsuOkLNcMJxjqy1vQzr2Qk70qXw6OQ1DhF2I2JCBnsjz1Zhe4NJXF1BtCgsPFlmvvqgub7ogx8rfHi+HEXdblRbP8E7/J+xhHa41RgD/FYfeYdQrC6ZoOmotKcD9ns4wstaOEj/kFr0Zt04phE4AIjjfGf9HVU1A/TJf5ryhMx5/ekD4lQ/Z0p3lo/Ep/EBTxB9UIrrPgf/jTfdWKxlrEHYvdKhiQlL3zGe/Scuxh3szkRHaT2JHwP1F9/5OKLwWXVnC+LbZcaYewHOmJTbkQGhjO9A0mU4BbUbxmERk9jN6pcK9d8mx7sfPwIDAQAB"';

try {
    console.log("Attempting to create public key from base64 SPKI...");
    const publicKeyBuffer = Buffer.from(publicKeyBase64, 'base64');

    const key = crypto.createPublicKey({
        key: publicKeyBuffer,
        format: 'der',
        type: 'spki'
    });

    console.log("Success! Key type:", key.asymmetricKeyType);

    // Simulate verification
    const challenge = "r1eicpumNeb1A9lPnTniwG0jUrj59Qi7YQ7qBY+NAag=";
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(challenge);

    // Test with invalid base64 signature
    const dummySignature = "This is not base64!!!";

    console.log("Attempting verify with invalid signature...");
    const isVerified = verifier.verify(key, dummySignature, 'base64');
    console.log("Verification result:", isVerified);

} catch (err) {
    console.error("Error:", err);
}
