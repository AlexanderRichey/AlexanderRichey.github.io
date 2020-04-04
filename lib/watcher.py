import logging
import time

from watchdog.events import RegexMatchingEventHandler
from lib.build import build


class EventHandler(RegexMatchingEventHandler):
    def on_modified(self, event):
        t0 = time.time()
        build()
        t1 = time.time()

        diff = str(t1 - t0)[:5]
        logging.info("Built in " + diff + " seconds")
