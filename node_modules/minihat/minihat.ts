import * as ethers from 'ethers'
import { BigNumber } from 'ethers'
import { BigDecimal } from 'bigdecimal'

export const chai = require('chai')
chai.use(require('chai-as-promised'))
export const want = chai.expect

export const U256_MAX = N(2).pow(N(256)).sub(N(1))
export const BANKYEAR = ((365 * 24) + 6) * 3600

export const WAD = wad(1)
export const RAY = ray(1)
export const RAD = rad(1)

export function N (n: number): BigNumber {
  return ethers.BigNumber.from(n)
}

export function fxp (f: number, p: number) {
  if (p != Math.floor(p) || p < 0) {
    throw new Error('npow: \'p\' must be a natural number')
  }
  const nd = new BigDecimal(f)
  const scale = new BigDecimal(N(10).pow(N(p)).toString())
  const scaled = nd.multiply(scale)
  const rounded = BigNumber.from(scaled.toBigInteger().toString())
  return rounded
}

export function wad (n: number): BigNumber {
  return fxp(n, 18)
}

export function ray (n: number): BigNumber {
  return fxp(n, 27)
}

export function rad (n: number): BigNumber {
  return fxp(n, 45)
}

// Annualized rate to per-second rate, as a ray
export function apy (n: number): BigNumber {
  // apy = spy^YEAR  ==>  spy = root_{BANKYEAR}(apy)
  //                 ==>  spy = apy ^ (1 / YEAR)
  return ray(Math.pow(n, 1 / BANKYEAR))
}

export function b32 (arg: any): Uint8Array {
  if (arg._isBigNumber) {
    const hex = arg.toHexString()
    const buff = Buffer.from(hex.slice(2), 'hex')
    const b32 = ethers.utils.zeroPad(buff, 32)
    return b32
  } else if (typeof (arg) === 'string') {
    const b32 = Buffer.from(arg + '\0'.repeat(32 - arg.length))
    return b32
  } else {
    throw new Error(`b32 takes a BigNumber or string, got ${arg}, a ${typeof (arg)}`)
  }
}

export async function send (...args) {
  const f = args[0]
  const fargs = args.slice(1)
  const tx = await f(...fargs)
  return await tx.wait()
}

export async function fail (...args) {
  const err = args[0]
  const sargs = args.slice(1)
  await want(send(...sargs)).rejectedWith(err)
}

export async function wait (hre, t) {
  await hre.network.provider.request({
    method: 'evm_increaseTime',
    params: [t]
  })
}

export async function warp (hre, t) {
  await hre.network.provider.request({
    method: 'evm_setNextBlockTimestamp',
    params: [t]
  })
}

export async function mine (hre, t = undefined) {
  if (t !== undefined) {
    await wait(hre, t)
  }
  await hre.network.provider.request({
    method: 'evm_mine'
  })
}

let _snap

export async function snapshot (hre) {
  _snap = await hre.network.provider.request({
    method: 'evm_snapshot'
  })
}

export async function revert (hre) {
  await hre.network.provider.request({
    method: 'evm_revert',
    params: [_snap]
  })
  await snapshot(hre)
}

export function hear (receipt, eventName, args = [], data = '0x') {
  let found = receipt.events.some( event => {
    if (event.event != eventName || data != event.data) return false
    return args.every((arg, i) => {
      const cmp = eventName == undefined ? event.topics[i] : event.args[i]
      return typeof arg.eq === 'function' ? arg.eq(cmp) : arg == cmp
    })
  })
  want(found).to.equal(true, `No '${eventName}' events found with args ${args} and data ${data}`);
}
