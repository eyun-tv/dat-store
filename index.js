const yargs = require('yargs')

const SERVICE_NAME = 'dat-store'

const addServiceOptions = (yargs) => yargs
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
const addClientOptions = (yargs) => yargs
  .option('config-location')
const noOptions = () => void 0

const commands = yargs
  .scriptName(SERVICE_NAME)
  .command(['add [provider] <url|path>', '$0 [provider] <url>'], 'Add a Dat to your storage provider.', addServiceOptions, add)
  .command('remove [provider] <url|path>', 'Remove a Dat from your storage provider.', addServiceOptions, remove)
  .command('list [provider]', 'List the Dats in your storage provider.', addServiceOptions, list)
  .command('set-provider [provider] <url>', 'Set the URL of your storage provider.', addServiceOptions, setService)
  .command('get-provider [provider]', 'Get the URL of your storage provider.', addServiceOptions, getService)
  .command('unset-provider', 'Reset your storage provider to the default: http://localhost:3472', addServiceOptions, unsetService)
  .command('login <username> [password]', 'Logs you into your storage provider.', addServiceOptions, login)
  .command('logout', 'Logs you out of your storage provider.', addServiceOptions, logout)
  .command('run-service', 'Runs a local storage provider.', addClientOptions, runService)
  .command('install-service', 'Installs a storage service on your machine. This will run in the background while your computer is active.', addClientOptions, installService)
  .command('uninstall-service', 'Uninstalls your local storage service.', noOptions, uninstallService)
  .help()

module.exports = (argv) => {
  commands.parse(argv)
}

function getClient (args) {
  const PeerClient = require('./client')

  const client = new PeerClient(args)

  return client
}

async function add (args) {
  await getClient(args).add(args.url)
}

async function list (args) {
  const { items } = await getClient(args).list()

  for (let { url } of items) {
    console.log(url)
  }
}

async function remove (args) {
  await getClient(args).remove(args.url)
}

async function setService (args) {
  await getClient(args).setService(args.url)
}

async function unsetService (args) {
  await getClient(args).unsetService()
}

async function getService (args) {
  const service = await getClient(args).getService()

  console.log(service)
}

async function login (args) {
  const { username, password } = args

  const client = await getClient(args)

  if (!password) {
    const read = require('read')

    read({ prompt: 'Enter your password:', silent: true }, (err, password) => {
      if (err) throw err
      client.login(username, password)
    })
  } else client.login(username, password)
}

async function logout (args) {
  await getClient(args).logout()
}

function getServiceLocation () {
  const path = require('path')
  return path.join(__dirname, 'service.js')
}

function runService () {
  require('./service.js')
}

async function installService (args) {
  const service = require('os-service')
  const programPath = getServiceLocation()

  const programArgs = process.argv.slice(3)

  service.add(SERVICE_NAME, { programPath, programArgs }, (e) => {
    if (e) throw e
  })
}

async function uninstallService (args) {
  const service = require('os-service')

  service.remove(SERVICE_NAME, (e) => {
    if (e) throw e
  })
}
