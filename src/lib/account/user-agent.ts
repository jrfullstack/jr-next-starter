/** Checked in order: Edge and Opera also say "Chrome", and Chrome also says "Safari" */
const browsers = [
  ["Edge", /Edg\//],
  ["Opera", /OPR\//],
  ["Firefox", /Firefox\//],
  ["Chrome", /Chrome\//],
  ["Safari", /Safari\//],
] as const;

/** iOS and Android before macOS and Linux: their user agents mention both */
const systems = [
  ["iOS", /iPhone|iPad/],
  ["Android", /Android/],
  ["Windows", /Windows/],
  ["macOS", /Mac OS X/],
  ["Linux", /Linux/],
] as const;

function firstMatch(list: readonly (readonly [string, RegExp])[], ua: string) {
  return list.find(([, pattern]) => pattern.test(ua))?.[0];
}

/** "Chrome · Windows" from a session's user agent; undefined parts are left out */
export function describeUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) return undefined;
  const parts = [
    firstMatch(browsers, userAgent),
    firstMatch(systems, userAgent),
  ];
  const known = parts.filter(Boolean);
  return known.length > 0 ? known.join(" · ") : undefined;
}
