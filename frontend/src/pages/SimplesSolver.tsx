import React, { useState, useEffect } from "react";
import LPStructurePreview from "./LpStructurePreview";

type MethodType = "two-phase" | "dual";
type Relation = "<=" | ">=" | "=";

interface SimplexResult {
  status: string;
  optimalValue?: number;
  iterations?: number;
  variables?: Record<string, number>;
  method?: string;
}

const SimplexSolver: React.FC = () => {
  const [method, setMethod] = useState<MethodType>("two-phase");
  const [numVars, setNumVars] = useState<number>(2);
  const [numConstraints, setNumConstraints] = useState<number>(2);
  const [objective, setObjective] = useState<number[]>([0, 0]);
  const [constraints, setConstraints] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [relations, setRelations] = useState<Relation[]>(["<=", "<="]);
  const [result, setResult] = useState<SimplexResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [animateIn, setAnimateIn] = useState<boolean>(false);

  // Animation 
  useEffect(() => {
    setAnimateIn(true);
  }, []);


  const handleObjectiveChange = (index: number, value: string) => {
    const updated = [...objective];
    updated[index] = Number(value);
    setObjective(updated);
  };

  const handleConstraintChange = (
    row: number,
    col: number,
    value: string
  ) => {
    const updated = [...constraints];
    updated[row][col] = Number(value);
    setConstraints(updated);
  };

  const handleRelationChange = (index: number, value: Relation) => {
    const updated = [...relations];
    updated[index] = value;
    setRelations(updated);
  };


  const generateStructure = () => {
    setObjective(Array(numVars).fill(0));
    setConstraints(
      Array(numConstraints)
        .fill(0)
        .map(() => Array(numVars + 1).fill(0))
    );
    setRelations(Array(numConstraints).fill("<="));
    setResult(null);
  };


  const handleSolve = async () => {
  setLoading(true);
  setResult(null);

  // Prepare the payload for two-phase method
  const payload = {
    method: method === "two-phase" ? "two-phase" : "dual",
    objective: objective,        // Coefficients of objective function
    constraints: constraints.map(row => row.slice(0, numVars)),  // Coefficient matrix A
    rhs: constraints.map(row => row[numVars]),  // Right-hand side values b
    relations: relations  // Inequality/equality relations
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/api/solve/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Transform the response to match your interface if needed
    const transformedResult: SimplexResult = {
      status: data.status || "Unknown",
      optimalValue: data.optimal_value,
      iterations: data.iterations,
      variables: data.variables,
      method: data.method
    };
    
    setResult(transformedResult);
  } catch (error) {
    console.error("Error:", error);
    setResult({ 
      status: "Error connecting to server",
      // message: error instanceof Error ? error.message : "Unknown error"
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

      {/* Dimensions Section */}
      <div className="dimensions-section card">
        <h3 className="section-title">Problem Dimensions</h3>
        <div className="dimensions-grid">
          <div className="dimension-item">
            <label className="dimension-label">Number of Variables</label>
            <input
              type="number"
              min={1}
              max={10}
              value={numVars}
              onChange={(e) => setNumVars(Number(e.target.value))}
              className="dimension-input"
            />
          </div>

          <div className="dimension-item">
            <label className="dimension-label">Number of Constraints</label>
            <input
              type="number"
              min={1}
              max={10}
              value={numConstraints}
              onChange={(e) => setNumConstraints(Number(e.target.value))}
              className="dimension-input"
            />
          </div>

          <button onClick={generateStructure} className="generate-btn pulse">
            <span className="btn-icon">✨</span>
            Generate Structure
          </button>
        </div>
      </div>

      {/* Objective Function */}
      <div className="objective-section card">
        <h3 className="section-title">
          <span className="title-icon">🎯</span>
          Objective Function (Maximize)
        </h3>
        <div className="coefficients-grid">
          {objective.map((val, i) => (
            <div key={i} className="coefficient-item">
              <label className="coeff-label">x<sub>{i + 1}</sub></label>
              <input
                type="number"
                value={val}
                onChange={(e) => handleObjectiveChange(i, e.target.value)}
                className="coeff-input"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="constraints-section card">
        <h3 className="section-title">
          <span className="title-icon">🔗</span>
          Constraints
        </h3>
        {constraints.map((row, i) => (
          <div key={i} className="constraint-row slide-in">
            <div className="constraint-left">
              {row.slice(0, numVars).map((val, j) => (
                <div key={j} className="constraint-term">
                  <input
                    type="number"
                    value={val}
                    onChange={(e) =>
                      handleConstraintChange(i, j, e.target.value)
                    }
                    className="constraint-input"
                    step="0.1"
                  />
                  <span className="variable-label">x<sub>{j + 1}</sub></span>
                  {j < numVars - 1 && <span className="plus-sign">+</span>}
                </div>
              ))}
            </div>

            <div className="constraint-right">
              <select
                value={relations[i]}
                onChange={(e) =>
                  handleRelationChange(i, e.target.value as Relation)
                }
                className="relation-select"
              >
                <option value="<=">≤</option>
                <option value=">=">≥</option>
                <option value="=">=</option>
              </select>

              <input
                type="number"
                value={row[numVars]}
                onChange={(e) =>
                  handleConstraintChange(i, numVars, e.target.value)
                }
                className="rhs-input"
                step="0.1"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Solve Button */}
      <div className="action-section">
        <button 
          onClick={handleSolve} 
          className={`solve-btn ${loading ? 'loading' : 'pulse'}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Solving...
            </>
          ) : (
            <>
              <span className="btn-icon">🚀</span>
              Solve Problem
            </>
          )}
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="result-section card slide-in">
          <h3 className="result-title">
            <span className="title-icon">📊</span>
            Solution Result
          </h3>
          
          <div className="result-content">
            <div className={`result-status ${result.status.includes('Optimal') ? 'success' : 'info'}`}>
              {result.status}
            </div>

            <div className="result-grid">
              {result.optimalValue !== undefined && (
                <div className="result-item">
                  <span className="result-label">Optimal Value</span>
                  <span className="result-value highlight">
                    {result.optimalValue.toFixed(2)}
                  </span>
                </div>
              )}

              {result.iterations !== undefined && (
                <div className="result-item">
                  <span className="result-label">Iterations</span>
                  <span className="result-value">{result.iterations}</span>
                </div>
              )}

              {result.method && (
                <div className="result-item">
                  <span className="result-label">Method Used</span>
                  <span className="result-value">{result.method}</span>
                </div>
              )}
            </div>

            {result.variables && (
              <div className="variables-section">
                <h4 className="variables-title">Decision Variables</h4>
                <div className="variables-grid">
                  {Object.entries(result.variables).map(([k, v]) => (
                    <div key={k} className="variable-card">
                      <span className="variable-name">{k}</span>
                      <span className="variable-value">= {(v as number).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <LPStructurePreview
  objective={objective}
  constraints={constraints.map(r => r.slice(0, numVars))}
  rhs={constraints.map(r => r[numVars])}
/>

        </div>
      )}
    </div>
  );
};

export default SimplexSolver;