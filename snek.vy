"""
    snek: the tiny vyper helper contract

    This object gets passed to vyper `.t.vy` test contract
    constructors when they are deployed. The test framework
    initializes it with a multifab that is pre-populated
    with all compiled contract types. Then you can use
    it like this:

    def __init__(snek):
        self.coin = snek.make('Coin', 'rico')

    import log_mint as Mint  # import any event you want to test

    def testMint(snek):
        bal  = self.coin.balanceOf(self)
        assert bal == 0, 'initial balance is zero'  # use native assert for assert
        snek.echo()                                 # use `echo` to test events
        log Mint(this, 100)
        coin.mint(this, 100)
        bal = coin.balanceOf(self)
        assert bal == 100, 'self balance after mint(self, 100) is not 100'
"""

# https://github.com/ricobank/multifab
interface Multifab:
    def cache(code: Bytes[20000000]) -> bytes32:  # max size, typed as `bytes` in ABI
        nonpayable
    def build(hash: bytes32, args :Bytes[20000000]) -> address:
        nonpayable

event Echo:
    target: indexed(address)

fab: Multifab
types: public(HashMap[String[32], bytes32])
seed: bytes32

@external
def __init__(fab: address, seed: bytes32):
    """ fab is a multifab initialized with types from this snek project """
    self.fab = Multifab(fab)
    self.seed = seed

@external
def _bind(typename: String[32], _hash: bytes32):
    """ _bind is called by this test framework to associate typenames with
        codehashes so that `snek.make` can use a string typename
    """
    self.types[typename] = _hash

@external
def make(typename: String[32], args: Bytes[3200]) -> address:
    """ make calls `fab.build` with the right codehash based on typename,
        then it saves the object with the given objectname for reference
    """
    type_hash: bytes32 = self.types[typename]
    assert type_hash != empty(bytes32), 'unknown type'
    _object: address = self.fab.build(type_hash, args)
    assert _object != empty(address), 'failed to make type'
    return _object

@external
def echo(target: address):
    """ assert next events from this contract are prefix of next events from target
	    in other words:

        echo(target)
		Mint()
		Burn()
		target.mintburn()

        will assert that the first 2 events fired from target will be Mint and Burn
	"""
    log Echo(target)

@external
def rand(end: uint256) -> uint256:
    self.seed = keccak256(self.seed)
    return convert(self.seed, uint256) % end
