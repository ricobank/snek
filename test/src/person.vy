# SPDX-License-Identifier: AGPL-3.0
# Adapated from https://github.com/ricobank/multifab/blob/main/core/test/person.sol
first_name :public(String[32])
last_name :public(String[32])
birth_year :public(uint256)

@external
def __init__(first_name :String[32], last_name :String[32], birth_year :uint256):
    self.first_name = first_name
    self.last_name = last_name
    self.birth_year = birth_year

