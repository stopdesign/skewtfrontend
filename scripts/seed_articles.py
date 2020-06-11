from glob import glob
from skewtapp.models import Article

MARKDOWN_DIR = "/home/jokea/code/skewt/skewtfrontend/skewtapp/markdown/"


def run():
    Article.objects.all().delete()
    for md_filename in glob(MARKDOWN_DIR + "*.md"):
        print(md_filename)
        article = Article()
        article.seed_article(md_filename)

