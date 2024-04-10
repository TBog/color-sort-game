# from BaseHTTPServer import BaseHTTPRequestHandler
import SimpleHTTPServer
import SocketServer
import urlparse, json

class GetHandler(SimpleHTTPServer.SimpleHTTPRequestHandler, object):

    def do_GET(self):
        urlPath = urlparse.urlparse(self.path)
        message = '\n'.join([
            'client_address=%s (%s)' % (self.client_address, self.address_string()),
            'command=%s' % self.command,    # GET, POST, ...
            'path=%s' % self.path,
            'url path=%s' % urlPath.path,
            'url query=%s' % urlPath.query,
            '',
            ])
        print message
        query_components = urlparse.parse_qs(urlPath.query)
        if urlPath.query:
            with open(urlPath.path) as f:
                newText=f.read().replace('A', 'Orange')
        return super(GetHandler, self).do_GET()
        # self.send_response(200)
        # self.end_headers()
        # self.wfile.write(message)
        # return

    def do_POST(self):
        print('POST %s (from client %s)' % (self.path, self.client_address))
        return super(GetHandler, self).do_POST()
        # content_len = int(self.headers.getheader('content-length'))
        # post_body = self.rfile.read(content_len)
        # self.send_response(200)
        # self.end_headers()

        # data = json.loads(post_body)

        # self.wfile.write(data['foo'])
        # return

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        return super(GetHandler, self).end_headers()

if __name__ == '__main__':
    PORT = 8080
    # from BaseHTTPServer import HTTPServer
    # server = HTTPServer(('localhost', 8080), GetHandler)
    # print 'Starting server at http://localhost:8080'
    # server.serve_forever()
    try:
        httpd = SocketServer.TCPServer(('localhost', PORT), GetHandler)
        print 'Starting server at http://localhost:', PORT
        httpd.serve_forever()
    except:
        print 'Exit'