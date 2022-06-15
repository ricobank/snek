const execSync = require('node:child_process').execSync
const process = require('node:process')
const fs = require('fs')

module.exports = vy = {}

vy._generate_json = (files, path, outputDir, id) => {
    const project = {
        "language": "Vyper",
        "sources": {
        },
        "interfaces": {
        },
        "settings": {
            "optimize": true,
            "outputSelection": {
                "*": ["evm.bytecode", "abi"]
            }
        }
    }

    for( const file of files ) {
        if (!file.endsWith('.vy')) continue
        const content = fs.readFileSync(`${path}/${file}`, {encoding: 'utf-8'})
        project['sources'][`${path}/${file}`] = {'content': content}
    }

    const show =(o)=> JSON.stringify(o, null, 2)
    fs.writeFileSync(outputDir + `/${id}Input.json`, show(project))
}

vy.compile = (path, outputDir, isSrc) => {
    console.log(`Compiling contracts in ${path} to ${outputDir}`)
    const files = []
    const id = isSrc ? 'Src' : 'Test'
    try {
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
        if (fs.lstatSync(path).isFile()) files.push(path)
        else if (fs.lstatSync(path).isDirectory()) files.push(...(fs.readdirSync(path)))
        else throw `Invalid path ${path}. Path to contracts must be file or directory.`

        vy._generate_json(files, path, outputDir, id)
        execSync(`vyper-json ${outputDir}/${id}Input.json -o ${outputDir}/${id}Output.json`, {encoding: 'utf-8'})
    } catch (err) {
        const { status, stderr } = err;
        if (status > 0 || (stderr && stderr.toLowerCase().includes('warning'))) {
            console.error('Failed due to:');
            console.error(stderr);
            process.exit(1);
        }
    }
}