import React, { Component } from 'react';
import NumericInput from 'react-numeric-input';
import { connect } from 'react-redux'
import { SET_AMOUNT } from "../redux/actions/app.jsx";
import API from "../api.jsx"
import { css } from 'emotion'
import {Token} from './ui/ticker.jsx';

const container = css`
	font-size: 12px;
	background-color: #f7f7f7;
	height: 240px;
	margin-top: 20px;
	padding: 10px;

	.bar {
		margin-bottom: 20px;
	}
	.header {
		font-weight: bold;
		font-size: 14px;
	}
	.counter {
		position: relative;
		float: right;
		margin-top: -24px;
		margin-right: 25px;
		color: #999;
	}

	.amountBox {
		width: 25%;
		padding-right: 10px;
	}

	.amountBox:last-child {
		padding-right: 0px;
	}
`;

const ACTION_BUY = "BUY";
const ACTION_SELL = "SELL";

const OrderBox = ({className, actionType, base, counter, price, amount, balance, balanceAmount, setPrice, setAmount, setPercent, onOrder}) => {
	return (
				<div className={className}>
					<div className="bar"><span className="header">{actionType} <Token name={base}/> </span><span style={{float: "right"}}>{balance} Balance: {parseFloat(balanceAmount.amount) - parseFloat(balanceAmount.hold)}</span></div>
					<form className="form-horizontal">
						<div className="form-group">
							<label htmlFor="inputPrice" className="col-sm-2 control-label">Price</label>
							<div className="col-sm-10">
								<NumericInput className="form-control" id="inputPrice" step={0.1} value={price} onChange={(e) => setPrice(actionType, e)}/>
						<div className="counter"><Token name={counter}/></div>
							</div>
						</div>
						<div className="form-group">
							<label htmlFor="inputAmount" className="col-sm-2 control-label">Amount</label>
							<div className="col-sm-10">
								<input type="number" className="form-control" id="inputAmount" value={amount} onChange={(e) => setAmount(actionType, e)}/>
								<div className="counter"><Token name={base}/></div>
							</div>
						</div>
						<div className="form-group text-right">
							<div className="col-sm-12">
								<span className="amountBox">
									<button className="btn btn-default" onClick={(e) => { e.preventDefault(); setPercent(0.25)} }>25%</button>
								</span>
								<span className="amountBox">
									<button className="btn btn-default" onClick={(e) => { e.preventDefault(); setPercent(0.50)} }>50%</button>
								</span>
								<span className="amountBox">
									<button className="btn btn-default" onClick={(e) => { e.preventDefault(); setPercent(0.75)} }>75%</button>
								</span>
								<span className="amountBox">
									<button className="btn btn-default" onClick={(e) => { e.preventDefault(); setPercent(0.999)} }>100%</button>
								</span>
							</div>
						</div>
						<div className="form-group">
							<div className="col-sm-offset-2 col-sm-10">
								<button className={"btn btn-block " + (actionType == ACTION_BUY ? 'btn-success' : 'btn-danger')}
										onClick={(e) => {e.preventDefault(); onOrder(actionType, base, counter, price, amount); }}>
									{actionType} {base}
								</button>
							</div>
						</div>
					</form>
				</div>
	);
}

class Order extends Component {
	setPercent(action, percent) {
		if (action == ACTION_BUY) {
			const totalBalance = (parseFloat(this.props.balance[this.props.counter].amount)  - parseFloat(this.props.balance[this.props.counter].hold))* percent;
			const share = totalBalance / this.props.inputBuy;
			this.props.dispatch({
				type: SET_AMOUNT,
				data: {
					inputBuyAmount: share
				}
			});
		} else {
			const totalBalance = (parseFloat(this.props.balance[this.props.base].amount)  - parseFloat(this.props.balance[this.props.base].hold)) * percent;
			this.props.dispatch({
				type: SET_AMOUNT,
				data: {
					inputSellAmount: totalBalance
				}
			});
		}
	}

	setPrice(action, price) {
		if (action == ACTION_BUY) {
			this.props.dispatch({
				type: SET_AMOUNT,
				data: {
					inputBuy: price
				}
			});
		}
		else {
			this.props.dispatch({
				type: SET_AMOUNT,
				data: {
					inputSell: price
				}
			});
		}
	}

	setAmount(action, amount) {
		if (action == ACTION_BUY) {
			this.props.dispatch({
				type: SET_AMOUNT,
				data: {
					inputBuyAmount: amount
				}
			});
		}
		else {
			this.props.dispatch({
				type: SET_AMOUNT,
				data: {
					inputSellAmount: amount
				}
			});
		}
	}

	onOrder(actionType, base, counter, price, amount) {
		console.log("ON ORDER ", actionType, base, counter, price, amount);

		if (actionType == ACTION_BUY) {
			API.bid(base, counter, amount, price).then((e) => {
				console.log("Ordered", e);
			});
		}
		else if (actionType == ACTION_SELL) {
			API.ask(base, counter, amount, price).then((e) => {
				console.log("Ordered", e);
			});
		}
	}

	render() {
		return (
			<div className={container}>
				<OrderBox className="col-md-6" actionType={ACTION_BUY} price={this.props.inputBuy}
									setPrice={this.setPrice.bind(this)} setAmount={this.setAmount.bind(this)}
									setPercent={(amount) => this.setPercent(ACTION_BUY, amount)} amount={this.props.inputBuyAmount}
									base={this.props.base} counter={this.props.counter} balance={this.props.counter}
									balanceAmount={this.props.balance[this.props.counter]||{} }
									onOrder={this.onOrder} />

				<OrderBox className="col-md-6" actionType={ACTION_SELL} price={this.props.inputSell}
								setPrice={this.setPrice.bind(this)} setAmount={this.setAmount.bind(this)}
								setPercent={(amount) => this.setPercent(ACTION_SELL, amount)} amount={this.props.inputSellAmount}
								base={this.props.base} counter={this.props.counter} balance={this.props.base}
								balanceAmount={this.props.balance[this.props.base]||{}}
								onOrder={this.onOrder} />
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  	base: state.app.base,
  	counter: state.app.counter,
		balance: state.app.balance,
		inputBuy: state.app.inputBuy,
		inputSell: state.app.inputSell,
		inputBuyAmount: state.app.inputBuyAmount,
		inputSellAmount: state.app.inputSellAmount
	});

export default connect(mapStateToProps)(Order);
