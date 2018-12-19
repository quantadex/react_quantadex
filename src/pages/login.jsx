import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { LOGIN } from '../redux/actions/app.jsx'
import { css } from 'emotion'
import StellarBase from "@quantadex/quanta-base"
import qbase from '@quantadex/quanta-base';
import jsPDF from 'jspdf'
import Banner from "./login_banner.jsx"

const container = css`
	display: flex;
`
const login_container = css`
	display: flex;
	justify-content: center;
	height: 100vh;
	width: calc(100% - 420px);
	color: #0a0a0a;
	font-size: 18px;
	text-align: center;
	overflow: auto;

	.content {
		align-self: center;
		width: 750px;
		max-width: 100%
		margin: auto;
		#logo {
			margin-bottom: 10px;
		}
		p {
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
				color: #fff;
				padding: 12px;
				background-color: #f0185c;
				border-radius: 2px;
			}
		}
	}

	.back-nav {
		text-align: left;
		margin-left: 30px;
	}

	form {
		.input-container {
			position: relative;
			border: 1px solid #c7c7c8;
			border-radius: 4px
		}
		label {
			background-color: #f9f9f9;
			width: 135px;
			height: 100%;
			margin: 0px;
			border-right: 1px solid #c7c7c8;
			padding: 7px;
			padding-left: 40px;
			font-size: 11px;
			text-align: left;
			background: #f9f9f9 url("/public/images/lock.svg") no-repeat 15px 12px;
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
		}
		input.error {
			background-color: rgba(255, 50, 130, 0.03);
		}
		span.error {
			position: absolute;
			bottom: -18px;
			right: 0;
			font-size: 12px;
			color: #f0185c;
		}
	}
	button {
		display: block;
		margin: 40px auto;
		background-color: #00d8d0;
		color: #fff;
		padding: 12px 28px;
		border-radius: 2px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.23;

	}
	.auth-form a {
		padding-bottom: 5px;
		border-bottom: 1px solid #979797;
	}
	.black {
		color: #0a0a0a;
	}
	
`

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = { private_key: '', authError: false }

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(e) {
		this.setState({private_key: e.target.value, has_input: e.target.value.length > 0})
	}

	handleSubmit(e) {
		e.preventDefault();

		try {
			const auth = qbase.Keypair.fromSecret(this.state.private_key)
			this.handleLogin()
		} catch(e) {
			console.log(e)
			this.setState({authError: true})
		}
		
	}

	handleLogin() {
		this.props.dispatch({
			type: LOGIN,
			private_key: this.state.private_key
		});
		this.props.history.push("/exchange");		
	}
	render() {
		return (
			<div className={container}>
				<div className={login_container}>
					<div className="content">
					<div>
						<img id="logo" src="/public/images/qdex-fantasy.svg" alt="QDEX Fantasy"/>
						<p>To start participating in the QDEX Fantasy paper trading contest you will need 
							to authenticate using your QUANTA wallet private key.  You can generate a new 
							wallet if you don’t have one, and locate the private key in the downloadable PDF file.  </p>
					</div>
						<div className="auth-form">
							<form onSubmit={this.handleSubmit}>
								<div className="input-container">
									<label htmlFor="private-key">
										QUANTA<br/>PRIVATE KEY
									</label>
									<input name="private-key" value={this.state.value} onChange={this.handleChange} type="text" spellCheck="false" placeholder="Enter private key …"/>
									<span className="error" hidden={!this.state.authError}>*Invalid Key</span>
								</div>
								<button type="submit" disabled={!this.state.has_input}>Authenticate</button>
							</form>
							
							<Link to="/keygen" className="black">I don’t have one. Generate a QUANTA Wallet.</Link>
						</div>
					</div>
				</div>
				<Banner />
			</div>
		)
	}
}

// class AuthForm extends Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = { private_key: '', authError: false }

// 		this.handleChange = this.handleChange.bind(this);
// 		this.handleSubmit = this.handleSubmit.bind(this);
// 	}

// 	handleChange(e) {
// 		this.setState({private_key: e.target.value, has_input: e.target.value.length > 0})
// 	}

// 	handleSubmit(e) {
// 		e.preventDefault();

// 		try {
// 			const auth = qbase.Keypair.fromSecret(this.state.private_key)
// 			this.props.onAuth()
// 		} catch(e) {
// 			console.log(e)
// 			this.setState({authError: true})
// 		}
		
