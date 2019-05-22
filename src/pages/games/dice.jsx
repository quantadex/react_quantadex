import React, { Component } from 'react';
import { css } from 'emotion';
import ReactSlider from 'react-slider';
import Utils from '../../common/utils.js'
import Switch from '../../components/ui/switch.jsx'
import DiceInput from './input.jsx'
import Stats from './stats.jsx'

const container = css `
    min-height: 100vh;
    padding: 0 20px;
    background: #1C655D;
    color: #333;

    .horizontal-slider {
        width: 100%;
        height: 40px;
    }
    .handle {
        font-size: 0.9em;
        text-align: center;
        top: 4px;
        width: 0px;
        line-height: 30px;
        cursor: pointer;
    }
    
    .handle.active {
        background-color: grey;
    }

    .handle span {
        position: absolute;
        left: -15px;
        width: 40px;
        background: #D8D8D8;
        color: #999;
        border-radius: 6px;
        border: 1px solid #999;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .bar {
        position: relative;
        background: #ddd;
        border-radius: 50px;
        top: 13px;
        height: 14px;
    }
    .bar.bar-0 {
        background: #e17055;
    }
    .bar.bar-1 {
        background: rgb(211,174,13);
        background: repeating-linear-gradient(108deg, rgba(211,174,13,1) 45%, rgba(255,237,71,1) 55%, rgba(211,174,13,1) 70%, rgba(211,174,13,1));
    }

    .slider-container {
        background: #377a5d;
        color: #eee;
        border-radius: 100px;
        width: 600px;
    }

    .roll-indicator {
        position: absolute;
        width: 45px;
        text-align: center;
        background: #e17055;
        color: #fff;
        top: -20px;
        border-radius: 5px;
        transform: translateX(-50%);
        transition: left 0.3s;
    }

    .roll-indicator::after {
        content: "";
        border: solid 6px transparent;
        border-top-color: #e17055;
        position: absolute;
        bottom: -12px;
        left: 16px;
    }

    .roll-indicator.win {
        background: rgb(211,174,13);
        background: linear-gradient(330deg, rgba(211,174,13,1) 44%, rgba(255,237,71,1) 55%, rgba(211,174,13,1));
        color: #8f7709;
        text-shadow: 1px 1px rgba(255,237,71,1);
    }

    .roll-indicator.win::after {
        border-top-color: rgb(211,174,13);
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

    .inputs-container {
        background: #dfe6e9;    
        width: 600px;
        border-radius: 5px;
        overflow: hidden;
    }

    .auto-inactive {
        background: #ccc;
    }

    .auto-inactive:hover {
        background: #ddd;
    }

    .gold, .gold:active {
        background-image: rgb(211,174,13) !important;
        background-image: linear-gradient(108deg, rgba(211,174,13,1) 44%, rgba(255,237,71,1) 55%, rgba(211,174,13,1)) !important;
        color: #8f7709;
        text-shadow: 1px 1px rgba(255,237,71,1);
    }

    .btn {
        text-transform: uppercase;
        width: 300px;
        min-width: 170px;
        font-size: 18px;
        padding: 10px;
        box-shadow: 0 2px 5px;
    }

    .btn:active {
        box-shadow: 0 2px 2px;
    }
`

