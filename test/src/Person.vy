# SPDX-License-Identifier: AGPL-3.0
# Adapted from https://github.com/ricobank/multifab/blob/main/core/test/person.sol

event Birth:
    date: indexed(uint256)

event Alias:
    nick: indexed(String[32])

name: public(String[32])
last: public(String[32])
year: public(uint256)
debt: public(uint256)
cash: public(uint256)
toys: public(uint256)

@external
def __init__(name: String[32], last: String[32], year: uint256):
    self.name = name
    self.last = last
    self.year = year

@external
def set_name(_name: String[32]):
    self.name = _name
    log Alias(self.name)

@external
def set_year(_year: uint256):
    self.year = _year
    log Birth(self.year)

@external
def draw(amt: uint256):
    self.debt += amt
    self.cash += amt

@external
def wipe(amt: uint256):
    self.debt -= amt
    self.cash -= amt

@external
def shop(amt: uint256):
    self.toys += amt
    self.cash -= amt
