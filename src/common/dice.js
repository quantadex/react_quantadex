/*
      if (op.numbers.size() == 0) {
         if (op.bet == "odd") {
            reward = 0.5;
            if (randomN % 2 == 1) {
               win = true;
            }
         } else if(op.bet == "even"){
            if (randomN % 2 == 0) {
               win = true;
            }
         }

         if (op.bet[0] == '>' || op.bet[0] == '<') {
            int betNum = atoi(op.bet.substr(1).c_str());
            if (op.bet[0] == '>') {
               if (after_fork3) 
		 win = randomN > betNum;
               else 
	         win = randomN >= betNum;
               reward = 1./((100.-betNum)/100.);
            }
            if (op.bet[0] == '<') {
               if (after_fork3) {
                   win = randomN < betNum;
                   reward = 1./((betNum-1)/100.);
               } else {
                   win = randomN <= betNum;
                   reward = 1./((betNum)/100.);
               }
            }
         }
      } else {
         flat_set<uint16_t>::const_iterator result = op.numbers.find(randomN);
         if (result != op.numbers.end()) {
            win = true;
            reward = 1./(op.numbers.size()/100.);
         }
      }

      uint16_t fee = d.get_global_properties().parameters.extensions.value.roll_dice_percent_of_fee.valid() ?
              *d.get_global_properties().parameters.extensions.value.roll_dice_percent_of_fee : GRAPHENE_1_PERCENT;

      float fee_dec = float(fee) / GRAPHENE_100_PERCENT;
      bool after_fork = d.head_block_time() >= HARDFORK_CORE_QUANTA2_TIME;

      ilog("roll_dice outcome=${o} ${bet} ${data} win=${win} fee=${fee} reward=${reward}", ("bet", op.bet.c_str())("o",randomN)("data", out.str().c_str())("win",win)("fee",fee)("reward", reward));

      asset payout_obj;
      asset fee_pool;
      asset qdex_amount;

      if (win) {
         float payrate = reward - 1;
         fc::safe<int64_t> payout = op.risk.amount * payrate;

         if (after_fork) {
             uint32_t payrateI = payrate * GRAPHENE_100_PERCENT;
             fc::uint128 r(op.risk.amount.value);
             r *= payrateI;
             r /= GRAPHENE_100_PERCENT;
             payout = r.to_uint64();
         }

         asset balance = d.get_balance(account_id_type(2), op.risk.asset_id);

         share_type available_payout = std::min(payout, balance.amount);
         asset full_payout = asset(available_payout, op.risk.asset_id);

         share_type fee_to_pool = fee_dec * (payout + op.risk.amount);
         share_type payout_amount;

          if (after_fork) {
             fee_to_pool = cut_fee(payout + op.risk.amount, fee);

             // we don't even have enough to pay fee pool
             // just pay remaining to user
             if (after_fork3) {
                 if (fee_to_pool > available_payout) {
                     fee_to_pool = cut_fee(available_payout, fee); // pay available
                 }
                 payout_amount = available_payout - fee_to_pool;
                 full_payout.amount = payout_amount; // keep in the account
                 fee_to_pool = 0;
             } else {
                 if (fee_to_pool > available_payout) {
                     fee_to_pool = 0;
                     payout_amount = available_payout;
                 } else {
                     payout_amount = available_payout - fee_to_pool;
                 }
             }


             */

const GRAPHENE_100_PERCENT = 10000;

function cut_fee(a, p) {
    if( a == 0 || p == 0 )
      return BigInt(0);
   if( p == BigInt(GRAPHENE_100_PERCENT))
      return a;
    //console.log(a, p)
    var r = a;
    r *= p;
    r /= BigInt(GRAPHENE_100_PERCENT);
    return r;
}


/**calculate_profit
 * above - boolean 
 * betNum = int (1-100)
 * amount = BigInt (with asset precision)
 * fee = BigInt(with precision of 2)
 * 
 * Output: payout in original precision (BigInt)
 */
export function calculate_profit(above, betNum, risk, fee) {
    var reward
    var payout

    if (above) {
        reward = 1./((100.-betNum)/100.);
    } else {
        reward = 1./((betNum-1.)/100.);
    }
    var payrate = reward - 1.0;
    var payrateI = BigInt(Math.trunc(payrate * GRAPHENE_100_PERCENT));
    var r = risk;
    r *= payrateI;
    r /= BigInt(GRAPHENE_100_PERCENT);
    var fee = cut_fee(risk+r, fee)
    //console.log(payrateI, r, fee)
    payout = r - fee;
    return payout;
}

//console.log(calculate_profit(true, 91, BigInt(10000), BigInt(300)))
// console.log(calculate_profit(true, 50, BigInt(10), BigInt(300)))
