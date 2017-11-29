from os import listdir
from os.path import dirname, abspath, join, splitext
from jinja2 import Environment, FileSystemLoader
from markdown import markdown

BASE_DIR = dirname(dirname(abspath(__file__)))
TEMPLATE_DIR = join(BASE_DIR, 'src', 'templates')
ARTICLES_DIR = join(BASE_DIR, 'src', 'articles')
DIST_DIR = join(BASE_DIR, 'dist')

jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


def build():
    for in_fname in listdir(path=ARTICLES_DIR):
        with open(join(ARTICLES_DIR, in_fname)) as in_fp:
            out_fname = splitext(in_fname)[0] + '.html'
            out_fp = open(join(DIST_DIR, out_fname), 'w')
            out_fp.write(markdown(in_fp.read()))
            out_fp.close()


if __name__ == '__main__':
    build()
