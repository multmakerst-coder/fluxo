import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifica a assinatura HMAC SHA256 enviada pela Meta nos webhooks
 * (header `X-Hub-Signature-256`, formato "sha256=<hex>").
 * Usado pelos webhooks do WhatsApp e do Instagram.
 */
export function verifyMetaSignature(
  payload: string,
  signatureHeader: string | null | undefined,
  secret: string | undefined,
): boolean {
  if (!signatureHeader || !secret) return false;

  const [algorithm, receivedHash] = signatureHeader.split("=");
  if (algorithm !== "sha256" || !receivedHash) return false;

  const expectedHash = createHmac("sha256", secret).update(payload, "utf8").digest("hex");

  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const receivedBuffer = Buffer.from(receivedHash, "hex");

  // comprimentos diferentes fariam o timingSafeEqual rebentar
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
