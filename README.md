# Personal Blog

This is source of my personal blog, which is hosted on GitHub Pages. It uses a custom build system that I threw together one weekend.

### Setup

```
virtualenv env
source env/bin/activate
pip3 install -r requirements.txt
python3 builder.py serve
```

To build assets run `python3 builder.py build`.

### Configuration

Create a `config.yml` file and indicate `name`, `description`, `url`, and `articles_per_page`.
