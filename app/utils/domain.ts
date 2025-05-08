import process from "process";
import { isProduction } from "@/utils/environment";
/**
 * Returns the API base URL based on the current environment.
 * In production it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to a hardcoded url).
 * In development, it returns "http://localhost:8080".
 */
export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://sopra-fs25-saksch-new-server.oa.r.appspot.com/"; // TODO: update with your production URL as needed.
  const devUrl = "http://localhost:8080";
  return isProduction() ? prodUrl : devUrl;
}

export const getWebsocketDomain = () => {
  const prodUrl = "wss://backendv2-dot-sopra-fs25-saksch-new-server.oa.r.appspot.com"; // TODO: insert your prod url for server (once deployed)
  const devUrl = "ws://localhost:8080";

  return isProduction() ? prodUrl : devUrl;
};
