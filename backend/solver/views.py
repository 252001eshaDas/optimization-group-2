import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .simples import TwoPhaseSimplex


@csrf_exempt
def solve_lp(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)

        # 🔍 DEBUG: log incoming payload
        print("RECEIVED DATA:", data)

        method = data.get("method")
        c = data.get("objective")
        A = data.get("constraints")
        b = data.get("rhs")

        # -------- STRICT VALIDATION --------
        if not isinstance(c, list):
            return JsonResponse({"error": "objective must be a list"}, status=400)

        if not isinstance(A, list):
            return JsonResponse({"error": "constraints must be a list of lists"}, status=400)

        if not isinstance(b, list):
            return JsonResponse({"error": "rhs must be a list"}, status=400)

        if len(A) != len(b):
            return JsonResponse(
                {"error": "Number of constraints and RHS values must match"},
                status=400,
            )

        n = len(c)
        if n == 0:
            return JsonResponse({"error": "Objective cannot be empty"}, status=400)

        for row in A:
            if not isinstance(row, list):
                return JsonResponse({"error": "Each constraint must be a list"}, status=400)
            if len(row) != n:
                return JsonResponse(
                    {"error": "Each constraint must have same number of coefficients as objective"},
                    status=400,
                )

        # -------- SOLVE --------
        solver = TwoPhaseSimplex(c, A, b)
        result = solver.solve()
        result["method"] = method

        return JsonResponse(result)

    except Exception as e:
        print("ERROR:", str(e))
        return JsonResponse({"error": str(e)}, status=500)
