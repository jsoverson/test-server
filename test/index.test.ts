import { expect } from 'chai';
import { start } from '../src';
import fetch from 'node-fetch';
import path from 'path';

const messageRoot = require('../server_root/message.json');
const messageLocal = require('./server_root/message.json');

describe('test-server', function () {
  it('Should start and stop with no arguments', async () => {
    const server = await start();
    const url = `http://127.0.0.1:${server.port}/message.json`;
    expect(server.port)
      .to.be.greaterThan(2 ** 10)
      .and.lessThan(2 ** 16);
    // this assumes that tests are being run in the root module dir via npm test
    expect(server.path).to.equal(path.join(__dirname, '..', 'server_root'));
    const result = await fetch(url);
    const obj = await result.json();
    expect(obj.message).to.equal(messageRoot.message);
    await server.stop();
  });

  it('Should take custom path', async () => {
    const server = await start(__dirname, 'server_root');
    const url = server.url('message.json');
    expect(server.port)
      .to.be.greaterThan(2 ** 10)
      .and.lessThan(2 ** 16);
    expect(server.path).to.equal(path.join(__dirname, 'server_root'));
    const result = await fetch(url);
    const obj = await result.json();
    expect(obj.message).to.equal(messageLocal.message);
    await server.stop();
  });
});
