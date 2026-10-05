/**
 * The default entry point exposes only client-safe configuration. Server
 * configuration is imported explicitly from "@byb/config/server" so a careless
 * import cannot pull secrets into a client bundle (rule 13).
 */
export * from './app';
