# snek
## the tiny vyper helper command

snek is concise tool for efficient development of Vyper dapps. Tests are Vyper contracts run on an Anvil node for
very quick test runs. snek test contracts can interact with all other source contracts, assert events are logged
correctly, and test invariants with very fast fuzzing. 

## installation

snek runs [Vyper](https://vyper.readthedocs.io/en/latest/installing-vyper.html) and
[Anvil](https://github.com/foundry-rs/foundry/tree/master/anvil) as subprocesses and both need to be installed and
added to your path for snek to run.

For now snek can be run from source by running index.js directly with node.js, or run from binaries.
To build, first clone this repo, $ npm run initialize, $ npm run build-general.
The snek executable generated should then be placed somewhere on your path. If using linux you can use
$ npm build-linux to install the executable in /usr/bin/local. Binaries are currently not served anywhere.

## usage

### commands
'$ snek make' compiles all Vyper contracts using vyper-json, and stores the results as files. Paths can be configured
with command line arguments and will otherwise default to searching for contracts in ./src and saving the output to  
./out.

'$ snek test' performs the above, and in addition also compiles all test contracts and runs all methods in every
test contract which start with 'test'. Methods starting with 'test_throw' will pass in a snek test iff an exception is
thrown. The path for test files can be configured and is ./test by default.

To view help for snek or any subcommand run the command with the --help option.
```
Usage: snek [options] [command]

vyper helper command

Options:
  -o,--output-dir <string>               directory to output compiled contracts to (default: "./out")
  -V, --version                          output the version number
  -h, --help                             display help for command

Commands:
  make [src_path]                        compile all vyper contracts in source folder
  test [options] [src_path] [test_path]  compile and test all vyper contracts in source and test folders
  help [command]                         display help for command

Examples:

- compiles all vyper files in ./src and stores the json output at ./out  
  $ snek make
  
- compiles all vyper files in ./src and ./test, stores the json output at ./out, runs all tests in ./test with seed = 0 and reps = 1  
  $ snek test
    
- compiles all vyper files in ./test/src and ./test/test, stores the json output at ./test/out  
  $ snek make ./test/src --output-dir ./test/out

- compiles all vyper files in ./test/src and ./test/test, stores the json output at ./test/out, runs all tests in ./test/test with seed = 123 and reps = 1000
  $ snek test ./test/src ./test/test --output-dir ./test/out --seed 123 --reps 1000
```

### networks
When running snek you do not have to consider networks, snek will start up a test network for you. If you prefer
to run another network yourself you can by starting it up before invoking snek. If http://127.0.0.1:8545 is already
bound then snek will continue with tests and use the existing network. This allows using something like hardhat node to
view Vyper print() statements which work the same as hardhats console.log(), or using ganache if you want to inspect
via GUI. Benchmarking has shown snek tests with anvil are hundreds of times faster.

### example
Here we explain the most important parts of a snek test. There is also a full [working example](test/test/person.t.vy). 

---
First include an interface to snek.
```python
interface Snek:
    def make(typename: String[32], objectname: String[32], args: Bytes[3200]) -> address: nonpayable
    def echo(target: address): nonpayable
    def rand(set: uint256) -> uint256: nonpayable
``` 
make is used to deploy instances of any other source contracts you want tests to interact with  
echo is used to set the events to expect from the target contract, and can be repeated to retarget  
rand gets the next pseudo random number to enable fuzz tests with random actions and values
---
A snek instance is passed into each test contracts init method and should be stored as a test member.
```python
def __init__(_snek: Snek):
    self.snek = _snek
    name: String[32] = 'ali'
    year: uint256 = 10
    args: Bytes[224] = _abi_encode(name, year)
    self.prs1 = Person(self.snek.make('Person', 'person1', args))
``` 
snek contains a multifab instance which snek.vy uses in make() to deploy any other source contracts. The first arg
specifies which contract to create, and the arguments for that contracts constructor are passed as the third parameter.
---
Methods beginning with 'test' will be run by the test harness.
```python
@external
def test_set_year():
    self.snek.echo(self.prs1.address)
    log Birth(20)
    self.prs1.set_year(20)
    assert self.prs1.year() == 20
```
This test sets values in a Person and uses vypers assert function to test the behaviour is correct. snek.echo(target)
tests that the target contract echos back the same events as the test contract logs. After echo() the test runner
records everything logged by the test for the current target and asserts that the target later emits the same events in
the same order. Extra events from the target do not cause a failure and the target can be changed to
queue up multiple sets of required events.
---
snek can also be used to fuzz and test invariants.
```python
@external
def test_fuzz(reps: uint256):
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
```
Test methods can optionally require on parameter, reps, intended to help with fuzz tests. The value passed to the test
is the value of the snek command line option -r or --reps. Fuzz tests can use the snek method rand() which returns a
random uint256, and the PRNG is seeded with the command line option -s or --seed which defaults to zero.
