from django.views.generic import TemplateView, DetailView
from skewtapp.models import Article



class HomeView(TemplateView):
    template_name = "skewtapp/home.html"



class ArticleView(DetailView):
    template_name = "skewtapp/article.html"
    context_object_name = 'article'
    model = Article

