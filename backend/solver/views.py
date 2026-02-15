from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .simplex import TwoPhaseSimplex


@api_view(["POST"])
def solve_lp(request):
    data = request.data

    method = data.get("method")
    c = data.get("objective")
    A = data.get("constraints")
    b = data.get("rhs")

    if method != "two-phase":
        return Response({"error": "Only Two-Phase implemented currently"})

    solver = TwoPhaseSimplex(c, A, b)
    result = solver.solve()

    return Response(result)
