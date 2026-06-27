import { BgRemoverProvider, BgRemoverService } from "./bg-remover.types";
import { RemoveBgService } from "./remove-bg-service";

/**
 * Factory: returns the correct background-removal service based on env.
 *
 * To add a new provider:
 * 1. Implement BgRemoverService in a new file
 * 2. Add the case below
 * 3. Set BG_REMOVER_SERVICE env to your provider name
 */
export function getBgRemoverService(): BgRemoverService {
  const provider = (process.env.BG_REMOVER_SERVICE || "removebg") as BgRemoverProvider;
  const apiKey = process.env.BG_REMOVER_API_KEY || "";

  switch (provider) {
    case "removebg":
      return new RemoveBgService(apiKey);
    case "self-hosted": {
      // TODO: import & return your own implementation
      throw new Error("self-hosted bg remover not implemented yet");
    }
    default:
      throw new Error(`Unknown BG_REMOVER_SERVICE: ${provider}`);
  }
}

export type { BgRemoverProvider, BgRemoverService };
