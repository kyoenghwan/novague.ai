/**
 * encryption.ts
 * 
 * AES-256 암호화/복호화 유틸리티.
 * 중요: 이 모듈은 Node.js 환경(서버 사이드)에서만 실행되어야 합니다.
 * 클라이언트에서 직접 호출하면 [object Object] 에러가 발생할 수 있으므로,
 * safeEncryptConfig / safeDecryptConfig는 에러를 내부에서 처리합니다.
 */

const ALGORITHM = 'aes-256-cbc';
// 32바이트(256비트) 키 - 환경변수로 관리. 기본값은 개발용입니다.
const ENCRYPTION_KEY = (process.env.NEXT_SERVER_ENCRYPTION_KEY || 'default-secret-key-32-chars-long!!').slice(0, 32);
const IV_LENGTH = 16;

/**
 * 문자열을 AES-256-CBC로 암호화합니다 (서버 전용)
 */
export function encrypt(text: string): string {
    // 서버 환경에서만 crypto 모듈 임포트
    const crypto = require('crypto');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * AES-256-CBC 암호문을 복호화합니다 (서버 전용)
 */
export function decrypt(text: string): string {
    const crypto = require('crypto');
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

/**
 * 설정 객체를 안전하게 JSON → 암호화된 문자열로 변환합니다.
 * 브라우저 환경이거나 에러 발생 시 null을 반환합니다.
 */
export function safeEncryptConfig(config: any): string | null {
    if (!config) return null;
    // 브라우저 환경에서는 암호화 건너뜀 (서버 전용 로직)
    if (typeof window !== 'undefined') return JSON.stringify(config);
    try {
        return encrypt(JSON.stringify(config));
    } catch (e) {
        console.error('[Encryption] Failed:', e);
        return null;
    }
}

/**
 * 암호화된 문자열을 안전하게 복호화하여 객체로 반환합니다.
 * 에러 발생 시 null을 반환합니다.
 */
export function safeDecryptConfig(encrypted: string | null): any {
    if (!encrypted) return null;
    // 브라우저 환경에서는 복호화 건너뜀 (JSON 파싱만 시도)
    if (typeof window !== 'undefined') {
        try { return JSON.parse(encrypted); } catch { return null; }
    }
    try {
        return JSON.parse(decrypt(encrypted));
    } catch (e) {
        // 복호화 실패 시 JSON 파싱 시도 (암호화 전 데이터일 수도 있음)
        try { return JSON.parse(encrypted); } catch { return null; }
    }
}
