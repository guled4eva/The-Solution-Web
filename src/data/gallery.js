/**
 * Bildegalleriet på forsiden. Redigeres på /loggin under «Galleri».
 */
import data from "../../content/galleri/galleri.json";

export const gallery = {
  show: data?.show !== false,
  title: data?.title || "Fra arrangementene våre",
  images: Array.isArray(data?.images) ? data.images.filter((i) => i && i.image) : [],
};
