/**
 * Historien vår (tidslinjen på «Om oss»).
 * Redigeres på /loggin under «Historie», eller i content/historie/historie.json.
 * Tidslinjen sorteres automatisk etter dato.
 */
import data from "../../content/historie/historie.json";

export const history = Array.isArray(data?.milestones) ? data.milestones : [];
