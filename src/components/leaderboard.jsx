import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { css } from 'emotion'
import QTTabBar from './ui/tabBar.jsx'
import Loader from './ui/loader.jsx'

const leaderboard_container = css `
	padding: 20px 0;

	h4 {
		margin: 0;
	}
	span#last-updated {
		font-size: 11px;
		opacity: 0.35;
	}
	.pad-sides {
		padding: 0 20px;
	}
	.leaderboard-share {
		display: flex;
		justify-content: space-between;
		float: right;
		margin: 10px 20px;
		width: 77px;
		span {
			opacity: 0.30;
		}
	}
	table {
		width: 100%;
		margin-top: 20px;
		font-size: 11px;
		thead {
			color: #777;
		}
		.place {
			padding-left: 20px;
		}
		tbody .name {
			font-size: 12px;
		}
		.balance {
			text-align: right;
			padding-right: 20px;
		}
		
	}

	.is-user {
		background-color: rgba(102, 215, 215, 0.61);
		.name {
			font-weight: bold;
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
	constructor(props) {
		super(props);
		this.state = {
			isReady: false,
			selectedTabIndex: 0,
			balanceLeaderboard: [],
			freqLeaderboard: [],
			last_update: 1
		};
	  }
	componentDidMount() {
		fetch("/api/leaderboard", {
			method: "get",
			headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
			}
		})
		.then(res => res.json())
		.then(data => {
			const {balanceLeaderboard, freqLeaderboard, timestamp} = data
			const last_update = Math.floor((new Date() - new Date(timestamp))/1000/60)
			this.setState({
				balanceLeaderboard: this.props.complete ? balanceLeaderboard : balanceLeaderboard.slice(0,10),
				freqLeaderboard: this.props.complete ? freqLeaderboard : freqLeaderboard.slice(0,10),
				last_update: last_update,
				isReady: true
			})
		})
	}

	handleSwitch(index) {
		this.setState({selectedTabIndex: index})
	  }

	render() {
		const tabs = {
			names: ['BALANCE','FREQUENCY'],
			selectedTabIndex: 0,
		}

		const Balance = () => {
			return (
				<tbody>
					{this.state.balanceLeaderboard.map((row, index) => {
						return (
							<tr key={index} className={row.username == this.props.name ? "is-user" : ""}><td className="place">{index+1}</td><td className="name">{row.username + (row.username == this.props.name ? " (You)" : "")}</td>
							<td className="balance">${row.totalBalance.toFixed(2)}</td></tr>
						)
						
					})}
				</tbody>
			)
		}

		const Frequency = () => {
			return (
				<tbody>
					{this.state.freqLeaderboard.map((row, index) => {
						return (
							<tr key={index} className={row.username == this.props.name ? "is-user" : ""}><td className="place">{index+1}</td><td className="name">{row.username + (row.username == this.props.name ? " (You)" : "")}</td>
							<td className="balance">{row.frequency}</td></tr>
						)
						
					})}
				</tbody>
			)
		}

		const Header = () => {
			if (this.props.tableOnly) {
				return <h4>CURRENT LEADERS<span id="last-updated">Updated {this.state.last_update == 0 ? 1 : this.state.last_update} min ago</span></h4>
			} 
			return (
				<div>
					<div className="leaderboard-share">
						<span>Share</span>
						<a><img src="/public/images/share/twitter.svg" /></a>
						<a><img src="/public/images/share/fbook.svg" /></a>
					</div>
					<div className="pad-sides">
						<h4>LEADERBOARD</h4>
						<span id="last-updated">Updated {this.state.last_update == 0 ? 1 : this.state.last_update} min ago</span><br/><br/>
					</div>
				</div>
			)
		}

		
		return (
			<div className={leaderboard_container}>
				
				<Header />

				{ this.state.isReady ? 
					<div>
						<QTTabBar
								className="pad-sides underline small fluid even-width qt-font-semibold d-flex justify-content-between"
								width={85}
								tabs = {tabs}
								switchTab = {this.handleSwitch.bind(this)}
							/>
						<table>
							<thead>
								<tr><th className="place">Rank</th><th className="name">Name</th><th className="balance">{this.state.selectedTabIndex == 0 ? "Balance" : "# of Trades"}</th></tr>
							</thead>
							{this.state.selectedTabIndex == 0 ? <Balance /> : <Frequency />}
							
						</table>
					</div>
					: <Loader size="50px" margin="118px auto"/>
				}
				{this.props.tableOnly ? "" :
					<div className="leaderboard-actions pad-sides">
						<a href="https://t.me/quantaexchange" target="_blank">Join Conversation</a>
						<Link to="/leaderboard" >See Full List</Link>
					</div>
				}
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	name: state.app.name
  });

export default connect(mapStateToProps)(Leaderboard)