const fs = require('fs')
const { want } = require('minihat');
const dpack = require('@etherpacks/dpack')
const ethers = require('ethers');
const ganache = require("ganache")
const vyper = require('../../src/vyper.js');

const dir = `${__dirname}/SnekTest`
let snek
let multifab

describe('test snek', () => {
    before(async() => {
        vyper.compile('snek.vy', dir, 'Snek')
        const provider = new ethers.providers.Web3Provider(ganache.provider())
        const signer = provider.getSigner()
        const multifab_pack = require('../../lib/multifab/pack/multifab_full_hardhat.dpack.json')
        const dapp = await dpack.load(multifab_pack, ethers, signer)
        multifab = await dapp._types.Multifab.deploy()

        const snek_output = require(`${dir}/SnekOutput.json`)
        const snek_contract = Object.values(snek_output.contracts)[0]['snek']
        const snek_factory = new ethers.ContractFactory(new ethers.utils.Interface(snek_contract.abi),
                                                    snek_contract.evm.bytecode.object, signer)

        snek = await snek_factory.deploy(multifab.address)

    })

    it('should bind hash correctly', async() => {
        const test_type = "test_type"
        const test_hash = ethers.utils.formatBytes32String("testhash")
        await snek.bind(test_type, test_hash)
        want(await snek.types(test_type)).to.eql(test_hash)
    })

    after(() => {
        fs.rmSync(dir, {recursive: true, force: true})
    })
})