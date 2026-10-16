import { createFoundryProvider } from './foundry.js';
import { pricing } from '../config/pricing.js';

// One provider per configured Foundry deployment; add a model by deploying it and listing it in FOUNDRY_MODELS.
export function createProviders({ config, auth, fetchImpl }) {
  return config.models.map((model) =>
    createFoundryProvider({
      endpoint: config.foundryEndpoint,
      model,
      name: pricing[model]?.name ?? model,
      auth,
      fetchImpl,
    }),
  );
}
