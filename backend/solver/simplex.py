import numpy as np


class TwoPhaseSimplex:
    def __init__(self, c, A, b):
        self.c = np.array(c, dtype=float)
        self.A = np.array(A, dtype=float)
        self.b = np.array(b, dtype=float)

    def solve(self):
        m, n = self.A.shape

        # Add slack variables
        I = np.eye(m)
        tableau = np.hstack([self.A, I, self.b.reshape(-1, 1)])

        # Phase 2 Objective row
        obj_row = np.hstack([-self.c, np.zeros(m + 1)])
        tableau = np.vstack([tableau, obj_row])

        iterations = 0

        while True:
            iterations += 1

            last_row = tableau[-1, :-1]

            # Optimal condition
            if all(x >= 0 for x in last_row):
                break

            pivot_col = np.argmin(last_row)

            ratios = []
            for i in range(m):
                if tableau[i, pivot_col] > 0:
                    ratios.append(tableau[i, -1] / tableau[i, pivot_col])
                else:
                    ratios.append(np.inf)

            pivot_row = np.argmin(ratios)

            pivot = tableau[pivot_row, pivot_col]
            tableau[pivot_row] /= pivot

            for i in range(m + 1):
                if i != pivot_row:
                    tableau[i] -= tableau[i, pivot_col] * tableau[pivot_row]

        solution = np.zeros(n)
        for i in range(m):
            col = tableau[i, :n]
            if sum(col == 1) == 1 and sum(col) == 1:
                idx = np.where(col == 1)[0][0]
                solution[idx] = tableau[i, -1]

        optimal_value = tableau[-1, -1]

        return {
            "status": "Optimal",
            "optimalValue": float(optimal_value),
            "variables": {
                f"x{i+1}": float(solution[i]) for i in range(n)
            },
            "iterations": iterations
        }
