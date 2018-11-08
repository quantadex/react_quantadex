var withQuery = require('with-query');

var API;
(function(){
    var iapi_prefix = '/iapi/1/';
    var api_prefix = '/api/1/';
    var limit = 20;

    // This creates a simple paginated function that makes calls to `path`
    function paginated(path) {
        return function(before, last_id) {
            return fetch(withQuery(iapi_prefix+path,  { before: before, limit: limit, last_id: last_id}), { credentials: 'same-origin'});
        }
    }

    // This adds an error handler to API calls to show the error in the UI
    var APIWrap = function(fn) {
			return function () {
				return fn.apply(this, arguments).then(function(response) {
					return response.json();
				});
			}
        // return function () {
        //     return fn.apply(this, arguments).error( function (res) {
        //         var err_text = '';
        //         try {
        //             err_text = JSON.parse(res.responseText).message
        //         } catch (e) {
        //             err_text = res.responseText;
        //         }
        //         $.pnotify({
        //             title: Messages("java.api.messages.trade.apierror"),
        //             text: err_text,
        //             styling: 'bootstrap',
        //             type: 'error',
        //             text_escape: true
        //         });
        //     });
        // };
    };
    API = {
        balance: APIWrap(function() {
            return fetch(iapi_prefix+'balance', { credentials: 'same-origin'});
        }),

        pending_withdrawals: APIWrap(function(){
            return fetch(iapi_prefix+'pending_withdrawals_all', { credentials: 'same-origin'})
        }),

        pending_deposits: APIWrap(function(){
            return fetch(iapi_prefix+'pending_deposits_all', { credentials: 'same-origin'})
        }),

        bid: APIWrap(function(base, counter, amount, price) {
            return fetch(iapi_prefix+'bid', {
                credentials: 'same-origin',
                method: 'post',
                body: JSON.stringify({base: base, counter: counter, amount: amount, price: price}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        ask: APIWrap(function(base, counter, amount, price) {
            return fetch(iapi_prefix+'ask', {
                credentials: 'same-origin',
                method: 'post',
                body: JSON.stringify({base: base, counter: counter, amount: amount, price: price}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        cancel: APIWrap(function(id) {
            return fetch(iapi_prefix+'cancel', {
                credentials: 'same-origin',                
                method: 'post',
                body: JSON.stringify({order: Number(id)}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        withdraw: APIWrap(function(currency, amount, address, tfa_code) {
            return fetch(iapi_prefix+'withdraw', {
                credentials: 'same-origin',                
                method: 'post',
                body: JSON.stringify({currency: currency, amount: amount, address: address, tfa_code: tfa_code}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        pairs: APIWrap(function() {
            return fetch(iapi_prefix+'pairs', { credentials: 'same-origin'});
        }),

        currencies: APIWrap(function() {
            return fetch(iapi_prefix+'currencies', { credentials: 'same-origin'});
        }),

        deposit_crypto: APIWrap(function(currency) {
            return fetch(iapi_prefix+'deposit_crypto/'+currency, { credentials: 'same-origin'});
        }),

        deposit_crypto_all: APIWrap(function() {
            return fetch(iapi_prefix+'deposit_crypto_all', { credentials: 'same-origin'});
        }),

        ticker: APIWrap(function() {
            return fetch(api_prefix+'ticker', { credentials: 'same-origin'});
        }),

        trade_history: APIWrap(paginated('trade_history')),

        login_history: APIWrap(paginated('login_history')),

        deposit_withdraw_history: APIWrap(paginated('deposit_withdraw_history')),

        pending_trades: APIWrap(function() {
            return fetch(iapi_prefix+'pending_trades', { credentials: 'same-origin'});
        }),

        trade_fees: APIWrap(function() {
            return fetch(iapi_prefix+'trade_fees', { credentials: 'same-origin'});
        }),

        dw_fees: APIWrap(function() {
            return fetch(iapi_prefix+'dw_fees', { credentials: 'same-origin'});
        }),

        dw_limits: APIWrap(function() {
            return fetch(iapi_prefix+'dw_limits', { credentials: 'same-origin'});
        }),

        required_confirms: APIWrap(function() {
            return fetch(iapi_prefix+'required_confirms', { credentials: 'same-origin'});
        }),

        open_trades: APIWrap(function(first, second) {
            return fetch(api_prefix+'open_trades/'+first+'/'+second, { credentials: 'same-origin'});
        }),

        recent_trades: APIWrap(function(first, second) {
            return fetch(api_prefix+'recent_trades/'+first+'/'+second, { credentials: 'same-origin'});
        }),

        user: APIWrap(function() {
            return fetch(iapi_prefix+'user', { credentials: 'same-origin'});
        }),

        turnoff_tfa: APIWrap(function(code, password) {
            return fetch(iapi_prefix+'turnoff_tfa', {
                credentials: 'same-origin',
                method: 'post',
                body: JSON.stringify({tfa_code: code, password: password}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        turnoff_emails: APIWrap(function() {
            return fetch(iapi_prefix+'turnoff_emails', {
                credentials: 'same-origin',                
                method: 'post',
                body: "{}",
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        turnon_emails: APIWrap(function() {
            return fetch(iapi_prefix+'turnon_emails', {
                credentials: 'same-origin',
                method: 'post',
                body: "{}",
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        gen_totp_secret: APIWrap(function() {
            return $.post(iapi_prefix+'gen_totp_secret');
        }),

        turnon_tfa: APIWrap(function(code, password) {
            return fetch(iapi_prefix+'turnon_tfa', {
                credentials: 'same-origin',                
                method: 'post',
                body: JSON.stringify({tfa_code: code, password: password}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        add_pgp: APIWrap(function(password, code, pgp) {
            return fetch(iapi_prefix+'add_pgp', {
                credentials: 'same-origin',                
                method: 'post',
                data: JSON.stringify({tfa_code: code, password: password, pgp: pgp}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        remove_pgp: APIWrap(function(password, code) {
            return fetch(iapi_prefix+'remove_pgp', {
                credentials: 'same-origin',                
                method: 'post',
                body: JSON.stringify({tfa_code: code, password: password}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        add_api_key: APIWrap(function() {
            return fetch(iapi_prefix+'add_api_key', {
                credentials: 'same-origin',                
                method: 'post',
                body: "{}",
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        update_api_key: APIWrap(function(code, api_key, comment, trading, trade_history, list_balance) {
            return fetch(iapi_prefix+'update_api_key', {
                credentials: 'same-origin',
                method: 'post',
                body: JSON.stringify({tfa_code: code, api_key: api_key, comment: comment, trading: trading, trade_history: trade_history, list_balance: list_balance}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        disable_api_key: APIWrap(function(code, api_key) {
            return fetch(iapi_prefix+'disable_api_key', {
                credentials: 'same-origin',                
                method: 'post',
                body: JSON.stringify({tfa_code: code, api_key: api_key}),
                headers: { 'Content-Type':  'application/json' }
            });
        }),

        get_api_keys: APIWrap(function() {
            return fetch(iapi_prefix+'get_api_keys', { credentials: 'same-origin'});
        }),

        chart: APIWrap(function(base, counter) {
            return fetch(api_prefix+'chart/'+base+'/'+counter, { credentials: 'same-origin'});
        })
    };
})();

export default API;