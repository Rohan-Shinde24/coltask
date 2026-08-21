// Utility functions for Client-Side End-to-End Encryption (E2EE) using AES-GCM

// Generate a symmetric key from a string (e.g., workspace ID + master secret)
export async function getEncryptionKey(workspaceId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  // In a real application, the 'secretSalt' should be securely exchanged between members 
  // (e.g. via Public Key Infrastructure or an out-of-band shared password).
  // For this prototype, we use the workspaceId as the shared secret so it's isolated per workspace.
  const secretKey = workspaceId + "-coltask-secure-secret-2026";
  
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(workspaceId),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function getDirectEncryptionKey(workspaceId: string, userId1: string, userId2: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  // Sort user IDs to ensure deterministic key derivation regardless of who is sender/recipient
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  const secretKey = workspaceId + "-direct-" + sortedIds.join("-") + "-secure-secret-2026";
  
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(workspaceId + "-direct"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to ArrayBuffer
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

export async function encryptMessage(text: string, workspaceId: string, recipientId?: string, senderId?: string): Promise<{ ciphertext: string, iv: string }> {
  let key;
  if (recipientId && senderId) {
    key = await getDirectEncryptionKey(workspaceId, senderId, recipientId);
  } else {
    key = await getEncryptionKey(workspaceId);
  }

  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    enc.encode(text)
  );

  return {
    ciphertext: bufferToHex(encryptedBuffer),
    iv: bufferToHex(iv.buffer)
  };
}

export async function decryptMessage(ciphertextHex: string, ivHex: string, workspaceId: string, recipientId?: string, senderId?: string): Promise<string> {
  try {
    let key;
    if (recipientId && senderId) {
      key = await getDirectEncryptionKey(workspaceId, senderId, recipientId);
    } else {
      key = await getEncryptionKey(workspaceId);
    }

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: hexToBuffer(ivHex)
      },
      key,
      hexToBuffer(ciphertextHex)
    );
    
    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    // Return fallback text silently to avoid triggering Next.js error overlays for legacy/corrupted messages
    return "🔒 [Encrypted Message - Decryption Failed]";
  }
}
