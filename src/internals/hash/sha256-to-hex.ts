import { Crypto } from "@peculiar/webcrypto";

const crypto = new Crypto();

const toHex = (hashBuffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

/**
 * The sha256ToHex function takes a string or array of unknowns and returns the SHA-256 hash of that data as a hexadecimal string.
 *
 *
 * @param data: TData Specify the type of data that can be passed
 *
 * @return A hexadecimal string
 *
 */
export async function sha256ToHex<TData extends string | unknown[]>(
  data: TData
): Promise<string> {
  const massagedData = typeof data === "string" ? data : JSON.stringify(data);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(massagedData)
  );

  return toHex(hashBuffer);
}
