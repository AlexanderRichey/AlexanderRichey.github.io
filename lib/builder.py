from os import listdir
from os.path import dirname, abspath, join, splitext
from pathlib import Path
from io import BytesIO
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from markdown import Markdown
from yaml import load
from slugify import slugify

BASE_DIR = dirname(dirname(abspath(__file__)))
TEMPLATE_DIR = join(BASE_DIR, 'src', 'templates')
ARTICLES_DIR = join(BASE_DIR, 'src', 'articles')
DIST_DIR = join(BASE_DIR, 'dist')

try:
    with open(join(BASE_DIR, 'config.yml')) as config_fp:
        CONFIG = load(config_fp.read())
except Exception as e:
    raise ImportError('Could not load config')

BASE_URL = CONFIG.get('url', '')

try:
    jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
except Exception as e:
    raise ImportError('Could not load template directory')

md = Markdown(extensions=['markdown.extensions.meta'])


def build():
    Path(join(DIST_DIR, 'articles')).mkdir(exist_ok=True)
    article_template = jinja_env.get_template('article.html')
    index_template = jinja_env.get_template('index.html')
    fnames = sorted(listdir(path=ARTICLES_DIR),
                    key=lambda f: datetime(*[int(i) for i in f.split('-')[:3]]).timestamp(),
                    reverse=True)
    index_page_num = 0
    index_payload = []
    len_articles = len(fnames)
    max_page_len = CONFIG.get('articles_per_page', 3)
    for idx, in_fname in enumerate(fnames):
        base_fname, _ = splitext(in_fname)
        out_fname = base_fname + '.html'
        in_fpath = join(ARTICLES_DIR, in_fname)
        out_fpath = join(DIST_DIR, 'articles', out_fname)

        buf = BytesIO()
        md.convertFile(input=in_fpath, output=buf)
        meta = md.Meta
        md.reset()

        article_title, page_title, date, url = \
            massage_metadata(meta, base_fname)

        article_payload = dict(
            url=url,
            title=article_title,
            page_title=page_title,
            date=date,
            content=buf.getvalue().decode('utf-8')
        )

        with open(out_fpath, 'w') as out_fp:
            out_fp.write(article_template.render(article_payload))

        index_payload.append(article_payload)

        if (((idx + 1) % max_page_len) == 0 and idx != 0) or (idx == (len_articles - 1)):
            page_title = CONFIG.get('name', '')
            if index_page_num == 0:
                out_index_fpath = join(DIST_DIR, 'index.html')
                url = BASE_URL
                prev_page = None
            else:
                page_dir = 'page' + str(index_page_num)
                url = '/' + page_dir
                out_index_fpath = join(DIST_DIR, page_dir, 'index.html')
                Path(join(DIST_DIR, page_dir)).mkdir(exist_ok=True)
            if (len_articles - 1) > idx:
                next_page = '/page' + str(index_page_num + 1)
            elif (len_articles - 1) == idx:
                next_page = None
            if index_page_num > 0:
                if index_page_num == 1:
                    prev_page = '/'
                else:
                    prev_page = '/page' + str(index_page_num - 1)
            with open(out_index_fpath, 'w') as out_fp:
                out_fp.write(index_template.render(
                    url=url,
                    page_title=page_title,
                    articles=index_payload,
                    next=next_page,
                    prev=prev_page
                ))
            index_payload = []
            index_page_num += 1


def massage_metadata(meta, base_fname):
    article_title = ','.join(meta.get('title', ''))
    url = '/articles/' + slugify(article_title) + '.html'
    page_title = CONFIG.get('name', '') + ' • ' + article_title
    date = '-'.join(base_fname.split('-')[:3])
    return article_title, page_title, date, url


if __name__ == '__main__':
    build()
