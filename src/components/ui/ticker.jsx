import React, { Component } from 'react';
import CONFIG from '../../config'
import { css } from 'emotion'
import ReactTooltip from 'react-tooltip'

const container = css`
	font-family: SFCompactTextRegular;

	.issuer-tag {
		border-radius: 2px;
		background-color: #454651;
		font-size: 10px;
		padding: 3px 5px;
		color: #ddd;
		vertical-align: middle;
		margin-right: 3px;
	}

	.crosschain-icon {
		margin-bottom: 2px;
	}
`

export const Token = ({ name }) => {
	if (name === undefined || name === null) {
		return "INVALID"
	}

	// const token = name.split("*")
	// return <span>{token[0]}<b>{token[1].substr(0, 4)}</b></span>
	return <span>{name}</span>
}

export const SmallToken = ({ name }) => {
	if (name === undefined || name === null) {
		return "INVALID"
	}

	const token = name.split("0X")
	return <span>{token[0]}</span>//{token[1] ? "0x" + token[1].substr(0, 4) : ""}</span>
}

export const SymbolToken = ({ name, showIcon = true, withLink = true, tooltip = true }) => {
	if (name === undefined || name === null) {
		return "INVALID"
	}
	const token = name.split("0X")

	return (<span className={container + " symbol"}>
		{withLink && (token[1] || window.coin_info[token[0]])?
			<a href={token[1] ? CONFIG.getEnv().ETHERSCAN_URL + "/token/0x" + token[1] : window.coin_info[token[0]].website} target="_blank">{token[0]}</a>
			: token[0]
		}
		{/* {token[1] && 
		(withLink ? 
		<a className="issuer-tag qt-font-light"
			href={CONFIG.getEnv().ETHERSCAN_URL + "/token/0x" + token[1]} target="_blank">0x{token[1].substr(0, 4)}</a>
		: <span className="issuer-tag qt-font-light">0x{token[1].substr(0, 4)}</span>)
		} */}
		{showIcon && (CONFIG.getEnv().CROSSCHAIN_COINS.includes(name) || name.split("0X").length == 2) ? 
			<span className="position-relative crosschain-icon ml-2">
				<img src={devicePath("public/images/crosschain-coin.svg")} 
				data-tip={(token[1] ? "ERC20: 0x" + token[1].substr(0, 4) : assetsBySymbol[token[0]].options.description) + "<br/>Secure by Crosschain"} 
				data-place="right" />
				{tooltip ? <ReactTooltip clickable={true} html={true} /> : null}
				
			</span>
			: null
		}</span>
	)
}

export default ({ticker, withLink=false}) => {
	if (ticker === undefined || ticker === null) {
		return ""
	}
	const comp = ticker.split("/")

	return <span><SymbolToken name={comp[0]} showIcon={false} withLink={withLink} />/<SymbolToken name={comp[1]} showIcon={false} withLink={withLink} /></span>
}