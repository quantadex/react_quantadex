const SETTINGS = {
	TESTNET: {
		WEBSOCKET_PATH: "wss://testnet-01.quantachain.io:8095",
		API_PATH: "https://wya99cec1d.execute-api.us-east-1.amazonaws.com/testnet",
		MARKETS_JSON: "https://s3.amazonaws.com/quantachain.io/markets_v2.json",
		CROSSCHAIN_ISSUER: "1.2.8",
		CROSSCHAIN_ADDRESS: '0xBD770336fF47A3B61D4f54cc0Fb541Ea7baAE92d',
		EXPLORER_URL: "http://explorer.quantadex.com/testnet",
		ETHERSCAN_URL: "https://ropsten.etherscan.io",
		BLOCKCYPHER_URL: "https://live.blockcypher.com/btc-testnet",
		CROSSCHAIN_COINS: ["BTC", "ETH"]
	},
	MAINNET: {
		WEBSOCKET_PATH: "wss://mainnet-api.quantachain.io:8095",
		API_PATH: "https://wya99cec1d.execute-api.us-east-1.amazonaws.com/mainnet",
		MARKETS_JSON: "https://s3.amazonaws.com/quantachain.io/markets_mainnet.json",
		CROSSCHAIN_ISSUER: "1.2.8",
		CROSSCHAIN_ADDRESS: '0xF8306d5279193146F307dc1c170EA59e7b0C370A',
		EXPLORER_URL: "http://explorer.quantadex.com/mainnet",
		ETHERSCAN_URL: "https://etherscan.io",
		BLOCKCYPHER_URL: "https://live.blockcypher.com/btc",
		CROSSCHAIN_COINS: ["BTC", "ETH"]
	}
};

module.exports = {
	SETTINGS
};