
interface Multifab
    def add(bytes code) -> bytes32:
        pass
    def new(bytes32 hash) -> address:
        pass

interface Snek:
    """ Snek: API for `snek` test object.
        This object gets passed to vyper `.t.vy` test contract
        constructors when they are deployed. The test framework
        initializes it with a multifab that is pre-populated
        with all compiled contract types. Then you can use
        it like this:

        def __init__(snek):
            coin = snek.new('Coin', 'rico')

        import log_mint as Mint  # import any event you want to test
        def testMint(snek):
            coin = snek.get('rico')
            bal  = coin.balanceOf(self)
            snek.okay(bal == 0, 'initial balance is zero')
            snek.echo()
            emit Mint(this, 100)
            coin.mint(this, 100)
            bal = coin.balanceOf(self)
            snek.okeq(bal, 100, 'self balance after mint(self, 100) is 100')
    """

    def __init__(fab : Multifab)
        pass

    def _bind(typename : string, bytes32 codehash):
        pass

    # vyper doesn't have create yet, but that's ok,
    # maybe it is better to use a single factory anyway
    def new(string typename, string objectname) -> address:
        pass
    def get(string objectname) -> address:
        pass

    def echo(target: address, n : uint):
        """assert next N events from this target are same as this contract"""
        pass
    def echo(target: address):
        pass

    # codegen a bunch of overloads for assert types
    def okay(what : bool, why : string)
        pass
    def okeq(a:uint, b:uint, why:string)
        pass
    def oklt(a:uint, b:uint, why:string)
        pass
    # and so on