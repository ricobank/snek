# snek
## the tiny vyper helper command

Stupider is smarter is sweeping the globe.
Maybe we will make a tiny tool to help write vyper programs.

We could:
- borrow some verbs from [minihat](https://github.com/nmushegian/minihat)
- port [ds-test](https://github.com/dapphub/ds-test) for VM level tests
- autogenerate solidity interface definitions for export
- make a @load macro using locked dpath for inlining files from dmap/ipfs

Just some ideas.

Maybe we will have this CLI:

```
snek make [regex(es)]
  compile all vyper contracts in source folder,
  or just the ones matching the regex(es)

snek test [regex(es)]
  Compile and test all vyper contracts in source and test folders,
  or just the ones matching the regex(es).
  See `snektest` for more info on test harness.
```

