// SPDX-License-Identifier: MIT

const fs = require('fs')

const ethers = require('ethers')
const tapzero = require('tapzero');
const testHarness = require('tapzero/harness');

const network = require("../../src/network");
const vyper = require("../../src/vyper");

const vars = {raw: true}

class TestHarness {
    async bootstrap() {
        if (vars.raw) {
            network.start()
            vars.dir = `${__dirname}/SnekTest`
            const provider = new ethers.providers.JsonRpcProvider()
            vars.signer = provider.getSigner()

            vyper.compile('snek.vy', vars.dir, 'Snek')
            const snek_output = require(`${vars.dir}/SnekOutput.json`)
            const snek_contract = Object.values(snek_output.contracts)[0]['snek']
            const snek_factory = new ethers.ContractFactory(
                snek_contract.abi, snek_contract.evm.bytecode.object, vars.signer)

            const mf_src_output = require(`../../lib/multifab/out/SrcOutput.json`)
            const mf_contract = mf_src_output.contracts["src/Multifab.vy"].Multifab
            const mf_factory = new ethers.ContractFactory(mf_contract.abi, mf_contract.evm.bytecode.object, vars.signer)

            await network.ready()
            vars.multifab = await mf_factory.deploy()
            vars.snek = await snek_factory.deploy(vars.multifab.address, Buffer.alloc(32))
            vars.raw = false
        }
        Object.assign(this, vars)
    }

    async close() {
        setTimeout(() => {
            if (tapzero.GLOBAL_TEST_RUNNER.completed) {
                fs.rmSync(this.dir, {recursive: true, force: true})
                network.exit()
            }
        }, 0)
    }
}

TestHarness.test = testHarness(tapzero, TestHarness)
module.exports = TestHarness
