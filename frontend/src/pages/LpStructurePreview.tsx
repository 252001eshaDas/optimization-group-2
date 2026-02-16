import { useEffect, useState } from "react";

interface Props {
  objective: number[];
  constraints: number[][];
  rhs: number[];
}

export default function LPStructurePreview({
  objective,
  constraints,
  rhs,
}: Props) {
  const [showObjective, setShowObjective] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    setShowObjective(false);
    setVisibleRows(0);

    const t1 = setTimeout(() => setShowObjective(true), 200);

    let row = 0;
    const interval = setInterval(() => {
      row++;
      setVisibleRows(row);
      if (row >= constraints.length) clearInterval(interval);
    }, 250);

    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [objective, constraints, rhs]);

  return (
    <div className="bg-slate-50 border rounded-lg p-4 mt-6 animate-fade-in">
      <h4 className="font-semibold text-slate-700 mb-3">
        Problem Structure
      </h4>

      {/* Objective */}
      {showObjective && (
        <div className="mb-4 text-blue-700">
          <span className="font-semibold">Maximize Z = </span>
          {objective.map((c, i) => (
            <span key={i}>
              {c}x{i + 1}
              {i < objective.length - 1 && " + "}
            </span>
          ))}
        </div>
      )}

      {/* Constraints */}
      <div className="space-y-2">
        {constraints.slice(0, visibleRows).map((row, i) => (
          <div
            key={i}
            className="text-slate-700 transition-all duration-300"
          >
            {row.map((a, j) => (
              <span key={j}>
                {a}x{j + 1}
                {j < row.length - 1 && " + "}
              </span>
            ))}
            <span className="font-semibold mx-2">≤</span>
            <span className="text-rose-600 font-medium">
              {rhs[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
