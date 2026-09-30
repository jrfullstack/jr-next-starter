type SearchParams = Record<string, string | string[] | undefined>;

/**
 * True when the URL params are exactly the canonical ones (no empty fields,
 * no defaults, no unknown values). Lists redirect to the canonical URL otherwise.
 */
export function hasCanonicalParams(
  params: SearchParams,
  canonical: Record<string, string>,
) {
  const present = Object.entries(params).filter(
    ([, value]) => value !== undefined,
  );
  return (
    present.length === Object.keys(canonical).length &&
    present.every(([key, value]) => canonical[key] === value)
  );
}

/** ?page= as a whole number from 1; anything else is page 1 */
export function parsePage(value: unknown) {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : 1;
}
