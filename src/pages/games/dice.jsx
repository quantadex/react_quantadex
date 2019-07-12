import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import {switchTicker, updateUserData, refreshData, rollDice} from "../../redux/actions/app.jsx";
import ReactSlider from 'react-slider';
import BigInt from 'big-integer'
import Utils from '../../common/utils.js'
import { calculate_profit } from '../../common/dice.js'
import Header from './header.jsx'
import DiceInput from './input.jsx'
import Stats from './stats.jsx'
import Chat from './chat.jsx'
import RollHistory from './roll_history.jsx'
import Toolbar from './toolbar.jsx'
import MobileNav from './mobile_nav.jsx'
import BetInfo from './bet_info.jsx'
import Tutorial from './tutorial.jsx'
import ConnectPrompt from './connect_prompt.jsx'
import Jackpot from './pot.jsx'
import Footer from './footer.jsx'
import Deposit from './deposit.jsx'
import Withdraw from './withdraw.jsx'
import CONFIG from '../../config.js'
import ReactGA from 'react-ga';

const container = css `
    height: 100vh;
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
        width: 700px;
        max-width: 100%;
        box-shadow: 0 0 4px rgba(0,0,0,0.9) inset;
        left: 50%;
        transform: translateX(-50%);
    }

    .roll-indicator {
        position: absolute;
        width: 45px;
        text-align: center;
        font-size: 12px;
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

    .game-main {
        position: relative;
        width: max-content;
        max-width: 100%;
        margin: 0 auto;

        .inputs-container {
            background: #dfe6e9;    
            width: 700px;
            max-width: 100%;
            border: 2px solid #999;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }
    }

    .game-history {
        background: #fff;
        flex-grow: 1;
    }

    #connect-dialog {
        .container {
            background: #57A38B;
            color: #fff;

            button {
                background: #d5c322;
            }

            button:disabled {
                background: #999;
            }
        }
    }

    .content-container {
        max-height: calc(100vh - 80px);
        flex-grow: 1;
    }

    .right-column {
        height: 100%;
    }

    .no-scrollbar {
        overflow: hidden;
        overflow-y: scroll;

		::-webkit-scrollbar {
			width: 6px;
			height: 6px;
		}
		
		::-webkit-scrollbar-track {
		background: transparent; 
		}
		
		::-webkit-scrollbar-thumb {
		background: rgba(0,0,0,0.1); 
		}
		
		::-webkit-scrollbar-thumb:hover {
		background: rgba(0,0,0,0.2); 
		}

		scrollbar-width: thin;
		scrollbar-color: rgba(0,0,0,0.1) transparent;
    }

    .options-menu {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        background: #015249;
        padding: 10px;
        border-radius: 3px;
        z-index: 99;

        .item {
            font-size: 12px;
            cursor: pointer;
            img {
                height: 20px;
                margin-right: 10px;
            }
        }

        .item.inactive {
            opacity: 0.5;
        }
        
    }

    @media screen and (max-width: 992px) {
        .content-container {
            margin-bottom: 50px;
            max-height: calc(100vh - 130px);
        }

        .kb-opened & .content-container {
            margin-bottom: 0px;
            max-height: calc(100vh - 80px);
        }

        .slider-container {
            margin-top: 30px;
            margin-bottom: 30px;
        }

        .right-column {
            padding: 0 10px 0 15px;
        }

        .stats-container {
            margin: 20px 0;
        }

        .chat-container, .game-history {
            position: absolute;
            margin: 0 !important;
            top: 0;
            bottom: 0;
            z-index: 2;
            width: 0%;
            overflow: hidden;
            overflow-y: scroll;
        }

        .chat-container {
            left: 0;
        }

        .game-history {
            right: 0;
        }

        .show-chat {
            .chat-container {
                width: 100%;
            }
        }

        .show-bets {
            .game-history {
                width: 100%;
            }
        }
        .toolbar-container {
            margin-top: 90px;
        }
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance:textfield;
    }
`

class DiceGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false,
            asset: "BTC",
            precision: 5,
            precision_min: "0.00001",
            auto: false,
            auto_rolling: false,
            fund: 100000,
            roll: 50,
            roll_history: Array(100),
            game_num: 0,
            win_num: 0,
            lose_num: 0,
            wagered: 0,
            net_gain: 0,
            gain_history: [0],
            win_value: 51,
            roll_over: true,
            win_value_display: "50",
            amount: 5,
            amount_display: "0.00005",
            unmod_amount: 1,
            multiplier: 1.98039,
            multiplier_display: "2.00",
            chance: 49.99,
            chance_display: "50",
            auto_roll_limit: 0,
            auto_roll_num: 0,
            stop_loss_amount: 0,
            stop_loss_amount_display: "0.00000",
            stop_profit_amount: 0,
            stop_profit_amount_display: "0.00000",
            modify_loss: false,
            modify_loss_amount: 0,
            modify_win: false,
            modify_win_amount: 0,

            deposit: false,
            withdraw: false,

            max_bet: false,
            sounds: true,
            stats: false,
            hot_keys: false,
            show_chat: false,
            show_bets: false,
            bet_info: null,
            shared_message: null,
            show_tutorial: !localStorage.getItem("dice_start"),
            connect_prompt: 0
        }

        this.init = false

        this.setInputs = this.setInputs.bind(this)
        this.showBetDialog = this.showBetDialog.bind(this)
        this.shareToChat = this.shareToChat.bind(this)
        this.handleHotkeys = this.handleHotkeys.bind(this)
        this.eventUpdate = this.eventUpdate.bind(this)

        this.roll_timeout
        this.win_audio = new Audio('/public/audio/win.wav');
        this.loss_audio = new Audio('/public/audio/loss.wav');
    }

    componentDidMount() {
        const { match, location, dispatch } = this.props

        if (!this.init && !window.markets && !window.isApp) {
			const default_ticker = match && match.params.net == "testnet" ? "ETH/USD" : 'ETH/BTC'
            dispatch(switchTicker(default_ticker))
            dispatch(updateUserData())
        } 

        if (!this.init) {
            this.changeSliderSide()
            this.setInputs("amount", 0)
            this.init = true
        }

        if (!window.initAPI) {
            setTimeout(() => {
                this.componentDidMount()
            }, 1000)
            return
        }

        this.setInputs("win_value", this.state.win_value)
        this.setState({init: true})

        if (location.search.includes("bet=")) {
            const arr = location.search.slice(1).split("=")
            this.setState({bet_info: arr[arr.indexOf("bet") + 1]})
        }

        document.addEventListener("keypress", this.handleHotkeys)
        window.addEventListener("focus", this.eventUpdate, false)
    }

    componentWillUnmount() {
        document.removeEventListener("keypress", this.handleHotkeys)
        window.removeEventListener("focus", this.eventUpdate, false)
    }

    componentDidUpdate(prevProps, prevState) {
        const { message, gain_history, roll_history } = this.state
        if (message && message != prevState.message) {
            toast.error(message, {
                position: toast.POSITION.BOTTOM_CENTER
            });
        }
        
        if (gain_history != prevState.gain_history && roll_history[roll_history.length-1]) {
            this.setState({show_roll: true})
            if (this.roll_timeout) clearTimeout(this.roll_timeout)
            this.roll_timeout = setTimeout(() => {
                this.setState({show_roll: false})
            }, 2000)
        }
    }

    eventUpdate() {
		this.props.dispatch(refreshData())
	}

    handleHotkeys(e) {
        if (!this.state.hot_keys) return

        const { auto, auto_rolling, processing } = this.state
        const key = e.code

        switch(key) {
            case "KeyF":
                this.flipBet()
                break
            case "KeyS":
                this.halfBet()
                break
            case "KeyD":
                this.doubleBet()
                break
            case "Space":
                e.preventDefault()
                auto ? auto_rolling ? this.stopAutoRoll() : this.autoRoll() : (!processing && this.rollDice())
                break
        }
    }

    flipBet() {
        const { roll_over } = this.state
        this.setState({roll_over: !roll_over}, () => this.changeSliderSide())
    }

    halfBet() {
        const { auto_rolling, amount, precision } = this.state
        !auto_rolling && this.setInputs("amount", (amount/2/Math.pow(10, precision)))
    }

    doubleBet() {
        const { auto_rolling, amount, precision } = this.state
        !auto_rolling && this.setInputs("amount", (amount*2/Math.pow(10, precision)))
    }

    changeSliderSide() {
        const { roll_over, win_value } = this.state

        this.setInputs("win_value", 101 - win_value)

        const bar = document.getElementsByClassName("bar")
        bar[roll_over ? 0 : 1].classList.remove("gold")
        bar[roll_over ? 1 : 0].classList.add("gold")
    }

    autoRoll() {
        const { amount_display } = this.state
        this.setState({auto_rolling: true, unmod_amount: amount_display, 
            auto_roll_num: 0, game_num: 0, win_num:0, lose_num: 0, roll_history: Array(100)},
            () => this.rollDice()
        )
    }

    stopAutoRoll() {
        const { unmod_amount } = this.state
        this.setState({auto_rolling: false})
        this.setInputs("amount", unmod_amount)
    }

    getRollResult(tx, count) {
        setTimeout(() => {
            fetch(CONFIG.getEnv().API_PATH + `/account?filter_field=operation_history.op_object.tx&filter_value=${tx}`, { mode: "cors" })
            .then(e => e.json())
            .then((e) => {
                const { auto_rolling } = this.state
                if (e.length > 0) {
                    this.props.dispatch(updateUserData());
                    const { outcome, payout, risk, win } = e[0].operation_history.op_object
                    const { roll_history, game_num, auto_roll_num, wagered } = this.state
                    
                    // console.log("result", outcome, payout, risk, win)
                    this.setState({roll: outcome, roll_history: [...roll_history, [outcome, win ? 1 : 0 ]].slice(-100), 
                        game_num: game_num + 1, message: false, auto_roll_num: auto_roll_num + 1, 
                        wagered: wagered + risk.amount, processing: false})
                    win ? this.onWin(payout.amount) : this.onLose(payout.amount)
                    setTimeout(() => {
                        if (auto_rolling) this.rollDice()
                    }, 500)
                } else if (count <= 5) {
                    this.getRollResult(tx, count + 1)
                } else {
                    this.setState({message: "Server error. Unable to get roll result.", processing: false})
                    if (auto_rolling) this.stopAutoRoll()
                }
            })
        }, 500)
    }

    rollDice() {
        const { dispatch, private_key } = this.props
        const { win_value, game_num, amount, fund, roll_history, multiplier, chance,
            auto_rolling, auto_roll_num, auto_roll_limit, wagered, asset, roll_over, connect_prompt } = this.state

        if (auto_rolling && auto_roll_limit > 0 && auto_roll_num == auto_roll_limit) {
            this.stopAutoRoll()
            return this.setState({message: "Auto roll limit reached"})
        }
        if (amount > fund) {
            auto_rolling && this.stopAutoRoll()
            return this.setState({message: "Insufficient Fund"})
        }

        this.setState({message: "", processing: true})

        if (private_key) {
            ReactGA.event({
                category: 'DICE',
                action: "Roll_" + (auto_rolling ? "Auto" : "Manual"),
                label: asset,
                value: chance
            });
            dispatch(rollDice(amount, asset, (roll_over ? ">" : "<") + win_value.toFixed(0))).then(tx => {
                this.getRollResult(tx, 1)
            }).catch(e => {
                this.setState({message: e})
                auto_rolling && this.stopAutoRoll()
            })
            return
        }

        const roll = (Math.random() < 0.5 ? Math.random() * 100 : Math.abs(parseFloat(Math.random().toFixed(6)) - 0.999999) * 100).toFixed(0)
        const win = (roll_over && roll > win_value) || (!roll_over && roll < win_value)
        this.setState({roll, roll_history: [...roll_history, [roll, win ? 1 : 0 ]].slice(-100), connect_prompt: connect_prompt + 1,
            game_num: game_num + 1, message: false, auto_roll_num: auto_roll_num + 1, wagered: wagered + amount},
            () => win ? this.onWin(amount * multiplier - amount) : this.onLose(-1*amount)
        )

        if (connect_prompt + 1 > 9 && auto_rolling) this.stopAutoRoll()

        setTimeout(() => {
            this.setState({processing: false})
            if (this.state.auto_rolling) this.rollDice()
        }, 700)
    }

    onWin(win_amount) {
        const { fund, amount, win_num, auto, auto_rolling, gain_history, precision, precision_min,
            stop_profit_amount, net_gain, modify_win, modify_win_amount, unmod_amount, sounds } = this.state
        const gain = net_gain + win_amount
        
        if (sounds) this.win_audio.play()

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
            amount, modify_loss, modify_loss_amount, unmod_amount, sounds } = this.state
        const loss = net_gain + lose_amount

        if (sounds) this.loss_audio.play()
        
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

        this.setState({fund: fund + lose_amount, lose_num: lose_num + 1, net_gain: loss, 
            gain_history: [...gain_history, loss/Math.pow(10, precision)].slice(-100)})
    }

    setAsset(asset) {
        this.stopAutoRoll()
        const precision = window.assetsBySymbol[asset].precision
        const zero = (0).toFixed(precision)
        const precision_min = (1/Math.pow(10, precision)).toFixed(precision)
        const fund = (this.props.balance[asset] ? this.props.balance[asset].balance : 0) * Math.pow(10, precision)
        
        this.setState({fund, asset, precision, precision_min, unmod_amount: precision_min, 
            stop_loss_amount_display: zero, stop_profit_amount_display: zero,
            wagered: 0, net_gain: 0, roll_history: Array(100), gain_history: [0]}, () => this.setInputs("amount", precision_min))
        localStorage.setItem("dice_asset", asset)
    }

    showBetDialog(id) {
        this.setState({bet_info: id})
        this.props.history.push("?bet=" + id)
    }

    shareToChat(message) {
        this.setState({shared_message: message, bet_info: null, show_chat: true, show_bets: false}, () => this.setState({shared_message: null}))
    }

    setInputs(type, val) {
        const self = this
        const { asset, precision, roll_over, precision_min } = this.state
        const value = parseFloat(val) || 0
        let win_value, chance, multiplier

        function setMultiState(win_value, chance, multiplier) {
            self.setState({win_value: win_value, win_value_display: win_value, 
                chance: chance, chance_display: chance, roll_history: Array(100),
                multiplier: parseFloat(multiplier.toFixed(2)), multiplier_display: multiplier.toFixed(2)})
        }
        
        function setAmount(key, value) {
            if (key == "amount") {
                const mins = {BTC: 0.0001, ETH: 0.0001, TUSD: 0.10, BCH: 0.0001, LTC: 0.0001, QDEX: 0.10, QAIR: 1}
                value = Math.max(value, mins[asset.split("0X")[0]] || 0.0001)
            }
            
            self.setState({[key]: Math.round(value*Math.pow(10, precision)), [key+"_display"]: value.toFixed(precision)})
        }

        switch(type) {
            case "amount":
                return setAmount(type, Math.max(value, precision_min))
            case "win_value":
                win_value = roll_over ? Math.max(4, Math.min(value, 99)) : Math.max(2, Math.min(value, 97))
                chance = roll_over ? 100 - win_value : win_value - 1
                multiplier = (100/chance)*(1-((window.roll_dice_percent_of_fee || 0)/10000))
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
        const { name, userId, private_key, balance, history, dispatch, network } = this.props
        const { init, asset, auto, auto_rolling, fund, roll, roll_history, game_num, win_num, lose_num, wagered,
            net_gain, gain_history, auto_roll_limit, precision, precision_min,
            win_value, roll_over, amount, multiplier, chance,
            win_value_display, amount_display, multiplier_display, chance_display,
            stop_loss_amount_display, stop_profit_amount_display,
            modify_loss, modify_loss_amount, modify_win, modify_win_amount, show_roll,
            max_bet, sounds, stats, hot_keys, show_chat, show_bets, 
            processing, bet_info, shared_message, show_tutorial, connect_prompt,
            deposit, withdraw } = this.state
            
        const profit = (Number(calculate_profit(roll_over, win_value, BigInt(amount || 0), BigInt(window.roll_dice_percent_of_fee || 0)))/Math.pow(10, precision)).toFixed(precision)
        return (
            <div className={container + " d-flex flex-column"}>
                <Header setAsset={this.setAsset.bind(this)} demo_fund={fund}
                    open_deposit={() => this.setState({deposit: true})}
                    open_withdraw={() => this.setState({withdraw: true})}
                />
                <div className={"d-flex position-relative content-container" + (show_chat ? " show-chat" : "") + (show_bets ? " show-bets" : "")}>
                    <Chat user={private_key ? name : ""} network={network}
                        show_chat={show_chat}
                        display_bet={(id) => this.showBetDialog(id)} 
                        shared_message={shared_message} 
                        balance={balance}
                        dispatch={dispatch}
                        toast={toast}
                    />
                    <div className="right-column d-flex flex-column w-100 no-scrollbar">
                        <div className="game-main">
                            <div className="d-flex flex-column flex-lg-row justify-content-center pt-5">
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
                                    <div className="my-4 px-2 px-lg-5">
                                        <div className="d-flex">
                                            <DiceInput 
                                                offset={true}
                                                label="Bet Amount"
                                                type="number"
                                                step={precision_min}
                                                min={precision_min}
                                                value={amount_display}
                                                disabled={auto_rolling && true}
                                                onChange={(e) => this.setState({amount_display: e.target.value})}
                                                onBlur={(e) => this.setInputs("amount", e.target.value)}
                                                asset={asset}
                                                after={
                                                    <div className="after d-flex">
                                                        <div className="mx-1 cursor-pointer" onClick={this.halfBet.bind(this)}>&frac12;</div>
                                                        <div className="mx-1 cursor-pointer" onClick={this.doubleBet.bind(this)}>2x</div>
                                                        { max_bet ?
                                                            <div className="mx-1 cursor-pointer" onClick={() => {
                                                                if(!auto_rolling && balance[asset]) this.setInputs("amount", balance[asset].balance)
                                                            }}>MAX</div>
                                                            : null
                                                        }
                                                        
                                                    </div>
                                                }
                                            />
                                            {auto ?
                                                <DiceInput 
                                                    className="d-none d-lg-block"
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
                                                    className="d-none d-lg-block"
                                                    label="PROFIT ON WIN"
                                                    type="number"
                                                    disabled={true}
                                                    value={profit}
                                                    asset={asset}
                                                />
                                            }
                                            
                                        </div>
                                        <div className="d-flex d-lg-none">
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
                                                    value={profit}
                                                    asset={asset}
                                                />
                                            }
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
                                                    <div className="after cursor-pointer" onClick={this.flipBet.bind(this)}>
                                                        &#8652;
                                                    </div>
                                                }
                                            />
                                        </div>
                                        <div className="d-flex">
                                            <DiceInput 
                                                className="d-none d-lg-block"
                                                label={"Roll " + (roll_over ? "Over" : "Under")}
                                                type="number"
                                                step="1"
                                                min="1"
                                                value={win_value_display} 
                                                disabled={auto_rolling && true}
                                                onChange={(e) => this.setState({win_value_display: Utils.maxPrecision(e.target.value, 3)})}
                                                onBlur={(e) => this.setInputs("win_value", e.target.value)}
                                                after={
                                                    <div className="after cursor-pointer" onClick={this.flipBet.bind(this)}>
                                                        &#8652;
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
                                        <div className="my-4 px-2 px-lg-5">
                                            <div className="d-flex flex-wrap flex-lg-nowrap">
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
                                                    asset={asset}
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
                                                    asset={asset}
                                                />
                                            </div>
                                        </div>
                                        :null
                                    }
                                    <div className="text-center my-5">
                                        <button className="roll-btn gold mx-auto" 
                                            onClick={() => {
                                                if (processing && !(auto && auto_rolling)) return
                                                auto_rolling ? this.stopAutoRoll() : auto ? this.autoRoll() : this.rollDice()
                                            }}>
                                            { auto ? 
                                                auto_rolling ? "Stop" : processing ? "Stopping..." : "Auto Roll" + (auto_roll_limit > 0 ? " x " + auto_roll_limit : "") 
                                                : (processing ? "Rolling..." : "Roll Dice")}
                                        </button>
                                    </div>

                                    <div className="slider-container mx-auto px-4 position-absolute">
                                        <div className="position-relative">
                                            <div className={"roll-indicator" + ((roll_over && roll > win_value) || (!roll_over && roll < win_value)  ? " win" : "") + (show_roll ? " show" : "")} style={{left: roll + "%"}}>{roll}</div>
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
                                </div>

                                <Toolbar 
                                    className="d-flex d-lg-none"
                                    max_bet={max_bet}
                                    sounds={sounds}
                                    stats={stats}
                                    toggleMaxBet={() => this.setState({max_bet: !max_bet})}
                                    toggleSounds={() => this.setState({sounds: !sounds})}
                                    toggleStats={() => this.setState({stats: !stats})}
                                />
                                
                                { stats ? 
                                    <Stats 
                                        gain_history={gain_history}
                                        profit={(net_gain/Math.pow(10, precision)).toFixed(precision)}
                                        wins={win_num} lose={lose_num}
                                        bets={game_num} luck={game_num && ((roll_history.reduce((partial_sum, a) => partial_sum + (a ? a[1] : 0), 0)/Math.min(game_num, roll_history.length))*100/parseFloat(chance)*100).toFixed(0)}
                                        roll_history={roll_history.slice(-6)}
                                        wagered={(wagered/Math.pow(10, precision)).toFixed(precision)}
                                        chart_height={auto ? 268 : 128}
                                    />
                                    : null
                                }
                            </div>

                            <Toolbar 
                                className="d-none d-lg-flex"
                                max_bet={max_bet}
                                sounds={sounds}
                                stats={stats}
                                hot_keys={hot_keys}
                                toggleMaxBet={() => this.setState({max_bet: !max_bet})}
                                toggleSounds={() => this.setState({sounds: !sounds})}
                                toggleStats={() => this.setState({stats: !stats})}
                                toggleHotkeys={() => this.setState({hot_keys: !hot_keys})}
                            />
                        </div>
                        <div className="game-history mt-5 d-flex flex-column">
                            <RollHistory userId={private_key && userId} show_info={(id) => this.showBetDialog(id)} />
                            <Jackpot init={init} asset={asset} precision={precision} />
                            <Footer network={network} />
                        </div>
                        
                    </div>
                </div>
                <MobileNav 
                    show_bets={show_bets} show_chat={show_chat}
                    onClick={(change) => this.setState(change)}
                />
                { bet_info ?
                    <BetInfo id={bet_info} 
                    share={this.shareToChat}
                    close={() => {
                        this.setState({bet_info: null})
                        history.push()
                    }} />
                    : null
                }

                { show_tutorial ?
                    <Tutorial dispatch={dispatch} has_account={name && true} close={() => {
                        this.setState({show_tutorial: false}, localStorage.setItem("dice_start", true))
                    }} />
                    : null
                }

                { connect_prompt > 9 ?
                    <ConnectPrompt dispatch={dispatch} close={() => this.setState({connect_prompt: 0})} />
                    : null
                }

                { deposit ?
                    <Deposit asset={asset} close={() => this.setState({deposit: false})} quantaAddress={name} 
                    isETH={(["ETH", "ERC20"].includes(asset) || asset.split("0X").length == 2)}/>
                    : null
                }

                { withdraw ?
                    <Withdraw asset={asset} close={() => this.setState({withdraw: false})}/>
                    : null
                }

				<ToastContainer />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    network: state.app.network,
    private_key: state.app.private_key,
    name: state.app.name,
    userId: state.app.userId,
    balance: state.app.balance || {}
});

export default connect(mapStateToProps)(DiceGame);