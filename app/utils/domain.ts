import process from "process";
import { isProduction } from "@/utils/environment";
/**
 * Returns the API base URL based on the current environment.
 * In production it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to a hardcoded url).
 * In development, it returns "http://localhost:8080".
 */
export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://sopra-fs25-quoridor-group-24.oa.r.appspot.com/"; // TODO: update with your production URL as needed.
  const devUrl = "https://sopra-fs25-quoridor-group-24.oa.r.appspot.com/";
  return isProduction() ? prodUrl : devUrl;
}
