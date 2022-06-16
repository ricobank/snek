const { resolve } = require('path');
const { Command } = require('commander')
const program = new Command()

const vyper = require('./src/vyper.js')
const runner = require('./src/runner.js')

program
    .name('snek')
    .description('vyper helper command')
    .option("-o,--output-dir <string>", 'directory to output compiled contracts to', './out')
    .version('0.0.1')

program.command('make')
    .description('compile all vyper contracts in source folder')
    .argument('[src_path]', 'path to vyper file(s) to compile', 'src/')
    .action((src_path) => { make(src_path, program.opts().outputDir) })

program.command('test')
    .description('compile and test all vyper contracts in source and test folders')
    .argument('[src_path]', 'path to vyper source file(s) to compile', 'src/')
    .argument('[test_path]', 'path to test files', 'test/')
    .action((src_path, test_path) => { test(src_path, test_path, program.opts().outputDir) })

program.command('help')
    .description('print a long help message with examples')
    .action(() => { console.log('snek uses vyper to compile contracts, you need to install it with pip first') })

const make = (path, output_dir, output_id) => {
    vyper.compile(path, output_dir, output_id)
}

const test = (src_path, test_path, output_dir) => {
    make(src_path, output_dir, 'Src')
    make(test_path, output_dir, 'Test')
    // TODO: !DMFXYZ! should the user be able to provide a custom snek.vy?
    make(resolve(__dirname, './snek.vy'), output_dir, 'Snek')
    runner.run(output_dir)
}

program.parse();
