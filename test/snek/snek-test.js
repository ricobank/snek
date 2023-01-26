const { send } = require('minihat')
const ethers = require('ethers')

const bp = require('../../lib/multifab/utils/blueprint.js')
const vyper = require('../../src/vyper.js')
const TestHarness = require('./test-harness')

TestHarness.test('should bind address correctly', async (harness, assert) => {
    const test_type = "test_type"
    await harness.snek._bind(test_type, harness.multifab.address)
    assert.equal(await harness.snek.types(test_type), harness.multifab.address)
})

TestHarness.test('should be able to make an object', async (harness, assert) => {
    vyper.compile('test/src/Person.vy', harness.dir, 'Person')
    const person_output = require(`${harness.dir}/PersonOutput.json`)
    const person_data = Object.values(person_output.contracts)[0]['Person']
    const blueprint = bp.generate(person_data.evm.bytecode.object)
    const factory = new ethers.ContractFactory([], blueprint, harness.signer)
    const contract = await factory.deploy({gasLimit: 100000000})
    await send(harness.snek._bind, 'Person', contract.address)
    assert.equal(await harness.snek.types('Person'), contract.address)

    const person_args = ethers.utils.defaultAbiCoder.encode(['string', 'string', 'uint256'], ["Rico", "Bank", 2022])
    const receipt = await send(harness.snek.make, 'Person', person_args)
    const [, , , person_address] = receipt.events.find(event => event.address === harness.multifab.address).topics
    const person = new ethers.Contract('0x' + person_address.slice(2 + 12*2), person_data.abi, harness.signer)
    assert.equal(await person.name(), "Rico")
    assert.equal(await person.last(), "Bank")
    assert.equal(parseInt(await person.year()), 2022)
})
