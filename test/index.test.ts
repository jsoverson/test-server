import {expect} from 'chai';
import {start, TestServer} from '../src';
import fetch from 'node-fetch';
import path from 'path';

const messageRoot = require('../server_root/message.json');
const messageLocal = require('./server_root/message.json');

describe('test-server', function () {
  let server: TestServer;

  afterEach(async () => {
    if (server) await server.stop();
  });

  it('Should start and stop with no arguments', async () => {
    server = await start();
    const url = `http://127.0.0.1:${server.port}/message.json`;
    expect(server.port)
      .to.be.greaterThan(2 ** 10)
      .and.lessThan(2 ** 16);
    // this assumes that tests are being run in the root module dir via npm test
    expect(server.path).to.equal(path.join(__dirname, '..', 'server_root'));
    const result = await fetch(url);
    const obj = await result.json();
    expect(obj.message).to.equal(messageRoot.message);
  });

  it('Should take custom path', async () => {
    server = await start(__dirname, 'server_root');
    const url = server.url('message.json');
    expect(server.port)
      .to.be.greaterThan(2 ** 10)
      .and.lessThan(2 ** 16);
    expect(server.path).to.equal(path.join(__dirname, 'server_root'));
    const result = await fetch(url);
    const obj = await result.json();
    expect(obj.message).to.equal(messageLocal.message);
  });

  it('URLs ending in /drop should drop connections', async () => {
    server = await start(__dirname, 'server_root');
    const url = server.url('drop');
    const result = await fetch(url).catch(() => 'error');
    expect(result).to.equal('error');
  });

  it('/wait/#### should wait #### long', async () => {
    server = await start(__dirname, 'server_root');
    const url = server.url('wait/500');
    const startTime = Date.now();
    const response = await fetch(url);
    const timeWaited = parseInt(await response.text());
    const endTime = Date.now();
    const testTime = endTime - startTime;
    expect(testTime).to.be.greaterThan(500);
    expect(timeWaited).to.be.greaterThan(499);
  });

  it('/status/#### should return a status of ####', async () => {
    server = await start(__dirname, 'server_root');
    const url = server.url('status/404');
    const result = await fetch(url).catch(e => e);
    expect(result.status).to.equal(404);
  });

  it('/cached should return a random number with long cache headers', async () => {
    // TODO: actually test cache headers.
    server = await start(__dirname, 'server_root');
    const url = server.url('cached');
    const result1 = await fetch(url).catch(e => e);
    expect(result1.status).to.equal(200);
    const body1 = await result1.text();
    const result2 = await fetch(url).catch(e => e);
    expect(result2.status).to.equal(200);
    const body2 = await result2.text();
    expect(body1).to.not.equal(body2);
  });
});