// 	}
// 	render() {
// 		return (
// 			<div className="auth-form">
// 				<form onSubmit={this.handleSubmit}>
// 					<div className="input-container">
// 						<label htmlFor="private-key">
// 							QUANTA<br/>PRIVATE KEY
// 						</label>
// 						<input name="private-key" value={this.state.value} onChange={this.handleChange} type="text" spellCheck="false" placeholder="Enter private key …"/>
// 						<span className="error" hidden={!this.state.authError}>*Invalid Key</span>
// 					</div>
// 					<button type="submit" disabled={!this.state.has_input}>Authenticate</button>
// 				</form>
				
// 				<Link to="/keygen" className="black">I don’t have one. Generate a QUANTA Wallet.</Link>
// 			</div>
// 		)
// 	}
// }

export class GenerateKey extends Component {
	constructor(props) {
		super(props);
		this.state = { downloaded: false}
	}

	goLogin() {
		this.props.history.push("/login")
	}

	generateKeys(e) {
		e.preventDefault();

		var keys = StellarBase.Keypair.random();
		
		this.setState({
			public: keys.publicKey(),
			private: keys.secret()
		})
		setTimeout(function() {this.saveToPDF()}.bind(this), 400)
	}

	saveToPDF() {
		var doc = new jsPDF()
		
		doc.setFontSize(16)
		// doc.addImage(window.logoData, 'JPEG', 70, 10)
		doc.text('WALLET INFORMATION', 75, 40)
		var tm = 50
		doc.rect(10, tm+40, 190, 55)
		doc.setFontSize(18)
		doc.text('Your QUANTA private key\nKeep it safe, keep it secure.', 20, tm +50)
		doc.setFontSize(16)
		doc.text('Do not share it with anyone, not even the QUANTA foundation.\nWe will never ask you for your private key.', 20, tm +70)
		doc.setFontSize(12)
		doc.setTextColor("#FF0000")
		doc.text(this.state.private, 20, tm +85)

		doc.setTextColor("#000000")
		doc.rect(10, tm +120, 190, 40)
		doc.setFontSize(18)
		doc.text('Your QUANTA public key\nYou may share this key with other parties.', 20, tm +130)
		doc.setFontSize(12)
		doc.setTextColor("#1dc4bf")
		doc.text(this.state.public, 20, tm +150)

		doc.save('quanta_wallet.pdf')

		this.setState({ downloaded : true })

	}

	complete(e) {
		e.preventDefault();
		const self = this;
		fetch("/api/v1/crowdsale/public_key", {
				method: "post",
				headers: {
						"Content-Type": "application/json",
						Accept: "application/json"
				},
				body: JSON.stringify({
						publicKey: self.state.public,
				}),
				credentials: "include"
		})
				.then(response => {
						if (response.status == 200 || response.status == 400) {
								return response.json();
						} else {
								self.setState({
										error: true,
										message: "Server error, Please try again."
								});
								return null;
						}
				})
				.then(json => {
						console.log("Success -- ", json);
						if (json!= null ) {
							self.setState({ error: false, message: "" });
							self.props.history.push("/crowdsale");
						} else {
								self.setState({error: true, message: "Server error, Please try again."});
						}
				});		
	}

	render() {
		return (
			<div>
				<div className={login_container}>
					<div className="back-nav">
						<Link to="/login"><img src="/public/images/back-button.svg" /></Link>
					</div>
					
					<div className="content">
						<h1>QUANTA Wallet keys</h1>
						<p>Please download your QUANTA wallet keys. Inside the .PDF you
							will get the private key that will be used to access QDEX Exchange</p>

						<div className="warning">
							<ul>
								<li>Store this wallet securely. QUANTA does not have your keys.</li>
								<li>If you lose it you will lose your tokens.</li>
								<li>Do not share it! Your funds will be stolen if you use this file on a malicious/phishing site.</li>
								<li>Make a backup! Secure it like the millions of dollars it may one day be worth.</li>
								<li>This is not a ERC-20.</li>
							</ul>
							<button onClick={this.generateKeys.bind(this)}>Download QUANTA Wallet Keys (.pdf)</button>
						</div>
						<button onClick={this.goLogin.bind(this)} disabled={!this.state.downloaded}>Start Authentication</button>
					</div>
				</div>
				<Banner />
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	private_key: state.app.private_key,
});

export default connect(mapStateToProps)(withRouter(Login))
