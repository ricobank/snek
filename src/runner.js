const dpack = require('@etherpacks/dpack')
const ethers = require('ethers');
const ganache = require("ganache")
module.exports = runner = {}

runner.run = async () => {
    const provider = new ethers.providers.Web3Provider(ganache.provider())
    const signer = provider.getSigner()
    const multifab_pack = require('../lib/multifab/pack/multifab_full_hardhat.dpack.json')
    const dapp = await dpack.load(multifab_pack, ethers, signer)
    const multifab = await dapp._types.Multifab.deploy()
    console.log(multifab)
}
