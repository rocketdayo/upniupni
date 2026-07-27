export interface SerialCodePayload {
  yPoints?: number;
  money?: number;
  items?: {
    expSmall?: number;
    expLarge?: number;
    skillBook?: number;
  };
  title?: string;
  nonce?: string;
  createdAt?: number;
}

// 簡易暗号化用の秘密鍵・ソルト
const SECRET_SALT = 'PUNI_PUNI_SERIAL_SECRET_2026';

// 独自文字エンコード / XOR による難読化関数
function xorEncryptDecrypt(input: string, key: string): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    output += String.fromCharCode(charCode);
  }
  return output;
}

// UTF-8 文字列を Base64URL (URL Safe) に変換
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Base64URL を UTF-8 文字列に復元
function base64ToUtf8(base64url: string): string {
  let b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * 給付データオブジェクトから暗号化シリアルコードを生成する
 */
export function generateSerialCode(payload: Omit<SerialCodePayload, 'nonce' | 'createdAt'>): string {
  const fullPayload: SerialCodePayload = {
    ...payload,
    nonce: Math.random().toString(36).substring(2, 9).toUpperCase(),
    createdAt: Date.now(),
  };

  const json = JSON.stringify(fullPayload);
  const encrypted = xorEncryptDecrypt(json, SECRET_SALT);
  const encoded = utf8ToBase64(encrypted);

  return `PUNI-${encoded}`;
}

/**
 * 暗号化シリアルコードを検証・復号化する
 */
export function decodeSerialCode(code: string): { success: boolean; payload?: SerialCodePayload; error?: string } {
  if (!code || typeof code !== 'string') {
    return { success: false, error: 'シリアルコードを入力してください' };
  }

  const cleanCode = code.trim();
  if (!cleanCode.startsWith('PUNI-')) {
    return { success: false, error: '無効な形式のシリアルコードです (PUNI-から始まる必要があります)' };
  }

  const rawBase64 = cleanCode.substring(5);
  if (!rawBase64) {
    return { success: false, error: 'シリアルコードが破損しています' };
  }

  try {
    const encrypted = base64ToUtf8(rawBase64);
    const json = xorEncryptDecrypt(encrypted, SECRET_SALT);
    const payload = JSON.parse(json) as SerialCodePayload;

    if (!payload || (payload.yPoints === undefined && payload.money === undefined && !payload.items)) {
      return { success: false, error: 'シリアルコードの内容が不正です' };
    }

    return { success: true, payload };
  } catch {
    return { success: false, error: 'シリアルコードの解読に失敗しました。無効なコードです' };
  }
}
