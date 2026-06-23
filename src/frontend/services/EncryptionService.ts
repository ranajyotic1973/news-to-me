import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

export class EncryptionService {
  private static readonly KEY_STORAGE = 'news-to-me-enc-key';
  private static readonly NONCE_SIZE = 24;
  private static key: Uint8Array | null = null;
  private static readonly encoder = new TextEncoder();
  private static readonly decoder = new TextDecoder();

  static initialize(): void {
    const stored = localStorage.getItem(EncryptionService.KEY_STORAGE);
    if (stored) {
      EncryptionService.key = naclUtil.decodeBase64(stored);
    } else {
      const newKey = nacl.randomBytes(nacl.secretbox.keyLength);
      localStorage.setItem(
        EncryptionService.KEY_STORAGE,
        naclUtil.encodeBase64(newKey)
      );
      EncryptionService.key = newKey;
    }
  }

  static encrypt(plaintext: string): string {
    if (!EncryptionService.key) {
      throw new Error('Encryption service not initialized');
    }

    const nonce = nacl.randomBytes(EncryptionService.NONCE_SIZE);
    const message = EncryptionService.encoder.encode(plaintext);
    const ciphertext = nacl.secretbox(message, nonce, EncryptionService.key);

    if (!ciphertext) {
      throw new Error('Encryption failed');
    }

    const combined = new Uint8Array(nonce.length + ciphertext.length);
    combined.set(nonce);
    combined.set(ciphertext, nonce.length);

    return naclUtil.encodeBase64(combined);
  }

  static decrypt(encrypted: string): string {
    if (!EncryptionService.key) {
      throw new Error('Encryption service not initialized');
    }

    const combined = naclUtil.decodeBase64(encrypted);
    const nonce = combined.slice(0, EncryptionService.NONCE_SIZE);
    const ciphertext = combined.slice(EncryptionService.NONCE_SIZE);

    const plaintext = nacl.secretbox.open(ciphertext, nonce, EncryptionService.key);

    if (!plaintext) {
      throw new Error('Decryption failed');
    }

    return EncryptionService.decoder.decode(plaintext);
  }
}
