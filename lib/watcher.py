import logging
from watchdog.events import FileSystemEventHandler
from time import time
from lib.build import build


class EventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        t0 = time()
        build()
        t1 = time()
        diff = str(t1 - t0)[:5]
        logging.info("Built in " + diff + " seconds")
