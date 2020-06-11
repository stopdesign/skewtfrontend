from django.db import models
import datetime
from django.utils import timezone
import markdown
from glob import glob
import re 


# Create your models here.
class Article(models.Model):


    md_filename = models.CharField(max_length=200)
    slug = models.CharField(max_length=200, default="")
    content = models.TextField(default="")

    def __str__(self):
        return self.slug

    def seed_article(self, md_filename):
        print(f"Seeding {md_filename}...")
        md = markdown.Markdown(extensions=['extra'])
        with open(md_filename, 'r') as f:
            text = f.read()
        
        self.md_filename = md_filename
        self.content = md.convert(text)
        h1_tag = re.findall(r"<h1>.+<\/h1>", self.content)[0]
        h1_tag = re.sub(r'\s+', '-', h1_tag)
        self.slug = h1_tag.replace(".", "").replace("<h1>", "").replace("</h1>", "").lower().replace("?", "").replace("'", "")
        self.save()

