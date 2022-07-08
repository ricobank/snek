const fs = require('fs')
const { want, send } = require('minihat');
const dpack = require('@etherpacks/dpack')
const ethers = require('ethers');
const ganache = require("ganache")
const vyper = require('../../src/vyper.js');

const dir = `${__dirname}/SnekTest`
let snek
let multifab
let signer

describe('test snek', () => {
    before(async() => {
        vyper.compile('snek.vy', dir, 'Snek')
        const provider = new ethers.providers.Web3Provider(ganache.provider())
        signer = provider.getSigner()
        const multifab_pack = require('../../lib/multifab/pack/multifab_hardhat.dpack.json')
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
        await snek._bind(test_type, test_hash)
        want(await snek.types(test_type)).to.eql(test_hash)
    })

    it('should be able to make an object', async() => {
        vyper.compile('test/src/Person.vy', dir, 'Person')
        const person_output = require(`${dir}/PersonOutput.json`)
        const person_contract = Object.values(person_output.contracts)[0]['Person']
        const cache_tx = await send(multifab.cache, person_contract.evm.bytecode.object);
        const [, person_hash] = cache_tx.events.find(event => event.event === 'Added').args
        await snek._bind('Person', person_hash)
        want(await snek.types('Person')).to.eql(person_hash)

        const person_args = ethers.utils.defaultAbiCoder.encode(['string', 'string', 'uint256'], ["Rico", "Bank", 2022])
        await send(snek.make, 'Person', 'person1', person_args)
        const person_address = await snek.objects('person1')
        const person = new ethers.Contract(person_address, person_contract.abi, signer)
        want(await person.name()).to.eql("Rico")
        want(await person.last()).to.eql("Bank")
        want(parseInt(await person.year())).to.eql(2022)
    })

    after(() => {
        fs.rmSync(dir, {recursive: true, force: true})
    })
})