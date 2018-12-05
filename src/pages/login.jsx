import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { css } from 'emotion'

const login_container = css`
	position: relative;
	height: 100vh;
	width: calc(100% - 420px);
	color: #0a0a0a;
	text-align: center;
	float: left;

	.content {
		position: absolute;
		width: 750px;
		max-width: 100%
		margin: auto;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		#logo {
			height: 38px;
			margin-bottom: 40px;
		}
		p {
			font-size: 18px;
			line-height: 26px;
			margin: 30px 0px 40px 0px;
		}

		h1 {
			font-weight: bold;
		}
		.warning {
			background-color: rgba(255, 50, 130, 0.03);
			font-size: 16px;
			text-align: left;
			margin: 30px 0px;
			padding: 33px 50px;
			border: 2px solid #f0185c;
			border-radius: 4px;

			ul {
				padding: 18px;
				list-style: none;
				li::before {content: "•"; color: #aaa;
					display: inline-block; width: 1em;
					margin-left: -1em}
			}

			button {
				width: 100%;
				margin: 0px;
				font-size: 18px;
				color: #fff;
				padding: 12px;
				background-color: #f0185c;
				border-radius: 2px;
			}
		}
	}

	form {
		label {
			background-color: #f9f9f9;
			width: 135px;
			height: 45px;
			padding: 7px;
			padding-left: 40px;
			text-align: left;
			border: 1px solid #c7c7c8;
			border-right: none;
			border-radius: 4px 0px 0px 4px;
			background: #f9f9f9 url("/public/images/lock.svg") no-repeat 15px 12px;

			span {
				font-size: 13px;
			}
		}
		input {
			float: right;
			height: 45px;
			width: calc(100% - 135px);
			text-align: left;
			color: #0a0a0a;
			font-weight: 500;
			font-size: 16px;
			line-height: 26px;
			letter-spacing: 0.7px;
			padding: 10px 20px;
			border: 1px solid #c7c7c8;
			border-radius: 0px 4px 4px 0px;
		}
	}
	button {
		display: block;
		margin: 40px auto;
		background-color: #00d8d0;
		color: #fff;
		font-size: 18px;
		padding: 12px 28px;
		border-radius: 2px;
	}
	a {
		font-size: 17px;
		padding-bottom: 5px;
		border-bottom: 1px solid #979797;
	}
	.black {
		color: #0a0a0a;
	}
	
`
const leaderboard_container = css `
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

class Login extends Component {
	render() {
			return (
				// <GenerateKey />
				<div>
					<div className={login_container}>
						<div class="content">
							<KeyInfo />
							<AuthForm onClick={this.props.onClick}/>
						</div>
					</div>
					<Leaderboard />
				</div>
			)
	}
}

const KeyInfo = () => {
	return (
		<div>
			<img id="logo" src="/public/images/login-logo.svg" alt="Quantadex Decentralized Exchange"/>
			<p>To access QDEX exchange and participate on the Paper Trading Contest you 
				will need your QUANTA wallet private key. To get one you need to create a 
				QUANTA wallet first and open the downloaded PDF file.</p>
		</div>
	)
}

class AuthForm extends Component {
	render() {
		return (
			<div class="auth-form">
				<form>
					<label for="private-key">
						QUANTA<br/>PRIVATE KEY
					</label>
					<input id="private-key" name="private-key" type="text" placeholder="Enter private key …"/>
					<button type="submit">Authenticate</button>
				</form>
				
				<Link to="/keygen" class="black">I don’t have one. Generate a QUANTA Wallet.</Link>
			</div>
		)
	}
}

export class GenerateKey extends Component {
	render() {
		return (
			<div>
				<div className={login_container}>
					<div class="content">
						<GenerateInfo />
					</div>
				</div>
				<Leaderboard />
			</div>
		)
	}
}

const GenerateInfo = () => {
	return (
		<div>
			<h1>QUANTA Wallet keys</h1>
			<p>Please download your QUANTA wallet keys. Inside the .PDF you
				will get the private key that will be used to access QDEX Exchange</p>

			<div class="warning">
				<ul>
					<li>Store this wallet securely. QUANTA does not have your keys.</li>
					<li>If you lose it you will lose your tokens.</li>
					<li>Do not share it! Your funds will be stolen if you use this file on a malicious/phishing site.</li>
					<li>Make a backup! Secure it like the millions of dollars it may one day be worth.</li>
					<li>This is not a ERC-20.</li>
				</ul>
				<button>Download QUANTA Wallet Keys (.pdf)</button>
			</div>
			<button id="start-auth">Start Authentication</button>
		</div>
	)
}


class Leaderboard extends Component {
	render() {
		return (
			<div className={leaderboard_container}>
				<div class="content">
					<img src="/public/images/trophy.svg"/>
					<p class="info">Participate on our  
						Paper Trading Contest and <br/>
						<b>win up to $5000 USD</b></p>

					<h5>CURRENT LEADERS</h5>
					<table>
						<tr><th class="place">#</th><th class="name">Name</th><th class="balance">Balance</th></tr>
						<tr><td class="place">1</td><td class="name">Place</td><td class="balance">$111,800.00</td></tr>
						<tr><td class="place">2</td><td class="name">Holder</td><td class="balance">$111,700.00</td></tr>
					</table>
				</div>
			</div>
		)
	}
}

export default Login
