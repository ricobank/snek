# SPDX-License-Identifier: AGPL-3.0

size: public(uint256)

@external
def __init__(_size: uint256):
    self.size = _size

@external
def grow():
    self.size += 1
