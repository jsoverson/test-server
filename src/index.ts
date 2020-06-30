import handler from 'serve-handler';
import { Server, IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import DEBUG from 'debug';

const debug = DEBUG('test-server');

export class TestServer {
  _port: number;
  path: string;
  httpServer?: Server;
  timeout = 5000;
  constructor(port: number, pathParts: string[]) {
    this._port = port;
    this.path = path.join(...pathParts);
  }
  start() {
    return new Promise((resolve, reject) => {
      debug('starting server...');
      this.httpServer = new Server();
      this.httpServer.on('request', (request: IncomingMessage, response: ServerResponse) => {
        debug(`server request ${request.url}...`);
        return handler(request, response, {
          public: this.path,
          directoryListing: true,
          cleanUrls: false,
          trailingSlash: true
        });
      });
      this.httpServer.listen({
        port: this._port,
        host: '127.0.0.1',
      });
      const timeout = setTimeout(() => {
        debug('...server did not start');
        reject(new Error(`Server has not started in ${this.timeout}ms.`));
      }, this.timeout);
      this.httpServer.once('listening', () => {
        debug(`...started server on port ${this.port}`);
        clearTimeout(timeout);
        resolve(this);
      });
    });
  }
  get port() {
    if (this.httpServer) {
      const address = this.httpServer.address();
      if (address && typeof address !== 'string') return address.port;
    }
    return -1;
  }
  url(path: string) {
    return `${this.address}${path || ''}`;
  }
  get address() {
    if (this.httpServer) {
      const address = this.httpServer.address();
      if (address && typeof address !== 'string') {
        return `http://${address.address}:${address.port}/`;
      }
    }
    return '';
  }
  stop() {
    return new Promise((resolve, reject) => {
      if (this.httpServer) {
        debug('closing server...');
        this.httpServer.close(err => {
          debug(`...closed server (error:${err})`);
          if (err) reject(err);
          else resolve();
        });
      } else {
        debug('no http server started, can not stop.');
        reject(new Error('Server never started'));
      }
    });
  }
}

export async function start(...pathParts: string[]) {
  if (pathParts.length === 0) pathParts = [process.cwd(), 'server_root'];
  const server = new TestServer(0, pathParts);
  await server.start();
  return server;
}
