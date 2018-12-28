import React, { Component } from 'react';
import { css } from 'emotion'
import QTTabBar from './ui/tabBar.jsx'

const leaderboard_container = css `
	position: relative;
	padding: 20px;

	h4 {
		margin: 0;
	}
	span#last-updated {
		font-size: 11px;
		opacity: 0.35;
	}
	.leaderboard-share {
		display: flex;
		justify-content: space-between;
		position: absolute;
		top: 23px;
		right: 20px;
		width: 77px;
		span {
			opacity: 0.30;
		}
	}
	table {
		width: 100%;
		margin-top: 20px;
		thead {
			font-size: 11px;
			opacity: 0.45;
		}
		.balance {
			text-align: right;
		}
	}

	.leaderboard-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;

		a {
			text-align: center;
			font-size: 12px;
			color: #fff;
			background-color: transparent;
			border: 1px solid #fff;
			border-radius: 2px;
			padding: 5px;
			flex: 0 0 48%;
			white-space: nowrap;
			cursor: pointer;
		}
	}
`

class Leaderboard extends Component {
	render() {
		const tabs = {
			names: ['BALANCE','FREQUENCY'],
			selectedTabIndex: 0,
		  }
		return (
			<div className={leaderboard_container}>
				<div>
					<h4>LEADERBOARD</h4>
					<span id="last-updated">Updated 5 min ago</span><br/><br/>
				</div>
				<div className="leaderboard-share">
					<span>Share</span>
					<a><img src="/public/images/share/twitter.svg" /></a>
					<a><img src="/public/images/share/fbook.svg" /></a>
				</div>
					
					
					<QTTabBar
							className="underline small fluid even-width qt-font-semibold d-flex justify-content-between"
							width={85}
							tabs = {tabs}
						/>
					<table>
						<thead>
							<tr><th className="place">Rank</th><th className="name">Name</th><th className="balance">Balance</th></tr>
						</thead>
						<tbody>
							<tr><td className="place">1</td><td className="name">Place</td><td className="balance">$111,800.00</td></tr>
							<tr><td className="place">2</td><td className="name">Holder</td><td className="balance">$111,700.00</td></tr>
							<tr><td className="place">1</td><td className="name">Place</td><td className="balance">$111,800.00</td></tr>
							<tr><td className="place">2</td><td className="name">Holder</td><td className="balance">$111,700.00</td></tr>
							<tr><td className="place">1</td><td className="name">Place</td><td className="balance">$111,800.00</td></tr>
							<tr><td className="place">2</td><td className="name">Holder</td><td className="balance">$111,700.00</td></tr>
							<tr><td className="place">1</td><td className="name">Place</td><td className="balance">$111,800.00</td></tr>
							<tr><td className="place">2</td><td className="name">Holder</td><td className="balance">$111,700.00</td></tr>
							<tr><td className="place">1</td><td className="name">Place</td><td className="balance">$111,800.00</td></tr>
							<tr><td className="place">2</td><td className="name">Holder</td><td className="balance">$111,700.00</td></tr>
						</tbody>
						
					</table>

					<div className="leaderboard-actions">
						<a href="https://t.me/quantaexchange" target="_blank">Join Conversation</a>
						<a>See Full List</a>
					</div>
			</div>
		)
	}
}

export default Leaderboard