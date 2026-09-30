import { encode } from "uqr";

/** QR code drawn as SVG paths (one per dark module), readable in light and dark themes */
export function QrCode({ value, label }: { value: string; label: string }) {
  const { data, size } = encode(value, { border: 2 });
  const modules = data.flatMap((row, y) =>
    row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : [])),
  );
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      className="size-44 rounded-md bg-white p-1"
      shapeRendering="crispEdges"
    >
      <path d={modules.join("")} fill="#000" />
    </svg>
  );
}
