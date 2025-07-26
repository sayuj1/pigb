import { delCache, delAllWithPrefix } from "@/lib/useCache";
import { cacheInvalidationRules } from "./cacheRules";

export const invalidateCache = async ({ model, action, data }) => {
    const ruleSet = cacheInvalidationRules[model]?.[action];
    if (!ruleSet) return;

    const invalidations = ruleSet(data);

    await Promise.all(
        invalidations.map(({ key, prefix }) => {
            if (key) {
                return delCache({ key, prefix });
            } else if (prefix) {
                return delAllWithPrefix(prefix);
            }
        })
    );
};