export default class DiceGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auto: false,
            auto_rolling: false,
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
            auto_roll_limit: 0,
            auto_roll_num: 0,
            stop_loss_amount: 0,
            stop_loss_amount_display: "0.00000000",
            stop_profit_amount: 0,
            stop_profit_amount_display: "0.00000000",
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
            auto_rolling, auto_roll_num, auto_roll_limit } = this.state

        if (auto_rolling && auto_roll_limit > 0 && auto_roll_num == auto_roll_limit) {
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
        const { fund, amount, multiplier, win_num, auto, gain_history,
            stop_profit_amount, net_gain, modify_win, modify_win_amount, unmod_amount } = this.state
        const win_amount = amount * multiplier
        const gain = net_gain + win_amount - amount

        if (stop_profit_amount > 0 && gain >= stop_profit_amount) {
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
            gain_history: [...gain_history, (fund + win_amount)/Math.pow(10, 8)].slice(-100), win_num: win_num + 1})
    }

    onLose() {
        const { lose_num, stop_loss_amount, net_gain, auto, gain_history, fund, 
            amount, modify_loss, modify_loss_amount, unmod_amount } = this.state
        const loss = net_gain - amount
        
        if (stop_loss_amount > 0 && loss <= (stop_loss_amount * (-1))) {
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
            gain_history: [...gain_history, fund/Math.pow(10, 8)].slice(-100)})
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
            message, net_gain, gain_history, auto_roll_limit,
            win_value, amount, multiplier, chance,
            win_value_display, amount_display, multiplier_display, chance_display,
            stop_loss_amount_display, stop_profit_amount_display,
            modify_loss, modify_loss_amount, modify_win, modify_win_amount } = this.state
        const roll_history_length = 20

        return (
            <div className={container}>
                <div className="d-flex justify-content-center pt-5">
                    <div className="inputs-container qt-font-normal">
                        <div className="d-flex justify-content-around text-center text-secondary">
                            <div className={"cursor-pointer w-100 py-3" + (auto ?  " auto-inactive" : "")}
                                onClick={() => this.setState({auto: false})}>MANUAL BETTING</div>
                            <div className={"cursor-pointer w-100 py-3" + (auto ?  "" : " auto-inactive")}
                                onClick={() => this.setState({auto: true})}>AUTOMATED BETTING</div>
                        </div>
                        <div className="py-4 px-5">
                            <div className="d-flex">
                                <DiceInput 
                                    label="Bet Amount"
                                    type="number"
                                    step="0.00000001"
                                    min="0.00000001"
                                    value={amount_display}
                                    disabled={auto_rolling && true}
                                    onChange={(e) => this.setState({amount_display: e.target.value})}
                                    onBlur={(e) => this.setInputs("amount", e.target.value)}
                                />
                                {auto ?
                                    <DiceInput 
                                        label="# of Rolls"
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={auto_roll_limit} 
                                        disabled={(auto_rolling) && true}
                                        onChange={(e) => this.setState({auto_roll_limit: e.target.value})}
                                        onBlur={(e) => {
                                            let value = parseInt(e.target.value) || 0
                                            value = value < 0 ? 0 : value
                                            this.setState({auto_roll_limit: value.toFixed(0)})
                                        }}
                                    />
                                    :
                                    <DiceInput 
                                        label="PROFIT ON WIN"
                                        type="number"
                                        disabled={true}
                                        value={(((amount * multiplier) - amount) / Math.pow(10, 8)).toFixed(8)}
                                    />
                                }
                                
                            </div>
                            <div className="d-flex">
                                <DiceInput 
                                    label="Multiplier"
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={multiplier_display}
                                    disabled={auto_rolling && true}
                                    onChange={(e) => this.setState({multiplier_display: Utils.maxPrecision(e.target.value, 4)})}
                                    onBlur={(e) => this.setInputs("multiplier", e.target.value)}
                                />
                                <DiceInput 
                                    label="Roll Over"
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={win_value_display} 
                                    disabled={auto_rolling && true}
                                    onChange={(e) => this.setState({win_value_display: Utils.maxPrecision(e.target.value, 3)})}
                                    onBlur={(e) => this.setInputs("win_value", e.target.value)}
                                />
                                <DiceInput 
                                    label="Win Chance"
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={chance_display} 
                                    disabled={auto_rolling && true}
                                    onChange={(e) => this.setState({chance_display: Utils.maxPrecision(e.target.value, 3)})}
                                    onBlur={(e) => this.setInputs("chance", e.target.value)}
                                />
                            </div>
                        </div>

                        { auto ?
                            <div className="py-4 px-5">
                                <div className="d-flex">
                                    <DiceInput 
                                        label="On Loss"
                                        type="number" 
                                        step="1" 
                                        value={modify_loss_amount} 
                                        disabled={(auto_rolling || !modify_loss) && true}
                                        onChange={(e) => this.setState({modify_loss_amount: e.target.value})}
                                        onBlur={(e) => {
                                            let value = parseFloat(e.target.value) || 0
                                            value = value > 100 ? 100 : value < -100 ? -100 : value
                                            this.setState({modify_loss_amount: value.toFixed(2)})
                                        }}
                                    >
                                        <div className={"toggle qt-font-extra-small" + (modify_loss? "" : " active")} onClick={() => !auto_rolling && this.setState({modify_loss: false})}>Reset</div>
                                        <div className={"toggle qt-font-extra-small" + (modify_loss? " active" : "")} onClick={() => !auto_rolling && this.setState({modify_loss: true})}>Modify by:</div>
                                    </DiceInput>

                                    <DiceInput 
                                        label="On Win"
                                        type="number" 
                                        step="1" 
                                        value={modify_win_amount} 
                                        disabled={(auto_rolling || !modify_win) && true}
                                        onChange={(e) => this.setState({modify_win_amount: e.target.value})}
                                        onBlur={(e) => {
                                            let value = parseFloat(e.target.value) || 0
                                            value = value > 100 ? 100 : value < -100 ? -100 : value
                                            this.setState({modify_win_amount: value.toFixed(2)})
                                        }}
                                    >
                                        <div className={"toggle qt-font-extra-small" + (modify_win? "" : " active")} onClick={() => !auto_rolling && this.setState({modify_win: false})}>Reset</div>
                                        <div className={"toggle qt-font-extra-small" + (modify_win? " active" : "")} onClick={() => !auto_rolling && this.setState({modify_win: true})}>Modify by:</div>
                                    </DiceInput>
                                </div>
                                
                                <div className="d-flex">
                                    <DiceInput 
                                        label="Stop Profit"
                                        type="number" 
                                        step="0.00000000" 
                                        min="0.00000000" 
                                        value={stop_profit_amount_display} 
                                        disabled={auto_rolling && true}
                                        onChange={(e) => this.setState({stop_profit_amount_display: e.target.value})}
                                        onBlur={(e) => this.setInputs("stop_profit_amount", e.target.value)}
                                    />
                                    <DiceInput 
                                        label="Stop Loss"
                                        type="number" 
                                        step="0.00000000" 
                                        min="0.00000000" 
                                        value={stop_loss_amount_display} 
                                        disabled={auto_rolling && true}
                                        onChange={(e) => this.setState({stop_loss_amount_display: e.target.value})}
                                        onBlur={(e) => this.setInputs("stop_loss_amount", e.target.value)}
                                    />
                                </div>
                            </div>
                            :null
                        }
                        <div className="text-center mt-4">
                            <button className="btn gold mx-auto" onClick={() => auto_rolling ? this.stopAutoRoll() : auto ? this.autoRoll() : this.rollDice()}>
                                { auto ? auto_rolling ? "Stop" : "Auto Roll" + (auto_roll_limit > 0 ? " x " + auto_roll_limit : "") : "Roll Dice"}
                            </button>
                        </div>

                    </div>

                    <Stats gain_history={gain_history}
                        profit={(net_gain/Math.pow(10, 8)).toFixed(8)}
                        wins={win_num} lose={lose_num}
                        bets={game_num} luck={game_num && ((roll_history.reduce((partial_sum, a) => partial_sum + (a ? a[1] : 0), 0)/Math.min(game_num, roll_history.length))*100/parseFloat(chance)*100).toFixed(0)}
                        roll_history={roll_history.slice(-6)}
                    />
                </div>

                {message && <span className="text-danger">{message}</span>}

                <div className="slider-container position-relative mt-5 mx-auto px-4">
                    <div className={"roll-indicator" + (roll > win_value ? " win" : "")} style={{left: roll + "%"}}>{roll}</div>
                    <ReactSlider className="horizontal-slider" 
                        value={win_value}
                        min={2} 
                        max={99} 
                        onChange={(e) => this.setInputs("win_value", e)}
                        withBars
                        disabled={auto_rolling && true}
                    >
                        <div><span>| | |</span></div>
                    </ReactSlider>
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