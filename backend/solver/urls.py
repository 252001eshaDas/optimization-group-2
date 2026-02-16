from django.urls import path
from .views import solve_lp

urlpatterns = [
    path("solve/", solve_lp, name="solve_lp"),
]
