import os
import sys
import shutil
import logging
from os.path import dirname, abspath, join, splitext, isfile
from io import BytesIO
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from markdown import Markdown
from slugify import slugify

from lib.settings import BASE_DIR, \
                         SRC_DIR, \
                         TEMPLATE_DIR, \
                         ARTICLES_DIR, \
                         PAGES_DIR, \
                         ASSETS_DIR, \
                         DIST_DIR, \
                         PORT, \
                         CONFIG, \
                         BASE_URL

try:
    jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
except Exception as e:
    raise ImportError('Could not load template directory')

md = Markdown(extensions=['markdown.extensions.meta',
                          'markdown.extensions.fenced_code'])
article_template = jinja_env.get_template('article.html')
index_template = jinja_env.get_template('index.html')


def build():
    clean_dist_dir()
    build_articles_and_indicies()
    build_pages()
    copy_assets()
    copy_misc_files()
    return True


def build_articles_and_indicies():
    mkdir_in_dist('articles')

    fnames = sorted(
        os.listdir(path=ARTICLES_DIR),
        key=lambda f: datetime(*[int(i) for i in f.split('-')[:3]]).timestamp(),
        reverse=True
    )

    index_page_num = 0
    index_payload = []
    len_articles = len(fnames)
    max_page_len = CONFIG.get('articles_per_page', 3)

    for idx, in_fname in enumerate(fnames):
        base_fname, _ = splitext(in_fname)
        in_fpath = join(ARTICLES_DIR, in_fname)

        buf, meta = convert_to_html(in_fpath)

        article_title, page_title, date, url = \
            massage_metadata(meta, base_fname)

        out_fpath = join(DIST_DIR, url[1:])

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

        if (((idx + 1) % max_page_len) == 0 and idx != 0) or \
                (idx == (len_articles - 1)):
            page_title = CONFIG.get('name', '')
            if index_page_num == 0:
                out_index_fpath = join(DIST_DIR, 'index.html')
                url = BASE_URL
                prev_page = None
            else:
                page_dir = 'page' + str(index_page_num + 1)
                mkdir_in_dist(page_dir)
                url = '/' + page_dir
                out_index_fpath = join(DIST_DIR, page_dir, 'index.html')
            if (len_articles - 1) > idx:
                next_page = '/page' + str(index_page_num + 2) + '/'
            elif (len_articles - 1) == idx:
                next_page = None
            if index_page_num > 0:
                if index_page_num == 1:
                    prev_page = '/'
                else:
                    prev_page = '/page' + str(index_page_num) + '/'
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
    return True


def build_pages():
    mkdir_in_dist('pages')
    for in_fname in os.listdir(path=PAGES_DIR):
        base_fname, _ = splitext(in_fname)
        in_fpath = join(PAGES_DIR, in_fname)

        buf, meta = convert_to_html(in_fpath)

        article_title, page_title, date, url = \
            massage_metadata(meta, base_fname, parent_dir='pages')

        out_fpath = join(DIST_DIR, url[1:])

        with open(out_fpath, 'w') as out_fp:
            out_fp.write(article_template.render(
                url=url,
                title=article_title,
                page_title=page_title,
                date='',
                content=buf.getvalue().decode('utf-8')
            ))
    return True


def convert_to_html(in_fpath):
    buf = BytesIO()
    md.convertFile(input=in_fpath, output=buf)
    meta = md.Meta
    md.reset()
    return buf, meta


def copy_assets():
    mkdir_in_dist('assets')
    for root, dirs, files in os.walk(ASSETS_DIR, topdown=False):
        for name in files:
            shutil.copy(join(root, name), join(DIST_DIR, 'assets', name))
    return True


def copy_misc_files():
    files = [f for f in os.listdir(SRC_DIR) if isfile(join(SRC_DIR, f))]
    for name in files:
        shutil.copy(join(SRC_DIR, name), join(DIST_DIR, name))
    return True


def massage_metadata(meta, base_fname, parent_dir='articles'):
    article_title = ','.join(meta.get('title', ''))
    url = join('/', parent_dir, slugify(article_title) + '.html')
    page_title = CONFIG.get('name', '') + ' • ' + article_title
    try:
        date_arr = [int(i) for i in base_fname.split('-')[:3]]
        date = datetime(*date_arr).strftime('%-d %B %Y')
    except ValueError as e:
        logging.warn(base_fname + ' does not have a date')
        date = ''
    return article_title, page_title, date, url


def mkdir_in_dist(name):
    try:
        os.mkdir(join(DIST_DIR, name))
    except FileExistsError as e:
        pass
    return True


def clean_dist_dir():
    for root, dirs, files in os.walk(DIST_DIR, topdown=False):
        for name in files:
            os.remove(join(root, name))
        for name in dirs:
            os.rmdir(join(root, name))
    return True
