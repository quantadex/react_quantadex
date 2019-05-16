import React, { Component } from 'react';
import { css } from 'emotion';
import ReactSlider from 'react-slider';
import Utils from '../../common/utils.js'
import Switch from '../../components/ui/switch.jsx'
import Chart from './chart.jsx'

const container = css `
    margin: 40px auto;
    max-width: 1000px;
    padding: 0 20px;
    color: #333;

    .horizontal-slider {
        width: 100%;
        height: 30px;
    }
    .handle {
        font-size: 0.9em;
        text-align: center;
        background-color: black;
        color: white;
        cursor: pointer;
    }
    .handle.active {
        background-color: grey;
    }
    .bar {
        position: relative;
        background: #ddd;
    }
    .bar.bar-0 {
        background: #da3c76;
    }
    .bar.bar-1 {
        background: #66d7d7;
    }
    .horizontal-slider .bar {
        top: 6px;
        height: 10px;
    }
    .horizontal-slider .handle {
        top: 1px;
        width: 0px;
        height: 20px;
        line-height: 20px;
    }

    .handle span {
        background: #000;
        position: absolute;
        left: -20px;
        width: 50px;
    }

    .slider-container {
        color: #eee;
    }

    .roll-indicator {
        position: absolute;
        width: 45px;
        text-align: center;
        background: #da3c76;
        color: #fff;
        top: -20px;
        border-radius: 5px;
        transform: translateX(-50%);
        transition: left 0.3s;
    }

    .roll-indicator::after {
        content: "";
        border: solid 6px transparent;
        border-top-color: #da3c76;
        position: absolute;
        bottom: -12px;
        left: 16px;
    }

    .roll-indicator.win {
        background: #66d7d7;
    }

    .roll-indicator.win::after {
        border-top-color: #66d7d7;
    }

    .input-container {
        margin-top: 10px;

        label {
            width: 110px;
            text-transform: uppercase;
            margin-right: 10px;
        }
        input {
            text-align: left;
            padding: 10px;
            color: #555;
            border: 1px solid #aaa;
            border-radius: 3px;
        }

        input[type=checkbox] {
            margin-right: 10px;
            height: auto;
        }

        input:disabled {
            background: #f5f5f5;
        }
    }

    .roll-history {
        .win {
            color: #66d7d7;
        }

        .loss {
            color: #da3c76;
        }

        .last {
            color: #fff;
            padding: 0px 8px;
            border-radius: 25px;
        }

        .last.win {
            background: #66d7d7;
        }

        .last.loss {
            background: #da3c76;
        }
    }
`

