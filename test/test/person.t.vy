interface Snek:
    def make(typename: String[32], objectname: String[32], args: Bytes[3200]) -> address: nonpayable
    def echo(target: address): nonpayable


interface Person:
    def set_name(_name: String[32]): nonpayable
    def set_year(_year: uint256): nonpayable
    def name() -> String[32]: view
    def year() -> uint256: view


event Birth:
    date: indexed(uint256)


event Alias:
    nick: indexed(String[32])


prs1: public(Person)
prs2: public(Person)
snek: public(Snek)


@external
def __init__(_snek : Snek):
    self.snek = _snek
    name: String[32] = 'ali'
    last: String[32] = 'bob'
    year: uint256 = 10
    args: Bytes[224] = _abi_encode(name, last, year)
    self.prs1 = Person(self.snek.make('Person', 'person1', args))
    self.prs2 = Person(self.snek.make('Person', 'person2', args))


@external
def test_name():
    assert self.prs1.name() == 'ali'


@external
def test_set_name():
    self.prs1.set_name('cat')
    assert self.prs1.name() == 'cat'


@external
def test_year():
    assert self.prs1.year() == 10


@external
def test_set_year():
    self.snek.echo(self.prs1.address)
    log Birth(20)
    self.prs1.set_year(20)
    assert self.prs1.year() == 20


@external
def test_events():
    self.snek.echo(self.prs1.address)
    log Birth(20)
    log Birth(30)
    log Alias('dan')
    self.prs1.set_year(20)
    self.prs1.set_year(30)
    self.prs1.set_name('dan')
    self.snek.echo(self.prs2.address)
    log Birth(40)
    log Birth(50)
    log Alias('eli')
    self.prs2.set_year(40)
    self.prs2.set_year(50)
    self.prs2.set_name('eli')
