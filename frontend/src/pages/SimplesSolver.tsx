import React, { useState, useEffect } from "react";
import '../simplex.css'
type Relation = "<=" | ">=" | "=";

interface BackendResult {
  solution?: Record<string, number>;
  logs?: any[];
  columns?: string[];
  tables?: any[];
}

const SimplexSolver: React.FC = () => {
  const [numVars, setNumVars] = useState<number>(3);
  const [numConstraints, setNumConstraints] = useState<number>(3);
  const [method, setMethod] = useState<"two-phase" | "dual">("two-phase");
  const [type, setType] = useState<"max" | "min">("min");

  // Predefined example values
  const [objective, setObjective] = useState<number[]>([3, 5, 4]);
  const [constraints, setConstraints] = useState<number[][]>([
    [2, 3, 0, 8],
    [0, 2, 5, 10],
    [3, 0, 4, 15],
  ]);
  const [relations, setRelations] = useState<Relation[]>([">=", ">=", ">="]);

  const [visibleTables, setVisibleTables] = useState<number[]>([]);
  const tableRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const [result, setResult] = useState<BackendResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [animateIn, setAnimateIn] = useState<boolean>(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Add variable
  const addVariable = () => {
    setNumVars(prev => prev + 1);
    setObjective(prev => [...prev, 0]);
    setConstraints(prev => prev.map(row => [...row.slice(0, -1), 0, row[row.length - 1]]));
  };

  // Remove variable
  const removeVariable = () => {
    if (numVars > 1) {
      setNumVars(prev => prev - 1);
      setObjective(prev => prev.slice(0, -1));
      setConstraints(prev => prev.map(row => [...row.slice(0, -2), row[row.length - 1]]));
    }
  };

  // Add constraint
  const addConstraint = () => {
    setNumConstraints(prev => prev + 1);
    setConstraints(prev => [...prev, Array(numVars + 1).fill(0)]);
    setRelations(prev => [...prev, ">="]);
  };

  // Remove constraint
  const removeConstraint = () => {
    if (numConstraints > 1) {
      setNumConstraints(prev => prev - 1);
      setConstraints(prev => prev.slice(0, -1));
      setRelations(prev => prev.slice(0, -1));
    }
  };

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

  // Predefined examples
  const loadExample1 = () => {
    setNumVars(2);
    setNumConstraints(2);
    setObjective([2, 3]);
    setConstraints([
      [1, 1, 4],
      [2, 1, 5],
    ]);
    setRelations(["<=", "<="]);
  };

  const loadExample2 = () => {
    setNumVars(3);
    setNumConstraints(3);
    setObjective([3, 5, 4]);
    setConstraints([
      [2, 3, 0, 8],
      [0, 2, 5, 10],
      [3, 0, 4, 15],
    ]);
    setRelations([">=", ">=", ">="]);
  };

  const loadExample3 = () => {
    setNumVars(3);
    setNumConstraints(2);
    setObjective([4, 1, 2]);
    setConstraints([
      [1, 2, 1, 6],
      [3, 1, 2, 12],
    ]);
    setRelations(["=", "="]);
  };

  const handleSolve = async () => {
    setLoading(true);
    setResult(null);
    setVisibleTables([]);

    const problemDict = {
      method: method,
      type:type,
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
          }, index * 800);
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

      {/* Predefined Examples */}
      <div className="examples-section card">
        <h3 className="section-title">Quick Examples</h3>
        <div className="example-buttons">
          <button onClick={loadExample1} className="example-btn">
            Example 1 (≤ constraints)
          </button>
          <button onClick={loadExample2} className="example-btn">
            Example 2 (≥ constraints)
          </button>
          <button onClick={loadExample3} className="example-btn">
            Example 3 (= constraints)
          </button>
        </div>
      </div>

      {/* Method Selection */}
      <div className="method-section card">
        <h3 className="section-title">Solution Method</h3>
        <div className="method-buttons">
          <label className={`method-label ${method === "two-phase" ? 'active' : ''}`}>
            <input
              type="radio"
              name="method"
              checked={method === "two-phase"}
              onChange={() => setMethod("two-phase")}
              className="method-radio"
            />
            <span className="method-text">
              <span className="method-icon">🔄</span>
              Two-Phase Method
            </span>
            <span className="method-description">Best for ≥ constraints</span>
          </label>

          <label className={`method-label ${method === "dual" ? 'active' : ''}`}>
            <input
              type="radio"
              name="method"
              checked={method === "dual"}
              onChange={() => setMethod("dual")}
              className="method-radio"
            />
            <span className="method-text">
              <span className="method-icon">⚡</span>
              Dual Simplex
            </span>
            <span className="method-description">Best for ≤ constraints</span>
          </label>
        </div>
      </div>

      {/* Objective Function with Variable Controls */}
      <div className="objective-section card">
        <div className="section-header">
          <h3 className="section-title">Objective Function</h3>
          <div className="variable-controls">
            <button onClick={removeVariable} className="var-btn" disabled={numVars <= 1}>-</button>
            <span className="var-count">{numVars} variables</span>
            <button onClick={addVariable} className="var-btn">+</button>
          </div>
          
        </div>
        <div className="method-buttons">
            <label className={`method-label ${type === "max" ? 'active' : ''}`}>
              <input
                type="radio"
                name="type"
                checked={type === "max"}
                onChange={() => setType("max")}
                className="method-radio"
              />
              <span className="method-text">
                <span className="method-icon">🔄</span>
                Maximization
              </span>
            </label>

            <label className={`method-label ${type === "min" ? 'active' : ''}`}>
              <input
                type="radio"
                name="type"
                checked={type === "min"}
                onChange={() => setType("min")}
                className="method-radio"
              />
              <span className="method-text">
                <span className="method-icon">⚡</span>
                Minimization            </span>
            </label>
          </div>
        <div className="coefficients-grid">
          {objective.map((val, i) => (
            <div key={i} className="coefficient-item">
              <label>x{i + 1}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => handleObjectiveChange(i, e.target.value)}
                className="coeff-input"
                step="any"
              />
            </div>
          ))}
        </div>

      </div>

      {/* Constraints with Controls */}
      <div className="constraints-section card">
        <div className="section-header">
          <h3 className="section-title">Constraints</h3>
          <div className="variable-controls">
            <button onClick={removeConstraint} className="var-btn" disabled={numConstraints <= 1}>-</button>
            <span className="var-count">{numConstraints} constraints</span>
            <button onClick={addConstraint} className="var-btn">+</button>
          </div>
        </div>

        {constraints.map((row, i) => (
          <div key={i} className="constraint-row">
            {row.slice(0, numVars).map((val, j) => (
              <span key={j} className="constraint-term">
                <input
                  type="number"
                  value={val}
                  onChange={(e) => handleConstraintChange(i, j, e.target.value)}
                  className="constraint-input"
                  step="any"
                />
                <span className="variable-label">x{j + 1}</span>
                {j < numVars - 1 && <span className="plus-sign">+</span>}
              </span>
            ))}

            <select
              value={relations[i]}
              onChange={(e) => handleRelationChange(i, e.target.value as Relation)}
              className="relation-select"
            >
              <option value="<=">≤</option>
              <option value=">=">≥</option>
              <option value="=">=</option>
            </select>

            <input
              type="number"
              value={row[numVars]}
              onChange={(e) => handleConstraintChange(i, numVars, e.target.value)}
              className="rhs-input"
              placeholder="RHS"
              step="any"
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

      {/* RESULTS SECTION */}
      {result && (
        <div className="results-section">
          {/* SOLUTION */}
          <div className="solution-card">
            <h2 className="text-xl font-bold mb-4">Final Solution</h2>
            <pre className="solution-display">
              {JSON.stringify(result.solution, null, 2)}
            </pre>
          </div>

          {/* TABLEAU SECTION */}
          {result.tables && result.tables.length > 0 && (
            <div className="tableau-section">
              <h2 className="text-xl font-bold mb-6">Simplex Iterations</h2>

              {result.tables.map((table: any, index: number) => {
                const isVisible = visibleTables?.includes(index) ?? true;

                return (
                  <div
                    key={index}
                    ref={(el) => tableRefs.current && (tableRefs.current[index] = el)}
                    className={`tableau-container transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                      }`}
                  >
                    <h3 className="tableau-title">
                      Tableau {index + 1}
                      {index === 0 && " (Initial)"}
                      {index === result.tables.length - 1 && " (Final)"}
                    </h3>

                    <div className="table-wrapper">
                      <table className="simplex-table">
                        <thead>
                          <tr>
                            {table.columns.map((col: string, i: number) => (
                              <th key={i}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row: number[], rIndex: number) => (
                            <tr key={rIndex}>
                              {row.map((cell: number, cIndex: number) => (
                                <td key={cIndex}>{cell.toFixed(4)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {index < result.tables.length - 1 && (
                      <div className="separator">▼</div>
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