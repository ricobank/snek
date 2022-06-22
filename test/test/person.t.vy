interface Snek:
    def make(typename: String[32], objectname: String[32], args: Bytes[3200]) -> address: nonpayable
    def echo(target: address): nonpayable
    def rand(set: uint256) -> uint256: nonpayable


interface Person:
    def set_name(_name: String[32]): nonpayable
    def set_year(_year: uint256): nonpayable
    def draw(amt: uint256): nonpayable
    def wipe(amt: uint256): nonpayable
    def shop(amt: uint256): nonpayable
    def name() -> String[32]: view
    def year() -> uint256: view
    def debt() -> uint256: view
    def cash() -> uint256: view
    def toys() -> uint256: view


MAX_REPS: constant(uint256) = 1000
MAX_DRAW: constant(uint256) = 1000

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


@external
def test_fuzz():  # (reps: uint256)
    reps: uint256 = 100  # could be input param
    for i in range(MAX_REPS):
        if i > reps:
            break
        opt: uint256 = self.snek.rand(3)
        if opt == 0:
            self.prs1.draw(self.snek.rand(MAX_DRAW))
        elif opt == 1:
            self.prs1.wipe(self.snek.rand(self.prs1.cash() + 1))
        elif opt == 2:
            self.prs1.shop(self.snek.rand(self.prs1.cash() + 1))
        
        assert self.prs1.debt() == self.prs1.cash() + self.prs1.toys()
