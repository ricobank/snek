const { resolve } = require('path');

const { Command } = require('commander')
const program = new Command()

const network = require('./src/network.js')
const runner = require('./src/runner.js')
const vyper = require('./src/vyper.js')

program
    .name('snek')
    .description('vyper helper command')
    .option("-o,--output-dir <string>", 'directory to output compiled contracts to', './out')
    .version('0.0.1')

program.command('make')
    .description('compile all vyper contracts in source folder')
    .argument('[src_path]', 'path to vyper file(s) to compile', 'src/')
    .action((src_path) => { make(src_path, program.opts().outputDir, 'Src') })

program.command('test')
    .description('compile and test all vyper contracts in source and test folders')
    .argument('[src_path]', 'path to vyper source file(s) to compile', 'src/')
    .argument('[test_path]', 'path to test files', 'test/')
    .option("-s,--seed <uint32>", 'fuzzing PRNG seed', '0')
    .option("-r,--reps <string>", 'fuzzing repetitions', '1')
    .action((src_path, test_path, options) => {
        test(src_path, test_path, program.opts().outputDir, options.seed, options.reps)
    })

program.addHelpText('after', `
Example calls:
  $ snek make ./test/src --output-dir ./test/out
  $ snek test ./test/src ./test/test --output-dir ./test/out --seed 123 --reps 100`)

const make = (path, output_dir, output_id) => {
    vyper.compile(path, output_dir, output_id)
}

const test = async (src_path, test_path, output_dir, seed, reps) => {
    network.start()
    try {
        make(src_path, output_dir, 'Src')
        make(test_path, output_dir, 'Test')
        make(resolve(__dirname, './snek.vy'), output_dir, 'Snek')
        await network.ready()
        await runner.run(output_dir, seed, reps)
    } catch(e) {
        console.log(e)
    } finally {
        network.exit()
    }
}

program.parse()
