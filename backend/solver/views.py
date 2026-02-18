
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .simples import TwoPhase
from .dual_simplex import DualSimplex

@csrf_exempt
def solve_lp(request):
    if request.method == "POST":
        data = json.loads(request.body)

        method = data.get("method", "two-phase")

        if method == "dual":
            solver = DualSimplex(data)
        else:
            solver = TwoPhase(data)

        solution = solver.solve()

        return JsonResponse(solution)

    return JsonResponse({"message": "Send POST request"})
