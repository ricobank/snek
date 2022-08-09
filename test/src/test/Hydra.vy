# SPDX-License-Identifier: AGPL-3.0
# Extra contract to test snek works with multiple contracts at same level and recursively

size: public(uint256)

@external
def __init__(_size: uint256):
    self.size = _size
