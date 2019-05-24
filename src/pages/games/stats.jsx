import React, { Component } from 'react';
import { css } from 'emotion';
import Chart from './chart.jsx'

const container = css `
    background: #57A38B;
    border-radius: 5px;
    margin-left: 30px;
    width: 240px;
    overflow: hidden
    color: #fff;
    cursor: default;
    box-shadow: 0 2px 2px rgba(0,0,0,0.3);

    h5 {
        background: #57bc90;
    }

    .history-container {
        height: 25px;
    }

    .history {
        height: 25px;
        width: 25px;
        border: 1px solid #026a5f;
        border-radius: 100px;
        text-align: center;
        line-height: 24px;
    }

    .history.new {
        animation: 0.2s ease-in-out popIn;
    }

    .history.gold {
        border: 0;
        box-shadow: 0 0 4px;
    }

    @keyframes popIn {
        0% {
            transform: scale(0.5);
        }
        100% {
            transform: scale(1);
        }
      }
`

export default class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            update: false
        }
    }

    componentDidUpdate(nextProps) {
        if (nextProps.roll_history[5] !== this.props.roll_history[5]) {
            this.setState({update: false}, () => this.setState({update: true}))
        }
    }

    render() {
        const { update } = this.state
        const { gain_history, profit, wins, lose, bets, luck, roll_history, wagered, chart_height } = this.props
        
        return (
            <div className={container + " qt-font-extra-small"}>
                <h5 className="text-center py-3">LIVE STATS</h5>
                <div className="d-flex">
                    <div className="px-5 w-50">Wagered<br/>{wagered}</div>
                    <div className="px-5 w-50">Profit<br/>{profit}</div>
                </div>
                <Chart data={gain_history} style={{height: chart_height}} />
                <div className="d-flex flex-wrap px-5">
                    <div className="w-50">Wins <span className="float-right pr-4">{wins}</span></div>
                    <div className="w-50">Losses <span className="float-right">{lose}</span></div>
                    <div className="w-50">Bets <span className="float-right pr-4">{bets}</span></div>
                    <div className="w-50">Luck <span className="float-right">{luck}%</span></div>
                </div>
                <div className="d-flex justify-content-around my-4 history-container">
                    {roll_history.map((roll, index) => {
                        return (
                            roll ?
                                <span key={index+roll[0]} className={"history" + (roll[1] ? " gold" : " loss") + (index == 5 && update ? " new" : "")}>{Math.round(roll[0])}</span>
                                : null
                        )
                        
                    })}
                </div>
            </div>
        )
    }
}