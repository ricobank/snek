interface Snek:
    def make() -> address: nonpayable


snek: public(Snek)


@external
def __init__(_snek : Snek):
  self.snek = _snek


@external
def testSize():
  assert self.snek == self.snek
