from glob import glob
from skewtapp.models import Article
from django.conf import settings


MARKDOWN_DIR = f"{settings.BASE_DIR}/skewtapp/markdown/"


def run():
    Article.objects.all().delete()
    print("Seeding Articles...")
    for md_filename in glob(MARKDOWN_DIR + "*.md"):
        print(md_filename)
        article = Article()
        article.seed_article(md_filename)
    print("Ok.")

