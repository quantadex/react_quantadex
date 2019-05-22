import React, { Component } from 'react';
import { css } from 'emotion';
import Chart from './chart.jsx'

const container = css `
    background: #57A38B;
    border-radius: 5px;
    margin-left: 30px;
    width: 300px;
    overflow: hidden
    color: #fff;

    h5 {
        background: #57bc90;
    }

    .history {
        height: 25px;
        width: 25px;
        border: 1px solid #026a5f;
        border-radius: 100px;
        text-align: center;
        line-height: 24px;
    }

    .history.gold {
        border: 0;
        box-shadow: 0 0 4px;
    }
`

export default class Stats extends Component {
    render() {
        const { gain_history, profit, wins, lose, bets, luck, roll_history } = this.props
        
        return (
            <div className={container}>
                <h5 className="text-center py-3">LIVE STATS</h5>
                <div className="px-5">Profit<br/>{profit}</div>
                <Chart data={gain_history} />
                <div className="d-flex flex-wrap px-5">
                    <div className="w-50">Wins <span className="float-right pr-4">{wins}</span></div>
                    <div className="w-50">Losses <span className="float-right">{lose}</span></div>
                    <div className="w-50">Bets <span className="float-right pr-4">{bets}</span></div>
                    <div className="w-50">Luck <span className="float-right">{luck}%</span></div>
                </div>
                <div className="d-flex justify-content-around my-4">
                    {roll_history.map((roll, index) => {
                        return (
                            roll ?
                                <span key={index} className={"history" + (roll[1] ? " gold" : " loss")}>{Math.round(roll[0])}</span>
                                : null
                        )
                        
                    })}
                </div>
            </div>
        )
    }
}