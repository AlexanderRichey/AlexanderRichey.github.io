import os
import http.server
import socketserver
import logging
from lib.settings import DIST_DIR, PORT


def serve():
    os.chdir(DIST_DIR)
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        logging.info('Webserver listening at port ' + str(PORT))
        httpd.serve_forever()
