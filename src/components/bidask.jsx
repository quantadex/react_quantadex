import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment';

import { css } from 'emotion'

const container = css`
	font-size: 12px;

	div.header {
		padding: 5px;
		margin-bottom: 5px;
		color: black;
	    font-weight: 400;
	    font-size: 14px;
	}

	div.subheader {
		color: #2D3447;
		border-bottom: 1px solid #2D3447;
	}
	
	.box {
	    padding: 5px;		
	border: 1px solid #ccc;
	}
	
	.bid {
	    margin-bottom: 20px;
	}
	

	div.row {
		height: 19px;
		margin: 0;
	}

	div.currentPrice {
		background-color: #f7f7f7;
		height: 40px;
		margin: 0 -5px;
		font-size: 16px;
		line-height: 40px;
	}
`;

class History extends Component {
	render() {
		const bids = this.props.bids.slice();
		for (var i=0; i < 16-this.props.bids.length; i++) {
            bids.unshift({price: "", amount: ""});
		}

		const asks = this.props.asks.slice();
		for (var i=0; i < 16-this.props.asks.length; i++) {
			asks.push({price: "", amount: ""});
		}		
		// console.log("UPDATE? " , this.props)
		return (
			<div className={container}>
                <div className="box bid">
                    <div className="header">BUY ORDER / BID</div>
                    <div className="subheader row">
                        <div className="col-md-4 text-left p0">
                            PRICE
                        </div>
                        <div className="col-md-4 text-center">
                            AMOUNT
                        </div>
                        <div className="col-md-4 text-right p0">
                            TOTAL
                        </div>
                    </div>
                    <div>
                        { bids.map((e, index) => {
                            return (<div className="row" key={index}>
                                            <div className="col-md-4 text-left p0">
                                                {e.price}
                                            </div>
                                            <div className="col-md-4 text-center">
                                                {e.amount}
                                            </div>
                                            <div className="col-md-4 text-right p0">
                                                {parseFloat(e.amount) * parseFloat(e.price) || ""}
                                            </div>
                                        </div>);
                        })}
                    </div>
                </div>
                <div className="box ask">
                    <div className="header">SELL ORDER / ASK</div>
                    <div className="subheader row">
                        <div className="col-md-4 text-left p0">
                            PRICE
                        </div>
                        <div className="col-md-4 text-center">
                            AMOUNT
                        </div>
                        <div className="col-md-4 text-right p0">
                            TOTAL
                        </div>
                    </div>
                    <div>
                        { asks.map((e, index) => {
                            return (<div className="row" key={index}>
                                            <div className="col-md-4 text-left">
                                                {e.price}
                                            </div>
                                            <div className="col-md-4 text-center">
                                                {e.amount}
                                            </div>
                                            <div className="col-md-4 text-right">
                                                {parseFloat(e.amount) * parseFloat(e.price) || ""}
                                            </div>
                                        </div>);
                        })}
                    </div>
                </div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  	bids: state.app.tradeBook.bids,
  	asks: state.app.tradeBook.asks,
		currentPrice: state.app.currentPrice
	});

export default connect(mapStateToProps)(History);