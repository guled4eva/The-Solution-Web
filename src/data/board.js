/**
 * Styret.
 * Redigeres på /loggin under «Styret», eller i content/styret/styret.json.
 * Rekkefølgen i lista er rekkefølgen på nettsiden.
 */
import data from "../../content/styret/styret.json";

export const board = Array.isArray(data?.members) ? data.members : [];
