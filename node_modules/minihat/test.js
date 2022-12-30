const mh = { wad, apy, want, send, N } = require('.');

describe('hhs', async ()=>{
  it('meta', async()=>{
    want(true).true;
    want(false).false;
  });
  it('N', async()=>{
    const n10 = N(10);
    want(n10._isBigNumber).true;
  });
  it('wad', () => {
    want(mh.WAD.toString()).equals('1' + '0'.repeat(18));
    const a = wad(1)
    want(a.toString()).equals('1' + '0'.repeat(18))
    const b = wad(2.5)
    want(b.toString()).equals('25' + '0'.repeat(17))
  })
  it('apy', () => {
    const apy0 = apy(1.05)
    want(apy0.gt(mh.RAY));
    want(apy0.lt(mh.ray(1.00000001)));
  })

});
