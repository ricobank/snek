const { resolve } = require('path')

const dpack = require('@etherpacks/dpack')
const chalk = require('chalk')
const ethers = require('ethers')
const { send } = require('minihat')

module.exports = runner = {}

runner.run = async (output_dir, seed, reps) => {
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = provider.getSigner()
    const multifab_pack = require('../lib/multifab/pack/multifab_hardhat.dpack.json')
    const dapp = await dpack.load(multifab_pack, ethers, signer)
    const multifab = await dapp._types.Multifab.deploy()
    const src_output = require(resolve(`${output_dir}/SrcOutput.json`))
    const tst_output = require(resolve(`${output_dir}/TestOutput.json`))
    const strip_proto = obj => Object.entries(obj)[0]
    const src_contracts = Object.values(src_output.contracts).map(obj => strip_proto(obj))
    const tst_contracts = Object.values(tst_output.contracts).map(obj => strip_proto(obj))

    // Deploy Snek (should we just do this via multifab?)
    const buff = Buffer.alloc(32)
    buff.writeUInt32BE(seed, 0)
    const snek_output = require(resolve(`${output_dir}/SnekOutput.json`))
    const snek_contract = Object.values(snek_output.contracts)[0]['snek']
    const snek_interface = new ethers.utils.Interface(snek_contract.abi)
    const snek_factory = new ethers.ContractFactory(snek_interface, snek_contract.evm.bytecode.object, signer)
    const snek = await snek_factory.deploy(multifab.address, buff)

    for ([contract_name, contract] of src_contracts) {
        const cache_tx = await send(multifab.cache, contract.evm.bytecode.object);
        [,codehash] = cache_tx.events.find(event => event.event === 'Added').args
        await send(snek._bind, contract_name, codehash)
    }

    let ran = 0
    let passed = 0
    for ([contract_name, contract] of tst_contracts) {
        const iface = new ethers.utils.Interface(contract.abi)
        const factory = new ethers.ContractFactory(iface, contract.evm.bytecode.object, signer)
        const test = await factory.deploy(snek.address)
        for (const func of contract.abi) {
            if ('name' in func && func.name.startsWith('test')) {
                try {
                    ran++
                    const args = func.inputs.length > 0 ? [test[func.name], reps] : [test[func.name]]
                    const test_tx = await send(...args)
                    runner.scan(test_tx, snek.address)
                    passed++
                    console.log(`${contract_name}::${func.name} ${chalk.green('PASSED')}`)
                } catch (e) {
                    console.log(`${contract_name}::${func.name} ${chalk.red('FAILED')}`,)
                    console.error(e)
                }
            }
        }
    }
    const format = ran === passed ? chalk.green : chalk.red
    console.log(`Passed ${format(`${passed}/${ran}`)}`)
}

runner.scan = (test_tx, snek_addr) => {
    const sent = []
    const addr_eq =(a1, a2)=> a1.slice(-40).toLowerCase() === a2.slice(-40).toLowerCase()
    let target = "0"
    for (const event of test_tx.events) {
        if (addr_eq(event.address, snek_addr)) {
            if (sent.length != 0) throw `Missing ${sent[0].event} echo`
            target = event.topics[1]
        } else if (addr_eq(event.address, test_tx.to)
                   && !addr_eq(target, "0")) {
            sent.push(event)
        } else if (addr_eq(event.address, target)
                   && sent.length > 0) {
            if (event.topics.join() == sent[0].topics.join()) {
                sent.shift()
            }
        }
    }
    if (sent.length != 0) throw `Missing ${sent[0].event} echo`
}
