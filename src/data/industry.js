/**
 * «Bedrift»: tekster, stillinger og intervjuer.
 * Redigeres på /loggin under «Bedrift», «Stillinger» og «Intervjuer».
 */
import industryData from "../../content/bedrift/bedrift.json";

export const industry = industryData || {};

const jobFiles = import.meta.glob("../../content/stillinger/*.json", { eager: true, import: "default" });
const interviewFiles = import.meta.glob("../../content/intervjuer/*.json", { eager: true, import: "default" });

const withSlug = (files) =>
  Object.entries(files).map(([path, data]) => ({ ...data, slug: path.split("/").pop().replace(/\.json$/, "") }));

export const jobs = withSlug(jobFiles);
export const interviews = withSlug(interviewFiles);
