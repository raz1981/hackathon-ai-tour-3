import { DefaultAzureCredential } from '@azure/identity';

const SCOPE = 'https://cognitiveservices.azure.com/.default';

// Uses an API key when provided, otherwise Entra ID (managed identity in Azure, az login locally).
export function createAuth({ apiKey, credential } = {}) {
  let cred = credential;
  return {
    async getHeaders() {
      if (apiKey) return { 'api-key': apiKey };
      try {
        cred ??= new DefaultAzureCredential();
        const { token } = await cred.getToken(SCOPE);
        return { authorization: `Bearer ${token}` };
      } catch {
        throw new Error('Failed to acquire Azure credentials');
      }
    },
  };
}
