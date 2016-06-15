---
layout: post
title: Friction Points in Django Pipeline Installation with AngularJS
---

Installing the Django Pipeline is a pain. Here's a few things to watch out for that might save you some searching on Stack Overflow.

## Enable The Pipeline

```python
PIPELINE = {
    'PIPELINE_ENABLED': False,
    ...
```

If your Pipeline config, which lives in `settings.py`, you have to remember to set the `PIPELINE_ENABLED` setting. If you forget to include it, contrary to what [the docs](https://django-pipeline.readthedocs.io/en/latest/usage.html) say, *the pipeline won't output anything in your templates!* If it's set to `False`, your scripts are loaded on the page one-by-one in the order you specify in your config. Otherwise, the pipeline will load output scripts that point to your output files, which are only created after you run `$ python manage.py collectstatic`.

## Commas

Commas are required in odd places, even when there's only one thing being listed.

**BAD**

```python
'JAVASCRIPT': {
    'libs': {
        'source_filenames': (
          'js/libs/jquery-2.1.3.min.js'
        ),
        'output_filename': 'js/libs.js'
    },
    ...
```

**GOOD**

```python
'JAVASCRIPT': {
    'libs': {
        'source_filenames': (
          'js/libs/jquery-2.1.3.min.js', <=# wut?
        ),
        'output_filename': 'js/libs.js', <=# why?
    },
    ...
```

## AngularJS v. Pipeline Compression

Angular does not do well with [modern compression](http://stackoverflow.com/questions/19671962/uncaught-error-injectorunpr-with-angular-after-deployment). The reason for this is that it interacts with your views very closely and compressors are not smart enough to look at your views to check if they reference any javascript functions, properties, etc. The usual solution to this problem is to set the `mangle` setting to `false` in your compressor config, but Django Pipeline doesn't make this easy. Supposedly, you can pass in a command line argument to your compressor like so.

```python
PIPELINE['UGLIFYJS_ARGUMENTS'] = '--no-mangle'
```

But, of course, this [doesn't work](http://stackoverflow.com/questions/37821790/uglifyjs-unknown-option-in-cli) in certain environments. The solution here is to use a more bare-bones compressor, like [JSMin](http://www.crockford.com/javascript/jsmin.html) or [SlimIt](https://github.com/rspivak/slimit), which don't change the names of your functions, variables, etc.
