import sys
import time
import logging
from multiprocessing import Process
from watchdog.observers import Observer
from lib.build import build
from lib.serve import serve
from lib.settings import SRC_DIR
from lib.watcher import EventHandler


def watch():
    logging.basicConfig(level=logging.INFO,
                        format='-WATCHER- - - [%(asctime)s] %(message)s',
                        datefmt='%d/%b/%Y %H:%M:%S')

    build()
    logging.info('Completed initial build')

    webserver = Process(target=serve)

    observer = Observer()
    observer.schedule(EventHandler(), SRC_DIR, recursive=True)

    observer.start()
    webserver.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        webserver.terminate()

    webserver.join()
    observer.join()


if __name__ == '__main__':
    try:
        cmd = sys.argv[1]
    except Exception as e:
        sys.exit('No command given')
    if cmd == 'build':
        sys.stdout.write('Building...')
        build()
        sys.stdout.write('Done\n')
    elif cmd == 'serve':
        watch()
    else:
        print('Available commands are "build" and "serve"')
