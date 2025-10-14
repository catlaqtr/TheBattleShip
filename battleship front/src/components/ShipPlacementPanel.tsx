import type { ShipView } from "../types";
import { motion, useReducedMotion } from "framer-motion";

const SHIPS: { type: ShipView["type"]; length: number }[] = [
  { type: "CARRIER", length: 5 },
  { type: "BATTLESHIP", length: 4 },
  { type: "CRUISER", length: 3 },
  { type: "SUBMARINE", length: 3 },
  { type: "DESTROYER", length: 2 },
];

export function ShipPlacementPanel({
  existing,
  selectedType,
  setSelectedType,
  orientation,
  setOrientation,
}: {
  existing: ShipView[];
  selectedType: ShipView["type"] | null;
  setSelectedType: (t: ShipView["type"] | null) => void;
  orientation: "HORIZONTAL" | "VERTICAL";
  setOrientation: (o: "HORIZONTAL" | "VERTICAL") => void;
}) {
  const prefersReduced = useReducedMotion();
  const placed = new Set(existing.map((s) => s.type));
  return (
    <div className="space-y-3">
      <div className="font-medium">Place your ships</div>
      <div className="flex flex-wrap gap-2">
        {SHIPS.map((s) => {
          const isPlaced = placed.has(s.type);
          const isSelected = selectedType === s.type;
          return (
            <motion.button
              key={s.type}
              disabled={isPlaced}
              onClick={() => setSelectedType(isSelected ? null : s.type)}
              className={[
                "px-3 py-1 rounded border",
                isPlaced
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-slate-50",
                isSelected ? "bg-blue-600 text-white border-blue-600" : "",
              ].join(" ")}
              title={`${s.type} (${s.length})`}
              whileHover={
                prefersReduced ? undefined : { scale: isPlaced ? 1 : 1.03 }
              }
              whileTap={
                prefersReduced ? undefined : { scale: isPlaced ? 1 : 0.97 }
              }
              animate={
                prefersReduced
                  ? undefined
                  : {
                      scale: isSelected ? 1.02 : 1,
                      boxShadow: isSelected
                        ? "0 6px 16px rgba(37, 99, 235, 0.35)"
                        : "0 0px 0px rgba(0,0,0,0)",
                    }
              }
              transition={
                prefersReduced
                  ? undefined
                  : { type: "spring", stiffness: 300, damping: 20 }
              }
            >
              {s.type} ({s.length})
            </motion.button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Orientation:</span>
        <button
          className={`px-2 py-1 rounded border ${
            orientation === "HORIZONTAL" ? "bg-slate-800 text-white" : ""
          }`}
          onClick={() => setOrientation("HORIZONTAL")}
        >
          H
        </button>
        <button
          className={`px-2 py-1 rounded border ${
            orientation === "VERTICAL" ? "bg-slate-800 text-white" : ""
          }`}
          onClick={() => setOrientation("VERTICAL")}
        >
          V
        </button>
      </div>
      <div className="text-xs text-slate-500">
        Select a ship and then click a cell on your board to place it.
      </div>
    </div>
  );
}
