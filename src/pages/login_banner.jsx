import React, { Component } from 'react';
import { css } from 'emotion'

import Leaderboard from '../components/leaderboard.jsx'

const banner_container = css `
	display: flex;
	justify-content: center;
	width: 420px;
	height: 100vh;
	background-color: #211e42;
	color: #fff;
	text-align: center;
	overflow: auto;

	.content {
		align-self: center;
		width: 290px;
		max-width: 100%
		margin: auto;

		p.info {
			margin-top: 10px;
			font-size: 30px;
			line-height: 38px;
			letter-spacing: -0.7px;
		}

		h4 {
			margin: 50px 0 20px;
		}
		table {
			width: 100%;
			text-align: left;
			font-size: 12px;

			thead {
				color: #aaa;
				font-size: 11px;
			}

			.balance {
				text-align: right;
			}
		}
	}

	.disclaimer {
		font-size: 12px;
		color: #aaa;
		text-align: left;
		margin-top: 70px;
	}
	.disclaimer::before {
		content: '*';
		height: 100px;
		float: left;
		padding-right: 5px;
		font-size: 20px;
		margin-top: -5px;
	}
	.pad-sides, .place, .balance {
		padding: 0 !important;
	}
`

class Banner extends Component {
	render() {
		return (
			<div className={banner_container}>
				<div className="content">
					<img src="/public/images/trophy.svg"/>
					<p className="info">Participate QDEX Fantasy and<br/> <b>win up to $50K USD*</b></p>

					<Leaderboard inBanner={true}/>
					
					<p className="disclaimer">
						QDEX token is currently valued at $0.3USD based on pre-sale value, and is redeemable upon MainNet launch.  
						Actual QDEX token value will depend on market pricing at time of redemption.  
					</p>
				</div>
			</div>
		)
	}
}

export default Banner