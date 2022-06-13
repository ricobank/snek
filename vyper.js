const execSync = require('node:child_process').execSync
const process = require('node:process')

module.exports = vy = {}
const outs = []

vy.compile = (path, build_test=false) => {
    try {
        const stdout = execSync(`vyper -f abi,bytecode ${path}`, { encoding: 'utf8' })
        compilation_results = stdout.split("\n").slice(0, -1).forEach((element, index, array) => {
            if (index % 2 == 0) outs.push({abi: element, bytecode: array[index+1]})
        });
        console.log(outs)
    } catch (err) {
        const { status, stderr } = err;
        if (status > 0 || (stderr && stderr.toLowerCase().includes('warning'))) {
            console.error('Failed due to:');
            console.error(stderr);
            process.exit(1);
        }
    }
}
