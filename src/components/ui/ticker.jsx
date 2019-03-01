import React, { Component } from 'react';
import CONFIG from '../../config'
import { css } from 'emotion'

const container = css`
	font-family: SFCompactTextSemiBold;
	
	.issuer-tag {
		border-radius: 2px;
		background-color: #454651;
		font-size: 10px;
		padding: 3px 5px;
		margin-right: 4px;
		color: #ddd;
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

	// const token = name.split("*")
	// return <span>{token[0]}<span className="issuer">{token[1].substr(0, 4)}</span></span>
	return <span>{name}</span>
}

export const SymbolToken = ({ name, showIcon = true }) => {
	if (name === undefined || name === null) {
		return "INVALID"
	}
	const token = name.split("0X")

	return (<span className={container + " symbol"}>{token[0]} {token[1] && 
		<a className="issuer-tag qt-font-light"
			href={CONFIG.SETTINGS.ETHERSCAN_URL + "/token/0x" + token[1]} target="_blank">0x{token[1].substr(0, 4)}</a>
		}
		{showIcon && (CONFIG.SETTINGS.CROSSCHAIN_COINS.includes(name) || name.split("0X").length == 2) ? 
			<img className="crosschain-icon" src={devicePath("public/images/crosschain-coin.svg")} title="Crosschain" />
			: null
		}</span>
	)
}

export default ({ticker}) => {
	if (ticker === undefined || ticker === null) {
		return "INVALID"
	}
	return <span>{ticker}</span>
	// const comp = ticker.split("/")
	// const base = comp[0].split("*")
	// const counter = comp[1].split("*")

	// return <span>{base[0]}<b>{base[1].substr(0, 4)}</b>/{counter[0]}<b>{counter[1].substr(0, 4)}</b></span>
}