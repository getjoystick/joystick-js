import { Crypto } from "@peculiar/webcrypto";

const crypto = new Crypto();

const toHex = (hashBuffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export async function sha256ToHex<T extends string | unknown[]>(
  data: T
): Promise<string> {
  const massagedData = typeof data === "string" ? data : JSON.stringify(data);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(massagedData)
  );

  return toHex(hashBuffer);
}
