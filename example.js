const { start } = require('.');
const fetch = require('node-fetch');

(async function () {
  const server = await start();

  console.log(`Server started on port ${server.port}, serving directory "${server.path}"`);

  const response = await fetch(server.url('index.html'));
  console.log(await response.text());

  await server.stop();
}())