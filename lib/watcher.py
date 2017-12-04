from timeit import timeit
from watchdog.events import FileSystemEventHandler


class EventHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        time = timeit('build()')
        logging.info('built in ' + str(time)[:5] + 'seconds')
