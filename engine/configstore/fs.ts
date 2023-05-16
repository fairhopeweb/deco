import { join } from "std/path/mod.ts";
import { exists } from "../../utils/filesystem.ts";
import { singleFlight } from "../core/utils.ts";
import { ConfigStore } from "./provider.ts";

const sample = {
  "audience-everyone": {
    overrides: [],
    routes: [{
      pathTemplate: "/*",
      handler: {
        url: "https://www.google.com",
        __resolveType: "$live/handlers/proxy.ts",
      },
    }],
    __resolveType: "$live/flags/everyone.ts",
  },
  "./routes/[...catchall].tsx": {
    handler: {
      audiences: [
        {
          __resolveType: "audience-everyone",
        },
      ],
      __resolveType: "$live/handlers/routesSelection.ts",
    },
    __resolveType: "resolve",
  },
};
export const newFsProvider = (
  path = ".configs.json",
): ConfigStore => {
  // deno-lint-ignore no-explicit-any
  const sf = singleFlight<Record<string, any>>();
  const fullPath = join(Deno.cwd(), path);

  const load = async () => {
    if (!(await exists(fullPath))) {
      await Deno.writeTextFile(fullPath, JSON.stringify(sample, null, 2));
      return sample;
    }
    return JSON.parse(await Deno.readTextFile(fullPath));
  };
  return {
    state: () => sf.do("load", load),
    archived: () => sf.do("load", load),
  };
};
