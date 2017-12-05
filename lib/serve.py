import os
import http.server
import socketserver
import logging
from lib.settings import DIST_DIR, PORT


def serve():
    os.chdir(DIST_DIR)
    Handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(('', PORT), Handler)
    logging.info('Webserver listening at port ' + str(PORT))
    httpd.serve_forever()
