import numpy as np

class TwoPhaseSimplex:
    def __init__(self, c, A, b):
        self.c = np.array(c, dtype=float)
        self.A = np.array(A, dtype=float)
        self.b = np.array(b, dtype=float)
        self.relations = '<='

    def _pivot(self, T, r, c):
        T[r] = T[r] / T[r, c]
        for i in range(T.shape[0]):
            if i != r:
                T[i] -= T[i, c] * T[r]

    def _simplex(self, T):
        iterations = 0
        while True:
            iterations += 1
            obj = T[-1, :-1]

            if np.all(obj >= 0):
                break

            pc = np.argmin(obj)

            ratios = [
                T[i, -1] / T[i, pc] if T[i, pc] > 0 else np.inf
                for i in range(T.shape[0] - 1)
            ]

            pr = np.argmin(ratios)
            self._pivot(T, pr, pc)

        return T, iterations

    def solve(self):
        m, n = self.A.shape
        rows = []
        artificial = []

        for i in range(m):
            row = list(self.A[i])

            slack = [0] * m
            art = [0] * m

            if self.relations[i] == "<=":
                slack[i] = 1
            elif self.relations[i] == ">=":
                slack[i] = -1
                art[i] = 1
                artificial.append(n + m + i)
            elif self.relations[i] == "=":
                art[i] = 1
                artificial.append(n + m + i)

            row += slack + art + [self.b[i]]
            rows.append(row)

        T = np.array(rows, dtype=float)

        # ---------- PHASE I ----------
        obj1 = np.zeros(T.shape[1])
        for i in artificial:
            obj1[i] = 1

        T = np.vstack([T, obj1])
        T, _ = self._simplex(T)

        if T[-1, -1] > 1e-6:
            return {"status": "Infeasible"}

        # ---------- PHASE II ----------
        T = T[:-1]
        obj2 = np.zeros(T.shape[1])
        obj2[:n] = -self.c
        T = np.vstack([T, obj2])

        T, iterations = self._simplex(T)

        solution = np.zeros(n)
        for j in range(n):
            col = T[:-1, j]
            if np.count_nonzero(col == 1) == 1 and np.count_nonzero(col) == 1:
                r = np.where(col == 1)[0][0]
                solution[j] = T[r, -1]

        return {
            "status": "Optimal",
            "optimalValue": float(T[-1, -1]),
            "variables": {f"x{i+1}": float(solution[i]) for i in range(n)},
            "iterations": iterations
        }
