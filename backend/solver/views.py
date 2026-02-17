
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .simples import TwoPhase

@csrf_exempt
def solve_lp(request):
    if request.method == "POST":
        data = json.loads(request.body)

        solver = TwoPhase(data)
        solution = solver.solve()

        return JsonResponse(solution)

    return JsonResponse({"message": "Send POST request"})
