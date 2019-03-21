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
	return <span>{token[0]}{token[1] ? "0x" + token[1].substr(0, 4) : ""}</span>
}

export const SymbolToken = ({ name, showIcon = true, withLink= true }) => {
	if (name === undefined || name === null) {
		return "INVALID"
	}
	const token = name.split("0X")

	return (<span className={container + " symbol"}>{token[0]} {token[1] && 
		(withLink ? 
		<a className="issuer-tag qt-font-light"
			href={CONFIG.getEnv().ETHERSCAN_URL + "/token/0x" + token[1]} target="_blank">0x{token[1].substr(0, 4)}</a>
		
		: <span className="issuer-tag qt-font-light">0x{token[1].substr(0, 4)}</span>)
		}
		{showIcon && (CONFIG.getEnv().CROSSCHAIN_COINS.includes(name) || name.split("0X").length == 2) ? 
			<img className="crosschain-icon" src={devicePath("public/images/crosschain-coin.svg")} title="Crosschain" />
			: null
		}</span>
	)
}

export default ({ticker}) => {
	if (ticker === undefined || ticker === null) {
		return ""
	}
	const comp = ticker.split("/")

	return <span><SymbolToken name={comp[0]} showIcon={false} withLink={false} />/ <SymbolToken name={comp[1]} showIcon={false} withLink={false} /></span>
}