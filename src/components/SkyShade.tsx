import type { Projector } from "./TileMap";
import type { Column } from "@/lib/terminator";

/** Draws terminator columns as rectangles over a TileMap (pass from the map's overlay prop). */
export function skyShade(px: Projector, layers: { cols: Column[]; fill: string; opacity: number }[]) {
  return (
    <g pointerEvents="none">
      {layers.map((layer, li) => (
        <g key={li} fill={layer.fill} fillOpacity={layer.opacity}>
          {layer.cols.flatMap((c) => {
            const mid = (c.lon0 + c.lon1) / 2;
            const [xa] = px({ lat: 0, lon: mid - 0.01 });
            const [xb] = px({ lat: 0, lon: mid + 0.01 });
            const w = ((xb - xa) / 0.02) * (c.lon1 - c.lon0);
            const [xm] = px({ lat: 0, lon: mid });
            return c.runs.map(([s, n], i) => {
              const [, yTop] = px({ lat: n, lon: mid });
              const [, yBot] = px({ lat: s, lon: mid });
              return <rect key={`${c.lon0}-${i}`} x={xm - w / 2 - 0.3} y={yTop} width={w + 0.6} height={Math.max(0, yBot - yTop)} />;
            });
          })}
        </g>
      ))}
    </g>
  );
}