export default class DiceGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auto: false,
            auto_rolling: false,
            stop_loss: false,
            stop_profit: false,
            fund: 100000000,
            roll: 50,
            roll_history: Array(100),
            game_num: 0,
            win_num: 0,
            lose_num: 0,
            net_gain: 0,
            gain_history: [],
            win_value: 50,
            win_value_display: "50.00",
            amount: 1,
            amount_display: "0.00000001",
            unmod_amount: 1,
            multiplier: 1.98039,
            multiplier_display: "1.980",
            chance: 49.99,
            chance_display: "49.99",
            limit_auto_roll: false,
            auto_roll_limit: 1,
            auto_roll_num: 0,
            stop_loss_amount: 1,
            stop_loss_amount_display: "0.00000001",
            stop_profit_amount: 1,
            stop_profit_amount_display: "0.00000001",
            modify_loss: false,
            modify_loss_amount: 0,
            modify_win: false,
            modify_win_amount: 0,
        }

        this.setInputs = this.setInputs.bind(this)
    }

    autoRoll() {
        const { amount_display } = this.state
        const auto_rolling = setInterval(() => {
            this.rollDice()
        }, 700)
        this.setState({auto_rolling, net_gain: 0, unmod_amount: amount_display, 
            auto_roll_num: 0, game_num: 0, win_num:0, lose_num: 0, roll_history: Array(100) })
    }

    stopAutoRoll() {
        const { auto_rolling, unmod_amount } = this.state
        clearInterval(auto_rolling)
        this.setState({auto_rolling: false})
        this.setInputs("amount", unmod_amount)
    }

    rollDice() {
        const { win_value, game_num, amount, fund, roll_history, 
            auto_rolling, auto_roll_num, limit_auto_roll, auto_roll_limit } = this.state

        if (auto_rolling && limit_auto_roll && auto_roll_num == auto_roll_limit) {
            this.stopAutoRoll()
            return this.setState({message: "Auto roll limit reached"})
        }
        if (amount > fund) {
            this.stopAutoRoll()
            return this.setState({message: "Insufficient Fund"})
        }

        const roll = (Math.random() < 0.5 ? Math.random() * 100 : Math.abs(parseFloat(Math.random().toFixed(6)) - 0.999999) * 100).toFixed(2)
        this.setState({fund: fund - amount, roll, roll_history: [...roll_history, [roll, roll > win_value ? 1 : 0 ]].slice(-100), 
            game_num: game_num + 1, message: false, auto_roll_num: auto_roll_num + 1})
        setTimeout(() => {
            roll > win_value ? this.onWin() : this.onLose()
        }, 0)
    }

    onWin() {
        const { fund, amount, multiplier, win_num, stop_profit, auto, gain_history,
            stop_profit_amount, net_gain, modify_win, modify_win_amount, unmod_amount } = this.state
        const win_amount = amount * multiplier
        const gain = net_gain + win_amount - amount

        if (stop_profit && gain >= stop_profit_amount) {
            this.stopAutoRoll()
            this.setState({message: "Exceeded profit limit"})
        }

        if (auto) {
            if (modify_win) {
                this.setInputs("amount", Math.max((amount + (amount * (modify_win_amount/100)))/Math.pow(10, 8), 0.00000001))
            } else {
                this.setInputs("amount", unmod_amount)
            }
        }
        

        this.setState({fund: fund + win_amount, net_gain: gain, 
            gain_history: [...gain_history, (fund + win_amount)/Math.pow(10, 8)].slice(-1000), win_num: win_num + 1})
    }

    onLose() {
        const { lose_num, stop_loss, stop_loss_amount, net_gain, auto, gain_history, fund, 
            amount, modify_loss, modify_loss_amount, unmod_amount } = this.state
        const loss = net_gain - amount

        if (stop_loss && loss <= (stop_loss_amount * (-1))) {
            this.stopAutoRoll()
            this.setState({message: "Exceeded loss limit"})
        }

        if (auto) {
            if (modify_loss) {
                this.setInputs("amount", Math.max((amount + (amount * (modify_loss_amount/100)))/Math.pow(10, 8), 0.00000001))
            } else {
                this.setInputs("amount", unmod_amount)
            }
        }

        this.setState({lose_num: lose_num + 1, net_gain: loss, 
            gain_history: [...gain_history, fund/Math.pow(10, 8)].slice(-1000)})
    }

    round(value, precision) {
        return parseFloat(value.toFixed(precision))
    }

    setInputs(type, val) {
        const self = this
        const value = parseFloat(val) || 0
        let win_value, chance, multiplier

        function setMultiState(win_value, chance, multiplier) {
            self.setState({win_value: win_value, win_value_display: win_value.toFixed(2), 
                chance: chance, chance_display: chance.toFixed(2), 
                multiplier: parseFloat(multiplier.toFixed(3)), multiplier_display: multiplier.toFixed(3)})
        }
        
        function setAmount(key, value) {
            self.setState({[key]: Math.round(value*Math.pow(10, 8)), [key+"_display"]: value.toFixed(8)})
        }

        switch(type) {
            case "amount":
                return setAmount(type, value)
            case "win_value":
                win_value = value < 2 ? 2 : Math.min(value, 98.99)
                chance = 99.99 - win_value
                multiplier = 100/chance*0.99
                return setMultiState(win_value, chance, multiplier)
            case "multiplier":
                multiplier = value < 1.01 ? 1.01 : Math.min(value, 99)
                chance = 100/(multiplier/0.99)
                win_value = 99.99 - chance
                return setMultiState(win_value, chance, multiplier)
            case "chance":
                chance = value < 1 ? 1 : Math.min(value, 97.99)
                win_value = 99.99 - chance
                multiplier = 100/chance*0.99
                return setMultiState(win_value, chance, multiplier)
            case "stop_loss_amount":
                return setAmount(type, value)
            case "stop_profit_amount":
                return setAmount(type, value)
        }
    }

    render() {
        const { auto, auto_rolling, fund, roll, roll_history, game_num, win_num, lose_num, 
            message, net_gain, gain_history, limit_auto_roll, auto_roll_limit,
            win_value, amount, multiplier, chance,
            win_value_display, amount_display, multiplier_display, chance_display,
            stop_loss, stop_profit, stop_loss_amount_display, stop_profit_amount_display,
            modify_loss, modify_loss_amount, modify_win, modify_win_amount } = this.state
        const roll_history_length = 20

        return (
            <div className={container}>
                <div className="slider-container position-relative">
                    <div className={"roll-indicator" + (roll > win_value ? " win" : "")} style={{left: roll + "%"}}>{roll}</div>
                    <ReactSlider className="horizontal-slider" 
                        value={win_value}
                        min={2} 
                        max={99} 
                        onChange={(e) => this.setInputs("win_value", e)}
                        withBars 
                        disabled={auto_rolling && true}
                    >
                        <div><span>{win_value > 2 ? win_value_display : 2.00}</span></div>
                    </ReactSlider>
                </div>
                <div className="d-flex float-right roll-history">
                    {roll_history.slice(-1 * roll_history_length).map((value, index) => {
                        return (
                            value && 
                            <div key={index} 
                                className={"ml-4" + (value[1] ? " win" : " loss") + (index == roll_history_length - 1 ? " last" : "")} 
                                style={{opacity: 1/roll_history_length*(index+1)}}>
                                {Utils.maxPrecision(value[0],2)}
                            </div>
                        )
                    })}
                </div>
                <button className="btn btn-secondary mt-3" onClick={() => auto_rolling ? this.stopAutoRoll() : auto ? this.autoRoll() : this.rollDice()}>
                    { auto ? auto_rolling ? "Stop" : "Auto Roll" + (limit_auto_roll? " x " + auto_roll_limit : "") : "Roll"}
                </button>

                <div className="d-flex">
                    <input type="checkbox" id="auto-roll" name="auto-roll" disabled={auto_rolling && true}
                        onChange={e => this.setState({auto: e.target.checked})}/>
                    <label className="align-self-center m-0 ml-1" htmlFor="auto-roll">Auto</label>
                </div>

                {message && <span className="text-danger">{message}</span>}

                <div className="mt-5 qt-font-normal">
                    <Chart data={gain_history} style={{float: "right", height: "270px"}} />
                    <div>
                        <div className="input-container">
                            <label>Available</label><span>{(fund/Math.pow(10, 8)).toFixed(8)} BTC</span>
                        </div>
                        <div className="input-container">
                            <label>Roll Amount</label>
                            <input type="number" step="0.00000001" min="0.00000001" value={amount_display} 
                                disabled={auto_rolling && true}
                                onChange={(e) => this.setState({amount_display: e.target.value})}
                                onBlur={(e) => this.setInputs("amount", e.target.value)}
                                onKeyPress={e => {
                                    if (e.key == "Enter") this.setInputs("amount", e.target.value)
                                }} />
                                
                        </div>
                        <div className="input-container">
                            <label>Multiplier</label>
                            <input type="number" step="1" min="1" value={multiplier_display} 
                                disabled={auto_rolling && true}
                                onChange={(e) => this.setState({multiplier_display: Utils.maxPrecision(e.target.value, 4)})}
                                onBlur={(e) => this.setInputs("multiplier", e.target.value)}
                                onKeyPress={e => {
                                    if (e.key == "Enter") this.setInputs("multiplier", e.target.value)
                                }} />
                        </div>
                        <div className="input-container">
                            <label>Roll Over</label>
                            <input type="number" step="1" min="1" value={win_value_display} 
                                disabled={auto_rolling && true}
                                onChange={(e) => this.setState({win_value_display: Utils.maxPrecision(e.target.value, 3)})}
                                onBlur={(e) => this.setInputs("win_value", e.target.value)}
                                onKeyPress={e => {
                                    if (e.key == "Enter") this.setInputs("win_value", e.target.value)
                                }} />
                        </div>
                        <div className="input-container">
                            <label>Win Chance</label>
                            <input type="number" step="1" min="1" value={chance_display} 
                                disabled={auto_rolling && true}
                                onChange={(e) => this.setState({chance_display: Utils.maxPrecision(e.target.value, 3)})}
                                onBlur={(e) => this.setInputs("chance", e.target.value)}
                                onKeyPress={e => {
                                    if (e.key == "Enter") this.setInputs("chance", e.target.value)
                                }} />
                        </div>
                    </div>

                    { auto ?
                        <div>
                            <div className="input-container">
                                <input type="checkbox" id="stop-num" name="stop-num" disabled={auto_rolling && true}
                                    onChange={e => this.setState({limit_auto_roll: e.target.checked})}/>
                                <label htmlFor="stop-loss"># of Rolls</label>
                                <input type="number" step="1" min="1" value={auto_roll_limit} 
                                    disabled={(auto_rolling || !limit_auto_roll) && true}
                                    onChange={(e) => this.setState({auto_roll_limit: e.target.value})}
                                    onBlur={(e) => {
                                        let value = parseInt(e.target.value) || 0
                                        value = value < 1 ? 1 : value
                                        this.setState({auto_roll_limit: value.toFixed(0)})
                                    }}
                                />
                            </div>
                            <div className="input-container">
                                <input type="checkbox" id="stop-loss" name="stop-loss" disabled={auto_rolling && true}
                                    onChange={e => this.setState({stop_loss: e.target.checked})}/>
                                <label htmlFor="stop-loss">Stop Loss</label>
                                <input type="number" step="0.00000001" min="0.00000001" value={stop_loss_amount_display} 
                                    disabled={auto_rolling && true || !stop_loss}
                                    onChange={(e) => this.setState({stop_loss_amount_display: e.target.value})}
                                    onBlur={(e) => this.setInputs("stop_loss_amount", e.target.value)}
                                    onKeyPress={e => {
                                        if (e.key == "Enter") this.setInputs("stop_loss_amount", e.target.value)
                                    }} 
                                />
                            </div>

                            <div className="input-container">
                                <input type="checkbox" id="stop-profit" name="stop-profit" disabled={auto_rolling && true}
                                    onChange={e => this.setState({stop_profit: e.target.checked})}/>
                                <label htmlFor="stop-profit">Stop Profit</label>
                                <input type="number" step="0.00000001" min="0.00000001" value={stop_profit_amount_display} 
                                    disabled={auto_rolling && true || !stop_profit}
                                    onChange={(e) => this.setState({stop_profit_amount_display: e.target.value})}
                                    onBlur={(e) => this.setInputs("stop_profit_amount", e.target.value)}
                                    onKeyPress={e => {
                                        if (e.key == "Enter") this.setInputs("stop_profit_amount", e.target.value)
                                    }} 
                                />
                            </div>
                            
                            <div className="input-container">
                                <label>Loss Behavior</label>
                                <span>Reset</span>
                                <Switch className="d-inline dark" active={modify_loss} 
                                    onToggle={() => !auto_rolling && this.setState({modify_loss: !modify_loss})} />
                                <span className="mx-3">Modify</span>
                                <input type="number" step="1" value={modify_loss_amount} 
                                    disabled={(auto_rolling || !modify_loss) && true}
                                    onChange={(e) => this.setState({modify_loss_amount: e.target.value})}
                                    onBlur={(e) => {
                                        let value = parseFloat(e.target.value) || 0
                                        value = value > 100 ? 100 : value < -100 ? -100 : value
                                        this.setState({modify_loss_amount: value.toFixed(2)})
                                    }}
                                />
                            </div>
                            <div className="input-container">
                                <label>Win Behavior</label>
                                <span>Reset</span>
                                <Switch className="d-inline dark" active={modify_win} 
                                    onToggle={() => !auto_rolling && this.setState({modify_win: !modify_win})} />
                                <span className="mx-3">Modify</span>
                                <input type="number" step="1" value={modify_win_amount} 
                                    disabled={(auto_rolling || !modify_win) && true}
                                    onChange={(e) => this.setState({modify_win_amount: e.target.value})}
                                    onBlur={(e) => {
                                        let value = parseFloat(e.target.value) || 0
                                        value = value > 100 ? 100 : value < -100 ? -100 : value
                                        this.setState({modify_win_amount: value.toFixed(2)})
                                    }}
                                />
                            </div>
                        </div>
                        :null
                    }
                </div>




                <div className="mt-5">
                    Fund: {fund}<br/>
                    Amount: {amount}<br/>
                    Real amount: {amount_display}<br/>
                    Profit on win: {(((amount * multiplier) - amount) / Math.pow(10, 8)).toFixed(8)} BTC<br/>
                    Profit: {(net_gain/Math.pow(10, 8)).toFixed(8)}<br/>
                    Games: {game_num}<br/>
                    Win: {win_num}<br/>
                    Lose: {lose_num}<br/>
                    Win rate: {game_num && (win_num/game_num*100).toFixed(2) || 0}%<br/>
                    Luck: {game_num && ((roll_history.reduce((partial_sum, a) => partial_sum + (a ? a[1] : 0), 0)/Math.min(game_num, roll_history.length))*100/parseFloat(chance)*100).toFixed(0)}%
                </div>
                <button className="btn" onClick={() => this.setState({fund: fund + 100000000})}>Add BTC</button>
            </div>
        )
    }
}