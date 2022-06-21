# SPDX-License-Identifier: AGPL-3.0
# Adapted from https://github.com/ricobank/multifab/blob/main/core/test/person.sol

name :public(String[32])
last :public(String[32])
year :public(uint256)


@external
def __init__(name :String[32], last :String[32], year :uint256):
    self.name = name
    self.last = last
    self.year = year


@external
def set_name(_name :String[32]):
    self.name = _name


@external
def set_year(_year: uint256):
    self.year = _year
