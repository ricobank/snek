const execSync = require('node:child_process').execSync
const process = require('node:process')
const fs = require('fs')
const path = require('path');

module.exports = vy = {}

vy._generate_json = (files, outputDir, id) => {
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
        const content = fs.readFileSync(file, {encoding: 'utf-8'})
        project['sources'][file] = {'content': content}
    }
    const show =(o)=> JSON.stringify(o, null, 2)
    fs.writeFileSync(outputDir + `/${id}Input.json`, show(project))
}

vy._find_sources = (dir) => {
    let files = []
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
        if (item.isDirectory()) {
            files.push(...vy._find_sources(path.join(dir, item.name)))
        } else {
            files.push(path.join(dir, item.name))
        }
    }
    return files.filter(file => file.endsWith('.vy'))
}

vy.compile = (path, outputDir, outputId) => {
    const files = []
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

    if (fs.lstatSync(path).isFile()) files.push(path)
    else if (fs.lstatSync(path).isDirectory()) files.push(...vy._find_sources(path))
    else throw `Invalid path ${path}. Path to contracts must be file or directory.`

    vy._generate_json(files, outputDir, outputId)
    const std_out = execSync(`vyper-json ${outputDir}/${outputId}Input.json -o ${outputDir}/${outputId}Output.json`,
                             {encoding: 'utf-8'})
    if (!std_out.startsWith('Results saved to ')) throw `vyper compile failed: ${std_out}`
    const out_path = std_out.split(' ').pop().trim()
    const output = JSON.parse(fs.readFileSync(out_path, {encoding: 'utf-8'}))
    if ('errors' in output) {
        for (const error of output.errors) {
            console.log(`${error.type} error compiling with ${output.compiler}:`)
            console.log(error.formattedMessage)
        }
        process.exit(1);
    }
    console.log(`Successfully compiled .vy contracts in ${path}. ${std_out.trim()}`)
}
