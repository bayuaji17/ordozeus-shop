import crypto from "crypto";

const VA_IPAYMU = process.env.VA_IPAYMU || "";
const API_KEY_IPAYMU = process.env.API_KEY_IPAYMU || "";
const BASE_URL_IPAYMU = process.env.BASE_URL_IPAYMU!;

export interface IpaymuPaymentParams {
  product: string[]; // required
  qty: string[]; // required
  price: string[]; // required
  amount: string; // required
  returnUrl: string; // required
  cancelUrl: string; // required
  notifyUrl: string; // required
  referenceId: string; // required
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

export interface IpaymuPaymentResponse {
  Status: number;
  Success: boolean;
  Message: string;
  Data: {
    SessionID: string;
    Url: string;
  };
}

/**
 * Generate iPaymu timestamp in YYYYMMDDhhmmss format.
 */
function getIpaymuTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

/**
 * Creates a payment session in iPaymu.
 *
 * @param params Details of the checkout.
 * @returns The session URL for browser redirection.
 */
export async function createPaymentSession(
  params: IpaymuPaymentParams
): Promise<IpaymuPaymentResponse> {
  const bodyString = JSON.stringify(params);
  const timestamp = getIpaymuTimestamp();

  // 1. Generate Signature
  // Formula per iPaymu API v2 docs:
  //   StringToSign = POST:VA:SHA256(body):Timestamp
  //   Signature    = HMAC-SHA256(StringToSign, ApiKey)
  const hexBody = crypto.createHash("sha256").update(bodyString).digest("hex");
  const stringToSign = `POST:${VA_IPAYMU}:${hexBody}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", API_KEY_IPAYMU)
    .update(stringToSign)
    .digest("hex");

  // 2. Execute Request
  const response = await fetch(`${BASE_URL_IPAYMU}api/v2/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      signature: signature,
      va: VA_IPAYMU,
      timestamp: timestamp,
    },
    body: bodyString,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("iPaymu Error Response:", text);
    throw new Error(`iPaymu API Error: ${response.statusText} - ${text}`);
  }

  const json = (await response.json()) as IpaymuPaymentResponse;

  if (json.Status !== 200 || !json.Success) {
      throw new Error(`iPaymu Application Error: ${json.Message}`);
  }

  return json;
}

/**
 * Verifies the iPaymu incoming webhook callback signature.
 * iPaymu v2 sends the signature in the `X-Signature` header.
 *
 * Steps per iPaymu docs:
 * 1. Remove `signature` from body (if present).
 * 2. Sort the remaining keys lexicographically.
 * 3. Stringify to JSON.
 * 4. HMAC-SHA256 against the Merchant VA as the secret.
 * 5. Compare signatures.
 *
 * @param reqBody The parsed body of the incoming request
 * @param signature The signature to verify against (from X-Signature header or body)
 */
export function verifyCallbackSignature(
  reqBody: Record<string, unknown>,
  signature: string | null
): boolean {
  if (!reqBody || typeof reqBody !== "object") return false;
  if (!signature) return false;

  const data = { ...reqBody };

  // Remove signature from body if it exists there too
  delete data.signature;

  // Sort keys alphabetically
  const sortedKeys = Object.keys(data).sort();
  const sortedData: Record<string, unknown> = {};

  sortedKeys.forEach((key) => {
    sortedData[key] = data[key];
  });

  const jsonBody = JSON.stringify(sortedData);

  // Note: The callback signature secret key is the VA!
  const calculatedSignature = crypto
    .createHmac("sha256", VA_IPAYMU)
    .update(jsonBody)
    .digest("hex");

  return calculatedSignature === signature;
}
