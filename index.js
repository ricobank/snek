const ethers = require('ethers');
const ganache = require("ganache")
const { Command } = require('commander')
const program = new Command()

const vyper = require('./vyper.js')

program
    .name('snek')
    .description('vyper helper command')
    .version('0.0.1')

program.command('make')
    .description('compile all vyper contracts in source folder')
    .argument('[src_path]', 'path to vyper file(s) to compile', 'src/**.vy')
    .action((src_path) => { make(src_path) })

program.command('test')
    .description('compile and test all vyper contracts in source and test folders')
    .argument('[src_path]', 'path to vyper source file(s) to compile', 'src/**.vy')
    .argument('[test_path]', 'path to test files', 'test/**.vy')
    .action((src_path, test_path) => { test(src_path, test_path) })

program.command('help')
    .description('print a long help message with examples')
    .action(() => { console.log('snek uses vyper to compile contract, you need to install it with pip first') })

const make = (path) => {
    contracts = vyper.compile(path)
    console.log(contracts)
    return contracts
}

const test = (src_path, test_path) => {
    contracts = make(src_path)
    tests = make(test_path)
    console.log(contracts)
    console.log(tests)
    const provider = new ethers.providers.Web3Provider(ganache.provider())
    console.log(provider)
}

program.parse();
