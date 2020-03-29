import yaml
from os.path import dirname, abspath, join


BASE_DIR = dirname(dirname(abspath(__file__)))
SRC_DIR = join(BASE_DIR, "src")
TEMPLATE_DIR = join(SRC_DIR, "templates")
ARTICLES_DIR = join(SRC_DIR, "articles")
PAGES_DIR = join(SRC_DIR, "pages")
ASSETS_DIR = join(SRC_DIR, "assets")
DIST_DIR = join(BASE_DIR, "dist")
PORT = 3000

try:
    with open(join(BASE_DIR, "config.yml")) as config_fp:
        CONFIG = yaml.load(config_fp.read(), Loader=yaml.FullLoader)
except Exception as e:
    raise ImportError("Could not load config")

BASE_URL = CONFIG.get("url", "")
