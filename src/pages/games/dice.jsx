import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import {switchTicker, updateUserData, rollDice} from "../../redux/actions/app.jsx";
import ReactSlider from 'react-slider';
import Utils from '../../common/utils.js'
import Header from './header.jsx'
import DiceInput from './input.jsx'
import Stats from './stats.jsx'
import Chat from './chat.jsx'
import CONFIG from '../../config.js'
import lodash from 'lodash';

const container = css `
    min-height: 100vh;
    background: #125750;
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
        left: -18px;
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
        background: #e17055;
    }

    .slider-container {
        background: #377a5d;
        margin-top: 50px;
        color: #eee;
        border-radius: 100px;
        width: 100%;
        box-shadow: 0 0 4px rgba(0,0,0,0.9) inset;
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
        opacity: 0;
        transition: left 0.3s, opacity 0.3s;
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

    .roll-indicator.show {
        opacity: 1;
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
        width: 700px;
        border: 2px solid #999;
        border-radius: 5px;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0,0,0,0.5);
    }

    .auto-inactive {
        background: #ccc;
    }

    .auto-inactive:hover {
        background: #ddd;
    }

    .gold {
        background-image: rgb(211,174,13) !important;
        background-image: linear-gradient(108deg, rgba(211,174,13,1) 45%, rgba(255,237,71,1) 55%, rgba(211,174,13,1) 90%) !important;
        color: #8f7709;
        text-shadow: 1px 1px rgba(255,237,71,1);
        background-position-x: 0px;
        transition: background-position-x 0.1s;
    }

    .roll-btn.gold:hover {
        background-position-x: -60px;
    }

    .roll-btn.gold:active {
        background-position-x: -50px !important;
    }

    .roll-btn {
        text-transform: uppercase;
        width: 300px;
        min-width: 170px;
        font-size: 18px;
        padding: 10px;
        box-shadow: 0 2px 3px;
    }

    .roll-btn:active {
        box-shadow: 0 2px 2px;
    }

    #connect-dialog {
        background-color: rgba(0,0,0,0.2);

        .container {
            background: #57A38B;
        }
    }
`

class DiceGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            asset: null,
            precision: 8,
            precision_min: "0.00000001",
            auto: false,
            auto_rolling: false,
            fund: 100000000,
            roll: 50,
            roll_history: Array(100),
            game_num: 0,
            win_num: 0,
            lose_num: 0,
            wagered: 0,
            net_gain: 0,
            gain_history: [0],
            win_value: 50,
            roll_over: true,
            win_value_display: "50",
            amount: 1,
            amount_display: "0.00000001",
            unmod_amount: 1,
            multiplier: 1.98039,
            multiplier_display: "2.000",
            chance: 49.99,
            chance_display: "50",
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
        this.roll_timeout
    }

    componentDidMount() {
        const { match, dispatch } = this.props

        if (!window.markets && !window.isApp) {
			const default_ticker = match && match.params.net == "testnet" ? "ETH/USD" : 'ETH/BTC'
            dispatch(switchTicker(default_ticker));
            dispatch(updateUserData());
        } 

        this.changeSliderSide()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.message && this.state.message != prevState.message) {
            toast.error(this.state.message, {
                position: toast.POSITION.BOTTOM_CENTER
            });
        }

        if (this.state.gain_history != prevState.gain_history) {
            this.setState({show_roll: true})
            if (this.roll_timeout) clearTimeout(this.roll_timeout)
            this.roll_timeout = setTimeout(() => {
                this.setState({show_roll: false})
            }, 2000)
        }
    }

    changeSliderSide() {
        const { roll_over } = this.state

        const bar = document.getElementsByClassName("bar")
        bar[roll_over ? 0 : 1].classList.remove("gold")
        bar[roll_over ? 1 : 0].classList.add("gold")
    }

    autoRoll() {
        const { amount_display } = this.state
        // const auto_rolling = setInterval(() => {
        //     this.rollDice()
        // }, 700)
        this.setState({auto_rolling: true, unmod_amount: amount_display, 
            auto_roll_num: 0, game_num: 0, win_num:0, lose_num: 0, roll_history: Array(100) })
        setTimeout(() => {
            this.rollDice()
        }, 0)
    }

    stopAutoRoll() {
        const { unmod_amount } = this.state
        // clearInterval(auto_rolling)
        // this.setState({auto_rolling: false})
        this.setState({auto_rolling: false})
        this.setInputs("amount", unmod_amount)
    }

    getRollResult(tx, count) {
        setTimeout(() => {
            fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_history.op_object.tx&filter_value=${tx}`, { mode: "cors" })
            .then(e => e.json())
            .then((e) => {
                // console.log('result', e)
                if (e.length > 0) {
                    this.props.dispatch(updateUserData());
                    const { outcome, payout, risk, win } = e[0].operation_history.op_object
                    const { roll_history, game_num, auto_roll_num, wagered } = this.state
                    
                    console.log("result", outcome, payout, risk, win)
                    this.setState({roll: outcome, roll_history: [...roll_history, [outcome, win ? 1 : 0 ]].slice(-100), 
                        game_num: game_num + 1, message: false, auto_roll_num: auto_roll_num + 1, wagered: wagered + risk.amount})
                    win ? this.onWin(payout.amount) : this.onLose(payout.amount)
                    setTimeout(() => {
                        if (this.state.auto_rolling) this.rollDice()
                    }, 500)
                } else if (count <= 5) {
                    this.getRollResult(tx, count + 1)
                } else {
                    throw "Can't get roll result"
                }
            })
        }, 500)
    }

    rollDice() {
        const { dispatch, private_key } = this.props
        const { win_value, game_num, amount, fund, roll_history, multiplier,
            auto_rolling, auto_roll_num, auto_roll_limit, wagered, asset, roll_over } = this.state
            
        if (auto_rolling && auto_roll_limit > 0 && auto_roll_num == auto_roll_limit) {
            this.stopAutoRoll()
            return this.setState({message: "Auto roll limit reached"})
        }
        if (amount > fund) {
            this.stopAutoRoll()
            return this.setState({message: "Insufficient Fund"})
        }

        if (private_key) {
            dispatch(rollDice(amount, asset, (roll_over ? ">" : "<") + win_value.toFixed(0))).then(tx => {
                console.log("tx", tx)
                this.getRollResult(tx, 1)
            })
            return
        }

        const roll = (Math.random() < 0.5 ? Math.random() * 100 : Math.abs(parseFloat(Math.random().toFixed(6)) - 0.999999) * 100).toFixed(0)
        this.setState({fund: fund - amount, roll, roll_history: [...roll_history, [roll, roll > win_value ? 1 : 0 ]].slice(-100), 
            game_num: game_num + 1, message: false, auto_roll_num: auto_roll_num + 1, wagered: wagered + amount})
        setTimeout(() => {
            roll > win_value ? this.onWin(amount * multiplier) : this.onLose(-1*amount)
        }, 0)

        setTimeout(() => {
            if (this.state.auto_rolling) this.rollDice()
        }, 700)
    }

    onWin(win_amount) {
        const { fund, amount, win_num, auto, auto_rolling, gain_history, precision, precision_min,
            stop_profit_amount, net_gain, modify_win, modify_win_amount, unmod_amount } = this.state
        const gain = net_gain + win_amount

        if (stop_profit_amount > 0 && gain >= stop_profit_amount) {
            this.stopAutoRoll()
            this.setState({message: "Exceeded profit limit"})
        }

        if (auto && auto_rolling) {
            if (modify_win) {
                this.setInputs("amount", Math.max((amount + (amount * (modify_win_amount/100)))/Math.pow(10, precision), precision_min))
            } else {
                this.setInputs("amount", unmod_amount)
            }
        }
        

        this.setState({fund: fund + win_amount, net_gain: gain, 
            gain_history: [...gain_history, gain/Math.pow(10, precision)].slice(-100), win_num: win_num + 1})
    }

    onLose(lose_amount) {
        const { lose_num, stop_loss_amount, net_gain, auto, auto_rolling, gain_history, fund, precision, precision_min,
            amount, modify_loss, modify_loss_amount, unmod_amount } = this.state
        const loss = net_gain + lose_amount
        
        if (stop_loss_amount > 0 && loss <= (stop_loss_amount * (-1))) {
            this.stopAutoRoll()
            this.setState({message: "Exceeded loss limit"})
        }

        if (auto && auto_rolling) {
            if (modify_loss) {
                this.setInputs("amount", Math.max((amount + (amount * (modify_loss_amount/100)))/Math.pow(10, precision), precision_min))
            } else {
                this.setInputs("amount", unmod_amount)
            }
        }

        this.setState({lose_num: lose_num + 1, net_gain: loss, 
            gain_history: [...gain_history, loss/Math.pow(10, precision)].slice(-100)})
    }

    setAsset(asset) {
        const precision = window.assets[asset].precision
        const zero = (0).toFixed(precision)
        const precision_min = (1/Math.pow(10, precision)).toFixed(precision)
        this.setState({asset, precision, precision_min, amount: 1,
            amount_display: precision_min, stop_loss_amount_display: zero, stop_profit_amount_display: zero})
    }

    setInputs(type, val) {
        const self = this
        const { precision, roll_over } = this.state
        const value = parseFloat(val) || 0
        let win_value, chance, multiplier

        function setMultiState(win_value, chance, multiplier) {
            self.setState({win_value: win_value, win_value_display: win_value, 
                chance: chance, chance_display: chance, 
                multiplier: parseFloat(multiplier.toFixed(3)), multiplier_display: multiplier.toFixed(3)})
        }
        
        function setAmount(key, value) {
            self.setState({[key]: Math.round(value*Math.pow(10, precision)), [key+"_display"]: value.toFixed(precision)})
        }

        switch(type) {
            case "amount":
                return setAmount(type, value)
            case "win_value":
                win_value = value < 1 ? 1 : Math.min(value, 99)
                chance = roll_over ? 100 - win_value : win_value
                multiplier = 100/chance
                return setMultiState(win_value, chance, multiplier)
            // case "multiplier":
            //     multiplier = value < 1.01 ? 1.01 : Math.min(value, 99)
            //     chance = 100/(multiplier/0.99)
            //     win_value = 100 - chance
            //     return setMultiState(win_value, chance, multiplier)
            // case "chance":
            //     chance = value < 1 ? 1 : Math.min(value, 98)
            //     win_value = 100 - chance
            //     multiplier = 100/chance*0.99
            //     return setMultiState(win_value, chance, multiplier)
            case "stop_loss_amount":
                return setAmount(type, value)
            case "stop_profit_amount":
                return setAmount(type, value)
        }
    }

    render() {
        const { name, balance } = this.props
        const { asset, auto, auto_rolling, fund, roll, roll_history, game_num, win_num, lose_num, wagered,
            message, net_gain, gain_history, auto_roll_limit, precision, precision_min,
            win_value, roll_over, amount, multiplier, chance,
            win_value_display, amount_display, multiplier_display, chance_display,
            stop_loss_amount_display, stop_profit_amount_display,
            modify_loss, modify_loss_amount, modify_win, modify_win_amount, show_roll } = this.state
        const asset_symbol = window.assets && window.assets[asset] ? window.assets[asset].symbol : ""
        return (
            <div className={container + " d-flex flex-column"}>
                <Header setAsset={this.setAsset.bind(this)}/>
                <div className="d-flex">
                    <Chat user={name} />
                    <div className="mx-auto">
                        <div className="d-flex justify-content-center pt-5">
                            <div className="inputs-container qt-font-normal">
                                <div className="d-flex justify-content-around text-center text-secondary">
                                    <div className={"cursor-pointer w-100 py-3" + (auto ?  " auto-inactive" : "")}
                                        onClick={() => {
                                            if (auto_rolling) this.stopAutoRoll()
                                            this.setState({auto: false})
                                        }}>MANUAL BETTING</div>
                                    <div className={"cursor-pointer w-100 py-3" + (auto ?  "" : " auto-inactive")}
                                        onClick={() => this.setState({auto: true})}>AUTOMATED BETTING</div>
                                </div>
                                <div className="py-4 px-5">
                                    <div className="d-flex">
                                        <DiceInput 
                                            label="Bet Amount"
                                            type="number"
                                            step={precision_min}
                                            min={precision_min}
                                            value={amount_display}
                                            disabled={auto_rolling && true}
                                            onChange={(e) => this.setState({amount_display: e.target.value})}
                                            onBlur={(e) => this.setInputs("amount", e.target.value)}
                                            after={
                                                <div className="after d-flex">
                                                    <div className="mx-1" onClick={() => {
                                                        this.setInputs("amount", (amount/2/Math.pow(10, precision)))
                                                    }}>&frac12;</div>
                                                    <div className="mx-1" onClick={() => {
                                                        this.setInputs("amount", (amount*2/Math.pow(10, precision)))
                                                    }}>2x</div>
                                                    <div className="mx-1" onClick={() => {
                                                        if(balance[asset]) this.setInputs("amount", balance[asset].balance)
                                                    }}>MAX</div>
                                                </div>
                                            }
                                        />
                                        {auto ?
                                            <DiceInput 
                                                label="Number of Rolls"
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
                                                after={
                                                    <div className="after">
                                                        {auto_roll_limit == 0 ? "∞" : ""}
                                                    </div>
                                                }
                                            />
                                            :
                                            <DiceInput 
                                                label="PROFIT ON WIN"
                                                type="number"
                                                disabled={true}
                                                value={(((amount * multiplier) - amount) / Math.pow(10, precision)).toFixed(precision)}
                                                after={
                                                    <div className="after">
                                                        {asset_symbol}
                                                    </div>
                                                }
                                            />
                                        }
                                        
                                    </div>
                                    <div className="d-flex">
                                        <DiceInput 
                                            label={"Roll " + (roll_over ? "Over" : "Under")}
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={win_value_display} 
                                            disabled={auto_rolling && true}
                                            onChange={(e) => this.setState({win_value_display: Utils.maxPrecision(e.target.value, 3)})}
                                            onBlur={(e) => this.setInputs("win_value", e.target.value)}
                                            after={
                                                <div className="after" onClick={() => {
                                                    this.setState({roll_over: !roll_over}, () => this.changeSliderSide())
                                                    this.setInputs("win_value", 100 - win_value)
                                                }}>
                                                    {"<>"}
                                                </div>
                                            }
                                        />
                                        <DiceInput 
                                            label="Payout"
                                            type="number"
                                            step="1"
                                            min="2"
                                            value={multiplier_display}
                                            disabled={true}
                                            onChange={(e) => this.setState({multiplier_display: Utils.maxPrecision(e.target.value, 4)})}
                                            onBlur={(e) => this.setInputs("multiplier", e.target.value)}
                                            after={
                                                <div className="after">
                                                    x
                                                </div>
                                            }
                                        />
                                        <DiceInput 
                                            label="Win Chance"
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={chance_display} 
                                            disabled={true}
                                            onChange={(e) => this.setState({chance_display: Utils.maxPrecision(e.target.value, 3)})}
                                            onBlur={(e) => this.setInputs("chance", e.target.value)}
                                            after={
                                                <div className="after">
                                                    %
                                                </div>
                                            }
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
                                                after={
                                                    <div className="after">
                                                        %
                                                    </div>
                                                }
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
                                                after={
                                                    <div className="after">
                                                        %
                                                    </div>
                                                }
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
                                                after={
                                                    <div className="after">
                                                        {asset_symbol}
                                                    </div>
                                                }
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
                                                after={
                                                    <div className="after">
                                                        {asset_symbol}
                                                    </div>
                                                }
                                            />
                                        </div>
                                    </div>
                                    :null
                                }
                                <div className="text-center mt-4">
                                    <button className="roll-btn gold mx-auto" onClick={() => auto_rolling ? this.stopAutoRoll() : auto ? this.autoRoll() : this.rollDice()}>
                                        { auto ? auto_rolling ? "Stop" : "Auto Roll" + (auto_roll_limit > 0 ? " x " + auto_roll_limit : "") : "Roll Dice"}
                                    </button>
                                </div>

                            </div>

                            <Stats gain_history={gain_history}
                                profit={(net_gain/Math.pow(10, precision)).toFixed(precision)}
                                wins={win_num} lose={lose_num}
                                bets={game_num} luck={game_num && ((roll_history.reduce((partial_sum, a) => partial_sum + (a ? a[1] : 0), 0)/Math.min(game_num, roll_history.length))*100/parseFloat(chance)*100).toFixed(0)}
                                roll_history={roll_history.slice(-6)}
                                wagered={(wagered/Math.pow(10, precision)).toFixed(precision)}
                                chart_height={auto ? 310 : 140}
                            />
                        </div>

                        <div className="slider-container position-relative mx-auto px-4">
                            <div className="position-relative">
                                <div className={"roll-indicator" + (roll >= win_value ? " win" : "") + (show_roll ? " show" : "")} style={{left: roll + "%"}}>{roll}</div>
                                <ReactSlider className="horizontal-slider" 
                                    value={win_value}
                                    min={1} 
                                    max={99} 
                                    onChange={(e) => this.setInputs("win_value", e)}
                                    withBars
                                    disabled={auto_rolling && true}
                                >
                                    <div><span>| | |</span></div>
                                </ReactSlider>
                            </div>
                        </div>

                        {/* {message && <span className="text-danger">{message}</span>} */}


                        {/* <div className="mt-5">
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
                        </div> */}
                        {/* <button className="btn" onClick={() => this.setState({fund: fund + 100000000})}>Add BTC</button> */}
                    </div>
                </div>
				<ToastContainer />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
        private_key: state.app.private_key,
        name: state.app.name,
        balance: state.app.balance ? lodash.keyBy(state.app.balance, "asset") : {}
	});

export default connect(mapStateToProps)(DiceGame);