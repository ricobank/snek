const { resolve } = require('path');
const dpack = require('@etherpacks/dpack')
const ethers = require('ethers');
const ganache = require("ganache")
const { send } = require('minihat')
module.exports = runner = {}

runner.run = async (output_dir) => {
    const provider = new ethers.providers.Web3Provider(ganache.provider())
    const signer = provider.getSigner()
    const multifab_pack = require('../lib/multifab/pack/multifab_full_hardhat.dpack.json')
    const dapp = await dpack.load(multifab_pack, ethers, signer)
    const multifab = await dapp._types.Multifab.deploy()
    const abs_path = resolve(`${output_dir}/SrcOutput.json`);
    const src_output = require(abs_path)
    const src_contracts = Object.values(src_output.contracts)
    const deploy_info = {}
    // not forEach because need to have all promises resolve
    for (contract of src_contracts) {
        const contract_name = Object.keys(contract)[0]
        const bytecode = contract[contract_name].evm.bytecode.object
        const cache_tx = await send(multifab.cache, bytecode);
        [,codehash] = cache_tx.events.find(event => event.event === 'Added').args
        deploy_info[contract_name] = { codehash: codehash}
    }
    console.log(deploy_info)
}
