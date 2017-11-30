from os import listdir
from os.path import dirname, abspath, join, splitext
from pathlib import Path
from io import BytesIO
from jinja2 import Environment, FileSystemLoader
from markdown import Markdown
from yaml import load
from slugify import slugify

BASE_DIR = dirname(dirname(abspath(__file__)))
TEMPLATE_DIR = join(BASE_DIR, 'src', 'templates')
ARTICLES_DIR = join(BASE_DIR, 'src', 'articles')
DIST_DIR = join(BASE_DIR, 'dist')

with open(join(BASE_DIR, 'config.yml')) as config_fp:
    CONFIG = load(config_fp.read())

jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
md = Markdown(extensions=['markdown.extensions.meta'])


def build():
    template = jinja_env.get_template('article.html')

    for in_fname in listdir(path=ARTICLES_DIR):

        name, _ = splitext(in_fname)
        out_fname = name + '.html'

        in_fpath = join(ARTICLES_DIR, in_fname)
        out_fpath = join(DIST_DIR, 'articles', out_fname)

        Path(join(DIST_DIR, 'articles')).mkdir(exist_ok=True)

        buffer = BytesIO()
        md.convertFile(input=in_fpath, output=buffer)
        meta = md.Meta

        url = '{url}/articles/{title}.html'.format(
            url=CONFIG.get('url', ''),
            title=slugify(','.join(meta.get('title', '')))
        )
        title = ','.join(meta.get('title', ''))
        page_title = '{name} * {title}'.format(
            name=CONFIG.get('name', ''),
            title=title
        )
        date = '-'.join(name.split('-')[:3])

        with open(out_fpath, 'w') as out_fp:
            out_fp.write(template.render(
                url=url,
                title=title,
                page_title=page_title,
                date=date,
                content=buffer.getvalue().decode('utf-8')
            ))

        md.reset()


if __name__ == '__main__':
    build()
