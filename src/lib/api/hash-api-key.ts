import { createHash } from "crypto";

/**
 * Gera o hash SHA256 (hex) de uma API key em texto simples.
 * As chaves nunca são guardadas em texto simples — apenas o hash
 * é comparado com a coluna `key_hash` da tabela `api_keys`.
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
