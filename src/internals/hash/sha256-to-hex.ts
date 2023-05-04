import sha256 from "crypto-js/sha256";

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
  const dataToBeHashed = typeof data === "string" ? data : JSON.stringify(data);

  return sha256(dataToBeHashed).toString();
}
