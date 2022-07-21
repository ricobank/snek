const { resolve } = require('path')

const ethers = require('ethers')
const { send } = require('minihat')
const { GLOBAL_TEST_RUNNER, test } = require('tapzero')

const test_prefix = 'test'
const fail_prefix = test_prefix + '_throw'

module.exports = runner = {}

runner.run = async (output_dir, seed, reps, hiss) => {
    const provider = new ethers.providers.JsonRpcProvider()
    const signer = provider.getSigner()
    const multifab_factory = ethers.ContractFactory.fromSolidity(
        require('../lib/multifab/artifacts/core/multifab.sol/Multifab.json'), signer)
    const multifab = await multifab_factory.deploy()
    const src_output = require(resolve(`${output_dir}/SrcOutput.json`))
    const tst_output = require(resolve(`${output_dir}/TestOutput.json`))
    const strip_proto = obj => Object.entries(obj)[0]
    const src_contracts = Object.values(src_output.contracts).map(obj => strip_proto(obj))
    const tst_contracts = Object.values(tst_output.contracts).map(obj => strip_proto(obj))

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

    for ([contract_name, contract] of tst_contracts) {
        const iface = new ethers.utils.Interface(contract.abi)
        const factory = new ethers.ContractFactory(iface, contract.evm.bytecode.object, signer)
        const suite = await factory.deploy(snek.address)
        for (const func of contract.abi) {
            if ('name' in func && func.name.startsWith(test_prefix)) {
                const exec = runner.exec.bind(null, func, suite, reps, snek, hiss, contract_name)
                await test(func.name, exec)
            }
        }
    }

    // let tapzero clear test task queue, otherwise snek will tear down network early
    while (!GLOBAL_TEST_RUNNER.completed) {
        await new Promise(resolve => setTimeout(resolve, 10))
    }
}

runner.exec = async (func, suite, reps, snek, hiss, contract_name, t) => {
    const want_pass = !func.name.startsWith(fail_prefix)
    let error
    try {
        const args = func.inputs.length > 0 ? [suite[func.name], reps] : [suite[func.name]]
        const test_tx = await send(...args, {gasLimit: 100000000})
        runner.scan(test_tx, snek.address, hiss)
    } catch (e) {
        error = e
    }

    if (want_pass === (typeof error === 'undefined')) {
        t.ok(true, `${contract_name}::${func.name}`)
    } else {
        let err_msg = error
        if(typeof error === 'undefined') {
            err_msg = 'No exception'
        }
        t.fail(err_msg)
    }
}

runner.scan = (test_tx, snek_addr, hiss) => {
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
        if (hiss) console.log(`${event.eventSignature}, topics: ${event.topics.slice(1)}, address: ${event.address}`)
    }
    if (sent.length != 0) throw `Missing ${sent[0].event} echo`
}
