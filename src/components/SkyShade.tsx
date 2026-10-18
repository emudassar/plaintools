import type { Projector } from "./TileMap";
import type { Column } from "@/lib/terminator";

/**
 * Draws terminator columns over a TileMap (pass from the map's overlay prop). Each layer is one
 * crisp-edged path of abutting rectangles, so neighbouring columns leave no seams.
 */
export function skyShade(px: Projector, layers: { cols: Column[]; fill: string; opacity: number }[]) {
  return (
    <g pointerEvents="none">
      {layers.map((layer, li) => {
        let d = "";
        for (const c of layer.cols) {
          const mid = (c.lon0 + c.lon1) / 2;
          const [xa] = px({ lat: 0, lon: mid - 0.01 });
          const [xb] = px({ lat: 0, lon: mid + 0.01 });
          const w = ((xb - xa) / 0.02) * (c.lon1 - c.lon0);
          const [xm] = px({ lat: 0, lon: mid });
          const x0 = Math.floor(xm - w / 2), x1 = Math.ceil(xm + w / 2);
          for (const [s, n] of c.runs) {
            const [, yTop] = px({ lat: n, lon: mid });
            const [, yBot] = px({ lat: s, lon: mid });
            if (yBot > yTop) d += `M${x0} ${yTop.toFixed(1)}H${x1}V${yBot.toFixed(1)}H${x0}Z`;
          }
        }
        return <path key={li} d={d} fill={layer.fill} fillOpacity={layer.opacity} shapeRendering="crispEdges" />;
      })}
    </g>
  );
}
