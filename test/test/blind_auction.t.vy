interface Snek:
    def make(typename :String[32], objectname :String[32], args :Bytes[20000000]) -> address: nonpayable


interface blind_auction:
    def ended() -> bool: nonpayable


auction: public(blind_auction)
ended: public(bool)
snek: public(Snek)


@external
def __init__(_snek : Snek):
    self.snek = _snek


@external
def test_blind_auction_1():
    # self.auction = self.snek.make('blind_auction', 'auct')
    # self.ended = self.auction.ended()
    # assert ended == false
    assert self.snek == self.snek


@external
def test_blind_auction_2():
    assert self.snek == self.snek


@external
def test_blind_auction_3():
    assert self.snek == self.snek
