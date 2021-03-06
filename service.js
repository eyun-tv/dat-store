const PinServer = require('./server')

const yargs = require('yargs')

const argv = yargs
  .command('$0', 'Start the store service')
  .option('storage-location', {
    describe: 'The folder to store dats in'
  })
  .option('port', {
    describe: 'The port to use for the HTTP API',
    default: 3472
  })
  .option('host', {
    describe: 'The hostname to make the HTTP server listen on'
  })
  .option('verbose', {
    describe: 'Whether the HTTP server should output logs',
    default: true,
    type: 'boolean'
  })
  .option('dat-port', {
    describe: 'The port to listen for P2P connections on',
    default: 3282
  })
  .option('latest', {
    describe: 'Whether to download just the latest changes',
    default: false,
    type: 'boolean'
  })
  .argv

const service = require('os-service')

service.run(() => {
  service.stop()
})

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

async function run () {
  await PinServer.createServer(argv)
}
