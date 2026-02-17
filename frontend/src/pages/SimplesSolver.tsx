import React, { useState, useEffect } from "react";
import LPStructurePreview from "./LpStructurePreview";

type Relation = "<=" | ">=" | "=";

interface BackendResult {
  solution?: Record<string, number>;
  logs?: any[];
  columns?: string[];
}

const SimplexSolver: React.FC = () => {
  const [numVars] = useState<number>(2);
  const [numConstraints] = useState<number>(2);

  // ✅ Prefilled example
  const [objective, setObjective] = useState<number[]>([2, 3]);
  const [constraints, setConstraints] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [relations, setRelations] = useState<Relation[]>(["<=", "<="]);
  const [visibleTables, setVisibleTables] = useState<number[]>([]);
  const tableRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  
  const [result, setResult] = useState<BackendResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [animateIn, setAnimateIn] = useState<boolean>(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // ✅ Fix leading zero issue
  const handleObjectiveChange = (index: number, value: string) => {
    const updated = [...objective];
    updated[index] = value === "" ? 0 : parseFloat(value);
    setObjective(updated);
  };

  const handleConstraintChange = (
    row: number,
    col: number,
    value: string
  ) => {
    const updated = [...constraints];
    updated[row][col] = value === "" ? 0 : parseFloat(value);
    setConstraints(updated);
  };

  const handleRelationChange = (index: number, value: Relation) => {
    const updated = [...relations];
    updated[index] = value;
    setRelations(updated);
  };
  const [method, setMethod] = useState<"two-phase" | "dual" | null>(null);

  const handleSolve = async () => {
    setLoading(true);
    setResult(null);

    // Build backend structure exactly
    const problemDict = {
      type: "min",
      objective: {
        coefficients: {} as Record<string, number>,
      },
      constraints: [] as any[],
    };

    objective.forEach((val, index) => {
      problemDict.objective.coefficients[`x${index + 1}`] = val;
    });

    for (let i = 0; i < numConstraints; i++) {
      const lhs: Record<string, number> = {};

      for (let j = 0; j < numVars; j++) {
        lhs[`x${j + 1}`] = constraints[i][j];
      }

      problemDict.constraints.push({
        lhs: lhs,
        rhs: constraints[i][numVars],
        relation: relations[i],
      });
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/solve/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(problemDict),
      });

      const data = await response.json();
      setResult(data);
      setVisibleTables([]);

      if (data.tables) {
        data.tables.forEach((_: any, index: number) => {
          setTimeout(() => {
            setVisibleTables((prev) => [...prev, index]);
      
            setTimeout(() => {
              tableRefs.current[index]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 100);
          }, index * 800); // delay between tables
        });
      }
      
    } catch (error) {
      
      setResult({
        solution: { error: 0 },
      });
    }

    setLoading(false);
  };

  return (
    <div className={`simplex-container ${animateIn ? 'fade-in' : ''}`}>
      <div className="header-section">
        <h1 className="title">
          <span className="title-gradient">Linear Programming Solver</span>
        </h1>
        <p className="description">
          Solve optimization problems using the Simplex method. Choose between 
          Two-Phase and Dual Simplex algorithms for linear programming.
        </p>
      </div>
 {/* Method Selection */}
 <div className="method-section card">
        <h3 className="section-title">Solution Method</h3>
        <div className="method-buttons">
          <label className={`method-label ${method === "two-phase" ? 'active' : ''}`}>
            <input
              type="radio"
              checked={method === "two-phase"}
              onChange={() => setMethod("two-phase")}
              className="method-radio"
            />
            <span className="method-text">
              <span className="method-icon">🔄</span>
              Two-Phase Method
            </span>
            <span className="method-description">For problems with ≥ constraints</span>
          </label>

          <label className={`method-label ${method === "dual" ? 'active' : ''}`}>
            <input
              type="radio"
              checked={method === "dual"}
              onChange={() => setMethod("dual")}
              className="method-radio"
            />
            <span className="method-text">
              <span className="method-icon">⚡</span>
              Dual Simplex
            </span>
            <span className="method-description">For problems with ≤ constraints</span>
          </label>
        </div>
      </div>

      {/* Objective */}
      <div className="objective-section card">
        <h3 className="section-title">Objective Function</h3>
        <div className="coefficients-grid">
          {objective.map((val, i) => (
            <div key={i} className="coefficient-item">
              <label>x{i + 1}</label>
              <input
                type="text"
                value={val}
                onChange={(e) =>
                  handleObjectiveChange(i, e.target.value)
                }
                className="coeff-input"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="constraints-section card">
        <h3 className="section-title">Constraints</h3>

        {constraints.map((row, i) => (
          <div key={i} className="constraint-row">
            {row.slice(0, numVars).map((val, j) => (
              <span key={j}>
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    handleConstraintChange(i, j, e.target.value)
                  }
                  className="constraint-input"
                />
                x{j + 1}
              </span>
            ))}

            <select
              value={relations[i]}
              onChange={(e) =>
                handleRelationChange(i, e.target.value as Relation)
              }
            >
              <option value="<=">≤</option>
              <option value=">=">≥</option>
              <option value="=">=</option>
            </select>

            <input
              type="text"
              value={row[numVars]}
              onChange={(e) =>
                handleConstraintChange(i, numVars, e.target.value)
              }
              className="rhs-input"
            />
          </div>
        ))}
      </div>

      <div className="action-section">
        <button
          onClick={handleSolve}
          className="solve-btn"
          disabled={loading}
        >
          {loading ? "Solving..." : "Solve Problem"}
        </button>
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div className="mt-6">

          {/* SOLUTION */}
          <h2 className="text-xl font-bold mb-2">Final Solution</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(result.solution, null, 2)}
          </pre>
          

          {/* TABLES */}
          <h2 className="text-xl font-bold mt-6 mb-2">Tableaus</h2>
{/* TABLEAU SECTION - Centered with scroll animation */}
{result?.tables && result.tables.length > 0 && (
  <div className="mt-12 space-y-16">
    {result.tables.map((table: any, index: number) => {
      const isVisible = visibleTables?.includes(index) ?? true;
      
      return (
        <div
          key={index}
          ref={(el) => tableRefs.current && (tableRefs.current[index] = el)}
          className={`flex flex-col items-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          {/* Table heading - centered */}
          <h3 className="text-lg font-semibold text-black mb-4 text-center">
            Tableau {index + 1}
            {index === 0 && " (Initial)"}
            {index === result.tables.length - 1 && " (Final)"}
          </h3>

          {/* Centered table */}
          <div className="flex justify-center w-full overflow-x-auto">
            <table style={{ 
              borderCollapse: 'collapse', 
              backgroundColor: 'white',
              border: '1px solid black',
              margin: '0 auto'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  {table.columns.map((col: string, i: number) => (
                    <th 
                      key={i} 
                      style={{ 
                        border: '1px solid black',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: 'black',
                        textAlign: 'center'
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row: number[], rIndex: number) => (
                  <tr key={rIndex}>
                    {row.map((cell: number, cIndex: number) => (
                      <td 
                        key={cIndex} 
                        style={{ 
                          border: '1px solid black',
                          padding: '12px 24px',
                          fontSize: '14px',
                          color: 'black',
                          fontFamily: 'monospace',
                          textAlign: 'center'
                        }}
                      >
                        {cell.toFixed(4)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Separator between tables */}
          {index < result.tables.length - 1 && (
            <div className="mt-8 text-black text-center font-bold animate-bounce">▼</div>
          )}
        </div>
      );
    })}
  </div>
)}

        </div>
      )}
    </div>
  );
};

export default SimplexSolver;
