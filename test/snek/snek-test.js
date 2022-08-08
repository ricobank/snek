const { send } = require('minihat')
const ethers = require('ethers')
const vyper = require('../../src/vyper.js')
const TestHarness = require('./test-harness')

TestHarness.test('should bind hash correctly', async (harness, assert) => {
    const test_type = "test_type"
    const test_hash = ethers.utils.formatBytes32String("testhash")
    await harness.snek._bind(test_type, test_hash)
    assert.equal(await harness.snek.types(test_type), test_hash)
})

TestHarness.test('should be able to make an object', async (harness, assert) => {
    vyper.compile('test/src/Person.vy', harness.dir, 'Person')
    const person_output = require(`${harness.dir}/PersonOutput.json`)
    const person_contract = Object.values(person_output.contracts)[0]['Person']
    const cache_tx = await send(harness.multifab.cache, person_contract.evm.bytecode.object)
    const [, person_hash] = cache_tx.events.find(event => event.event === 'Added').args
    await harness.snek._bind('Person', person_hash)
    assert.equal(await harness.snek.types('Person'), person_hash)

    const person_args = ethers.utils.defaultAbiCoder.encode(['string', 'string', 'uint256'], ["Rico", "Bank", 2022])
    const receipt = await send(harness.snek.make, 'Person', person_args)
    const [, , person_address ] = receipt.events.find(event => event.address === harness.multifab.address).topics
    const person = new ethers.Contract('0x' + person_address.slice(2 + 12*2), person_contract.abi, harness.signer)
    assert.equal(await person.name(), "Rico")
    assert.equal(await person.last(), "Bank")
    assert.equal(parseInt(await person.year()), 2022)
})
