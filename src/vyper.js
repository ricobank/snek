const execSync = require('node:child_process').execSync
const process = require('node:process')
const fs = require('fs')
const chalk = require("chalk")

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
    const isdir = fs.lstatSync(path).isDirectory()
    for( const file of files ) {
        if (!file.endsWith('.vy')) continue
        const src_path = isdir ? `${path}/${file}` : file
        const content = fs.readFileSync(src_path, {encoding: 'utf-8'})
        project['sources'][src_path] = {'content': content}
    }
    const show =(o)=> JSON.stringify(o, null, 2)
    fs.writeFileSync(outputDir + `/${id}Input.json`, show(project))
}

vy.compile = (path, outputDir, outputId) => {
    const files = []
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

    if (fs.lstatSync(path).isFile()) files.push(path)
    else if (fs.lstatSync(path).isDirectory()) files.push(...(fs.readdirSync(path)))
    else throw `Invalid path ${path}. Path to contracts must be file or directory.`

    vy._generate_json(files, path, outputDir, outputId)
    const std_out = execSync(`vyper-json ${outputDir}/${outputId}Input.json -o ${outputDir}/${outputId}Output.json`,
                             {encoding: 'utf-8'})
    if (!std_out.startsWith('Results saved to ')) throw `vyper compile failed: ${std_out}`
    const out_path = std_out.split(' ').pop().trim()
    const output = JSON.parse(fs.readFileSync(out_path, {encoding: 'utf-8'}))
    if ('errors' in output) {
        for (const error of output.errors) {
            console.log(chalk.red(`${error.type} error compiling with ${output.compiler}:`))
            console.log(error.formattedMessage)
        }
        process.exit(1);
    }
    console.log(`Successfully compiled .vy contracts in ${path}. ${std_out}`)
}
