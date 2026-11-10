import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Server-side Payload client.
 *
 * `getPayload` caches the instance per config object, so it is safe to await
 * on every request/rsc render. Keep this as the only entry point for queries.
 */
export const getPayloadClient = () => getPayload({ config });

/** @deprecated Use `getPayloadClient()` — kept for the initial scaffolding. */
export const getPayloadAsync = getPayloadClient;
