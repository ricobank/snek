# snek
## the tiny vyper helper command


```
snek make
  compile all vyper contracts in source folder,
snek test
  compile and test all vyper contracts in source and test folders
```


### Plan of attack

```
snek test
  we want test contracts to work like this:

      def __init__(snek : Snek):
          self.coin = snek.make('Coin', 'rico')
          self.size = 'with'

      def testSize():
          assert self.coin.balanceOf(self) == 0
          assert self.size == 'with'

      event Transfer(...)
      def testEvent():
          log echo()
          log Transfer(...)
          self.coin.transfer(...)

  make multifab
    add - add a type (bytecode)
    new - create new instance (codehash -> new address)

  make snektest helper
    _bind(typename, bytecode) - pretest setup, add the types for user
    make(typename, objectname) - get new instance

  make snek.js test harness
    - compile all contracts
    - deploy multifab
    - put all types in multifab
    - deploy snek
    - for each test contract
        - deploy it
        - call each test function
        - for each echo event, check events match
```

