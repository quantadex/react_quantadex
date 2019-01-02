perm = {}
perm["charge_market_fee"] = 0x01
perm["white_list"] = 0x02
perm["override_authority"] = 0x04
perm["transfer_restricted"] = 0x08
perm["disable_force_settle"] = 0x10
perm["global_settle"] = 0x20
perm["disable_confidential"] = 0x40
perm["witness_fed_asset"] = 0x80
perm["committee_fed_asset"] = 0x100

permissions = {"charge_market_fee" : True,
								"white_list" : True,
								"override_authority" : True,
								"transfer_restricted" : True,
								"disable_force_settle" : True,
								"global_settle" : True,
								"disable_confidential" : True,
								"witness_fed_asset" : True,
								"committee_fed_asset" : True,
								}
flags       = {"charge_market_fee" : True,
								"white_list" : True,
								"override_authority" : True,
								"transfer_restricted" : True,
								"disable_force_settle" : True,
								"global_settle" : True,
								"disable_confidential" : True,
								"witness_fed_asset" : True,
								"committee_fed_asset" : True,
								}


permissions_int = 0
for p in permissions :
		if permissions[p]:
				permissions_int += perm[p]
flags_int = 0
for p in permissions :
		if flags[p]:
				flags_int += perm[p]

print(permissions_int)
print(flags_int)