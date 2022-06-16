const { want } = require('minihat');
const vyper = require('../../src/vyper.js');
const fs = require('fs')

const dir = `${__dirname}/SnekTest`


describe('test snek', () => {
    before(() => {
        vyper.compile('snek.vy', dir, 'Snek')
    })
    it('test should pass', async() => {
        want("snek").to.eql("snek")
    })

    after(() => {
        fs.rmSync(dir, {recursive: true, force: true})
    })
})