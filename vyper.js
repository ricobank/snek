const execSync = require('node:child_process').execSync
const process = require('node:process')

module.exports = vy = {}

vy.compile = (build_test) => {
    try {
        const stdout = execSync(`vyper -f abi,bytecode FILES_PATTERN_TODO`, { encoding: 'utf8' })
        console.log(stdout)
    } catch (err) {
        const { status, stderr } = err;
        if (status > 0 || (stderr && stderr.toLowerCase().includes('warning'))) {
            console.error('Failed due to:');
            console.error(stderr);
            process.exit(1);
        }
    }
}
