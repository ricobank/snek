interface Snek:
    def make(typename: String[32], objectname: String[32], args: Bytes[20000000]) -> address: nonpayable


interface Person:
    def set_name(_name: String[32]): nonpayable
    def set_year(_year: uint256): nonpayable
    def name() -> String[32]: view
    def last() -> String[32]: view
    def year() -> uint256: view


pers: public(Person)
snek: public(Snek)


@external
def __init__(_snek : Snek):
    self.snek = _snek
    name: String[32] = 'ali'
    last: String[32] = 'bob'
    year: uint256 = 10
    args: Bytes[224] = _abi_encode(name, last, year)
    self.pers = Person(self.snek.make('Person', 'person', args))


@external
def test_name():
    assert self.pers.name() == 'ali'


@external
def test_set_name():
    self.pers.set_name('cat')
    assert self.pers.name() == 'cat'


@external
def test_year():
    assert self.pers.year() == 10


@external
def test_set_year():
    self.pers.set_year(20)
    assert self.pers.year() == 20
