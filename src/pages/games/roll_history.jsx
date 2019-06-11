import React, { Component } from 'react';
import { css } from 'emotion';
import { GetAccount } from '../../redux/actions/app.jsx'
import QTTabBar from '../../components/ui/tabBar.jsx'
import Loader from '../../components/ui/loader.jsx'
import CONFIG from '../../config.js'


const container = css `
    max-width: 1200px;
    overflow: hidden;

    .roll-table-container {
        height: 425px;
        overflow: hidden;
        
        span {
            width: 100%;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        span.win {
            color: #57bc90;
        }

        span.loss {
            color: #e17055;
        }

        .header {
            font-weight: bold;
            color: #777;
        }

        .content {
            color: #999;

            .bet-row {
                height: 40px;
                line-height: 40px;
                white-space: nowrap;
            }

            .bet-row.first {
                overflow: hidden;
                animation: 0.2s rollIn;
            }
        }
    }

    @keyframes rollIn {
        0% {
            height: 0px;
        }
        100% {
            height: 40px;
        }
    }
`

export default class RollHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            tab_index: 1,
        }

        this.names = {}
        this.buffer = []
        this.last_operation_id_num
        this.tabs = {names: ["MY BETS", "ALL BETS"], selectedTabIndex: 1}
    }

    componentDidMount() {
        if (!window.assets) {
            setTimeout(() => {
                this.componentDidMount()
            }, 1000)
            return
        }
        this.getRollHistory()
        this.pushToDisplay()
    }

    getRollHistory() {
        fetch(CONFIG.getEnv().API_PATH + '/account?filter_field=operation_type&filter_value=50&size=10' 
            + (this.state.tab_index == 0 ? "&account_id=" + this.props.userId : ""), 
            { mode: "cors" }
        ).then(e => e.json())
        .then(async (e) => {
            const list = []
            for (let op of e) {
                if (op.operation_id_num == this.last_operation_id_num) break
                const op_object = op.operation_history.op_object
                const asset = window.assets[op_object.risk.asset_id]

                let name

                if (this.names[op_object.account_id]) {
                    name = this.names[op_object.account_id]
                } else {
                    await GetAccount(op_object.account_id).then((e) => {
                        this.names[op_object.account_id] = e.name
                        name = e.name
                    })
                }

                const data = {
                    id: op.operation_id_num,
                    user: name,
                    time: new Date(op.block_data.block_time + "Z").toLocaleTimeString([], {hour: "numeric", minute: "numeric"}),
                    wagered: op_object.risk.amount/Math.pow(10, asset.precision),
                    payout: op_object.win ? (op_object.payout.amount/op_object.risk.amount) + 1 : 0,
                    roll: op_object.outcome,
                    profit: op_object.payout.amount/Math.pow(10, asset.precision),
                    symbol: asset.symbol.split('0X')[0].slice(0,4),
                    precision: asset.precision
                }
                list.push(data)
            }

            if (this.state.history.length == 0) {
                this.setState({history: list})
            } else {
                this.buffer = list.concat(this.buffer)
            }

            this.last_operation_id_num = e[0] && e[0].operation_id_num
        }).finally(() => {
            setTimeout(() => {
                this.getRollHistory()
            }, 1000)
        })
    }

    pushToDisplay() {
        const next = this.buffer.splice(-1, 1)[0]
        if (next) {
            const { history } = this.state
            history.unshift(next)
            this.setState({history: history.slice(0, 11)})
        }
        
        setTimeout(() => {
            this.pushToDisplay()
        }, 1000)
    }

    render() {
        const { userId } = this.props
        const { history, tab_index } = this.state
        return (
            <div className={container + " mx-auto my-5"}>
                <QTTabBar
                    className="underline static set-width qt-font-normal qt-font-bold d-flex justify-content-center mb-5"
                    color={"100,100,100"}
                    width={120}
                    gutter={10}
                    tabs={this.tabs}
                    disabled={!userId ? ["0"] : false}
                    switchTab = {(index) => {
                        if (index != tab_index && (index != 0 || userId)) {
                            this.last_operation_id_num = null
                            this.setState({tab_index: index, history: []})
                        }
                            
                    }}
                />
                { history.length == 0 ? <Loader type={"box"} margin={"auto"} className={"text-center"} /> :
                    <div className="roll-table-container qt-font-normal px-5">
                        <div className="header d-flex mb-3">
                            <span className="text-left">Bet ID</span>
                            <span>User</span>
                            <span className="d-none d-md-block">Time</span>
                            <span className="d-none d-sm-block">Wagered</span>
                            <span className="d-none d-md-block">Payout</span>
                            <span className="d-none d-sm-block">Roll</span>
                            <span className="text-right">Profit</span>
                        </div>
                        <div className="content d-flex flex-column">
                            {history.map((row, index) => {
                                return (
                                    <div key={row.id} className={"bet-row d-flex " + (index == 0 ? "first" : "")}>
                                        <span className="text-left">{row.id}</span>
                                        <span>{row.user}</span>
                                        <span className="d-none d-md-block">{row.time}</span>
                                        <span className="d-none d-sm-block">{row.wagered.toFixed(row.precision)} {row.symbol}</span>
                                        <span className="d-none d-md-block">{row.payout.toFixed(2)}x</span>
                                        <span className="d-none d-sm-block">{row.roll}</span>
                                        <span className={"text-right" + (row.profit >= 0 ? " win" : " loss")}>{row.profit.toFixed(row.precision)} {row.symbol}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                }
            </div>
        )
    }
    
}
  