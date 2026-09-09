/**
 * 安全なデータ引継ぎのための PBKDF2 + AES-GCM 暗号化/復号化モジュール
 * Web Crypto API (window.crypto.subtle) を使用
 */

// ヘッダー識別子
const HEADER_PREFIX = 'PUNI_SAVE_V1';

// Uint8Array を Base64 文字列に変換
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Base64 文字列を Uint8Array に変換
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * パスワードから暗号化キーを派生させる (PBKDF2)
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * データを指定したパスワードで暗号化し、エクスポート用文字列を生成する
 */
export async function encryptPlayerData(jsonData: object, password: string): Promise<string> {
  if (!password || password.trim().length < 4) {
    throw new Error('パスワードは4文字以上で設定してください。');
  }

  const jsonString = JSON.stringify(jsonData);
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(jsonString);

  // ソルト (16 bytes) & 初期化ベクトル IV (12 bytes) を生成
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // キー派生 & AES-GCM 暗号化
  const key = await deriveKey(password.trim(), salt);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    dataBytes.buffer as ArrayBuffer
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // パッケージ化: Salt + IV + EncryptedData を Base64 化
  const saltB64 = bytesToBase64(salt);
  const ivB64 = bytesToBase64(iv);
  const dataB64 = bytesToBase64(encryptedBytes);

  return `${HEADER_PREFIX}:${saltB64}:${ivB64}:${dataB64}`;
}

/**
 * 暗号化文字列とパスワードからゲームデータを復号する
 */
export async function decryptPlayerData(encryptedString: string, password: string): Promise<any> {
  if (!encryptedString || !encryptedString.trim()) {
    throw new Error('引継ぎコードが入力されていません。');
  }

  if (!password || !password.trim()) {
    throw new Error('パスワードが入力されていません。');
  }

  const parts = encryptedString.trim().split(':');
  if (parts.length !== 4 || parts[0] !== HEADER_PREFIX) {
    throw new Error('引継ぎコードの形式が無効です。正しくコピーされているか確認してください。');
  }

  const [, saltB64, ivB64, dataB64] = parts;

  let salt: Uint8Array;
  let iv: Uint8Array;
  let encryptedBytes: Uint8Array;

  try {
    salt = base64ToBytes(saltB64);
    iv = base64ToBytes(ivB64);
    encryptedBytes = base64ToBytes(dataB64);
  } catch {
    throw new Error('引継ぎコードの読み込みに失敗しました。コードが破損している可能性があります。');
  }

  try {
    const key = await deriveKey(password.trim(), salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      encryptedBytes.buffer as ArrayBuffer
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch {
    throw new Error('パスワードが間違っているか、コードが改ざんされています。本人以外は復号できません。');
  }
}
