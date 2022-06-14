const execSync = require('node:child_process').execSync
const process = require('node:process')
const fs = require('fs')

module.exports = vy = {}

vy.compile = (path, outputDir) => {
    try {
        console.log(`Compiling contracts in ${path} to ${outputDir}`)
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
        if (fs.lstatSync(path).isFile()) execSync(`vyper -f abi,bytecode ${path} -o ${outputDir}/${path.split("/").slice(-1)}.snek`, { encoding: 'utf8' })
        if (fs.lstatSync(path).isDirectory()) fs.readdirSync(path).filter((c) => c.endsWith('.vy')).forEach((c) => {
                execSync(`vyper -f abi,bytecode ${path}/${c} -o ${outputDir}/${c.split("/").slice(-1)}.snek`, { encoding: 'utf8' })
        })
        else {
            console.error(`Invalid path ${path}. Path to contracts must be file or directory.`)
        }
    } catch (err) {
        const { status, stderr } = err;
        if (status > 0 || (stderr && stderr.toLowerCase().includes('warning'))) {
            console.error('Failed due to:');
            console.error(stderr);
            process.exit(1);
        }
    }
}
