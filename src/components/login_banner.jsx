import React, { Component } from 'react';
import { css } from 'emotion'

const banner_container = css `
	position: relative;
	width: 420px;
	height: 100vh;
	background-color: #293946;
	color: #fff;
	text-align: center;
	float: right;

	.content {
		position: absolute;
		width: 290px;
		max-width: 100%
		margin: auto;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		p.info {
			margin-top: 10px;
			font-size: 30px;
			line-height: 38px;
			letter-spacing: -0.7px;
		}

		h5 {
			margin: 72px 0 20px 0;
			text-align: left;
			border-bottom: 1px solid #fff;
		}
		table {
			width: 100%;
			text-align: left;
			font-size: 12px;

			th {
				opacity: 0.45; 
				font-size: 11px;
			}

			.balance {
				text-align: right;
			}
		}
	}
`

class Banner extends Component {
	render() {
		return (
			<div className={banner_container}>
				<div className="content">
					<img src="/public/images/trophy.svg"/>
					<p className="info">Participate on our  
						Paper Trading Contest and <br/>
						<b>win up to $5000 USD</b></p>

					<h5>CURRENT LEADERS</h5>
					<table>
						<thead>
							<tr><th className="place">#</th><th className="name">Name</th><th className="balance">Balance</th></tr>
						</thead>
						<tbody>
							<tr><td className="place">1</td><td className="name">Place</td><td className="balance">$111,800.00</td></tr>
							<tr><td className="place">2</td><td className="name">Holder</td><td className="balance">$111,700.00</td></tr>
						</tbody>
						
					</table>
				</div>
			</div>
		)
	}
}

export default Banner