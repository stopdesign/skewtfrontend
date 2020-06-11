from django.urls import path
from .views import HomeView, ArticleView



app_name = 'skewtapp'
urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('<slug:slug>/', ArticleView.as_view(), name='article'),
]
