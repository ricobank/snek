const { spawn } = require('node:child_process')
const process = require("node:process")

module.exports = network = {}

network.pending = true

network.start = () => {
    network.anvil = spawn('anvil', ['--gas-limit', '1000000000000', '--base-fee', '0'], {'detached': false})
    network.anvil.stdout.on('data', network._stdout)
    network.anvil.stderr.on('data', network._stderr)
}

network._stdout = (data) => {
    if (network.pending
        && data
        && data.toString().includes("Listening on")) {
        network.pending = false
    }
}

network._stderr = (data) => {
    if (data.toString().includes("Address already in use")) {
        network.pending = false
    } else {
        console.log(data.toString())
    }
}

network.ready = async () => {
    for (let i = 0; i < 100; i++) {
        if (network.pending) {
            await new Promise(resolve => setTimeout(resolve, 5))
        } else {
            return
        }
    }
}

network.exit = () => {
    network.anvil.kill()
    process.exit(0)
}
