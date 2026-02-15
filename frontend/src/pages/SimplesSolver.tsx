import React, { useState } from "react";

type MethodType = "two-phase" | "dual";

interface SimplexResult {
  status: string;
  optimalValue: number;
  variables: Record<string, number>;
  iterations: number;
  method: string;
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
  const [result, setResult] = useState<SimplexResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle objective change
  const handleObjectiveChange = (index: number, value: string) => {
    const updated = [...objective];
    updated[index] = Number(value);
    setObjective(updated);
  };

  // Handle constraint change
  const handleConstraintChange = (
    row: number,
    col: number,
    value: string
  ) => {
    const updated = [...constraints];
    updated[row][col] = Number(value);
    setConstraints(updated);
  };

  // Generate dynamic arrays
  const generateStructure = () => {
    setObjective(Array(numVars).fill(0));
    setConstraints(
      Array(numConstraints)
        .fill(0)
        .map(() => Array(numVars + 1).fill(0))
    );
  };

  // Dummy solver
  const handleSolve = async () => {
    setLoading(true);
    setResult(null);
  
    const payload = {
      method,
      objective,
      constraints: constraints.map(row => row.slice(0, numVars)),
      rhs: constraints.map(row => row[numVars])
    };
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/solve/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  
    setLoading(false);
  };
  

  return (
    <div style={styles.container}>
      <h2>Linear Programming Solver</h2>

      {/* Method */}
      <div>
        <label>
          <input
            type="radio"
            checked={method === "two-phase"}
            onChange={() => setMethod("two-phase")}
          />
          Two-Phase
        </label>

        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            checked={method === "dual"}
            onChange={() => setMethod("dual")}
          />
          Dual
        </label>
      </div>

      <hr />

      {/* Variables & Constraints */}
      <div>
        <label>Variables: </label>
        <input
          type="number"
          value={numVars}
          onChange={(e) => setNumVars(Number(e.target.value))}
        />

        <label style={{ marginLeft: 20 }}>Constraints: </label>
        <input
          type="number"
          value={numConstraints}
          onChange={(e) => setNumConstraints(Number(e.target.value))}
        />

        <button onClick={generateStructure} style={{ marginLeft: 20 }}>
          Generate
        </button>
      </div>

      <hr />

      {/* Objective */}
      <h4>Objective Function Coefficients</h4>
      {objective.map((val, i) => (
        <input
          key={i}
          type="number"
          placeholder={`x${i + 1}`}
          value={val}
          onChange={(e) =>
            handleObjectiveChange(i, e.target.value)
          }
          style={{ marginRight: 10 }}
        />
      ))}

      <hr />

      {/* Constraints */}
      <h4>Constraints (Last column = RHS)</h4>
      {constraints.map((row, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          {row.map((val, j) => (
            <input
              key={j}
              type="number"
              value={val}
              onChange={(e) =>
                handleConstraintChange(i, j, e.target.value)
              }
              style={{ marginRight: 5 }}
            />
          ))}
        </div>
      ))}

      <button onClick={handleSolve} style={styles.solveBtn}>
        {loading ? "Solving..." : "Solve"}
      </button>

      {/* Result */}
      {result && (
        <div style={styles.result}>
          <h3>{result.method} Result</h3>
          <p>Status: {result.status}</p>
          <p>Optimal Value: {result.optimalValue}</p>
          <p>Iterations: {result.iterations}</p>

          <h4>Variables:</h4>
          {Object.entries(result.variables).map(([key, val]) => (
            <p key={key}>
              {key} = {val}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
  },
  solveBtn: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "blue",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  result: {
    marginTop: "20px",
    padding: "15px",
    background: "blue",
  },
};

export default SimplexSolver;
