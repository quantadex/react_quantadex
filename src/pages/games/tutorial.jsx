import React, { Component } from 'react'
import { css } from 'emotion'
import { TOGGLE_CONNECT_DIALOG } from "../../redux/actions/app.jsx";

const container = css `
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 100vh;
    color: #777;
    background: rgba(0,0,0,0.5);
    z-index: 999;

    .close-btn {
        position: absolute;
        top: 15px;
        right: 20px;
    }

    .tutorial-container {
        padding: 0;
        background: #fff;
        width: 700px;
        max-width: 100%;
        box-shadow: 0 0 4px rgba(0,0,0,0.5);
    }

    .header {
        background: #636e72;
        color: #fce843;
        font-size: 20px;
        text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(0,0,0,0.17);
    }

    .card {
        width: 120px;
        height: 160px;
        padding: 10px;
        border-radius: 4px;
        background: #f0f3f5;
        border: 0;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
        margin-bottom: 12px;

        .step {
            background: #50e3c2;
            width: 20px;
            height: 20px;
            border-radius: 50px;
            color: #fff;
            margin: 10px auto;
        }

        img {
            margin: auto;
        }
    }
    
    h3 {
        font-weight: bold;
    }

    .info {
        p {
            width: 450px;
            max-width: 100%;
            margin: auto;
        }
    }

    button {
        border-radius: 5px;
        background: #57a38b;
        color: #fff;
        padding: 10px 30px;
        cursor: pointer;
    }

    @media screen and (max-width: 768px) {
        .tutorial-container {
            min-height: 100vh;
        }
    }
`

export default class Tutorial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
        }
    }

    GetStarted = () => {
        return (
            <div className="content get-started p-5">
                <h3 className="mb-4">Easy to get started</h3>
                <div className="d-flex justify-content-center align-items-center ">
                    <div className="card">
                        <div className="step">1</div>
                        Connect<br/> Your Wallet
                        <img src="/public/images/dice/connect.svg" />
                    </div>
                    <div className="card mx-3 mx-sm-5">
                        <div className="step">2</div>
                        Roll<br/> Your Dice
                        <img src="/public/images/dice/dice_gold.svg" />
                    </div>
                    <div className="card">
                        <div className="step">3</div>
                        Collect<br/> Your Winnings
                        <img src="/public/images/dice/coin.svg" />
                    </div>
                </div>

                <h3 className="mt-5 mb-4">Blockchain Security & Fairness</h3>
                <div className="d-flex flex-column flex-sm-row">
                    <div className="w-100">
                        <h4>Trust</h4>
                        <p className="qt-font-small">
                            Dice is operated on smart contract. 
                            Quanta Blockchain ensures asset security, unlockable by your private key. 
                        </p>
                    </div>
                    <div className="w-100">
                        <h4>Fairness</h4>
                        <p className="qt-font-small">
                            Distributed N+1 randomness, 
                            computes outcome from your roll’s unique signature.
                        </p>
                    </div>
                    <div className="w-100">
                        <h4>Proveable</h4>
                        <p className="qt-font-small">
                            Every roll can be proven with the roll’s unique data, 
                            recomputed to produce the same outcome.
                        </p>
                    </div>
                </div>
                <button className="mt-5" onClick={() => this.setState({index: 1})}>NEXT</button>
            </div>
        )
    }

    Info = () => {
        const { dispatch, close, has_account } = this.props
        return (
            <div className="content info p-5">
                <h3>Multi-assets support</h3>
                <p>
                    Supported with Quanta innovative cross-chain technology. 
                    You can use Quanta Dice with QDEX, BTC, ETH, BCH, LTC, along with dozens of other assets listed on QuantaDex.
                </p>

                <h3 className="mt-5">Fees</h3>
                <p>
                    The house holds 3% edge on winnings which contributes to the jackpot, and a 0.01 QDEX platform fee.
                </p>

                <h3 className="mt-5">Referral Program</h3>
                <p>
                    When you refer your friends, you can earn up to 30% of the QDEX fees from your referee’s dice, and QuantaDex activities.
                </p>

                <button className="mt-5" onClick={() => {
                    dispatch({
                        type: TOGGLE_CONNECT_DIALOG,
                        data: has_account ? "connect" : "create"
                    })
                    close()
                }}>GET STARTED</button>
            </div>
        )
    }

    Screens = [<this.GetStarted />, <this.Info />]


    render() {
        const { index } = this.state
        return (
            <div className={container + " d-block d-sm-flex justify-content-center"} >
                <div className="tutorial-container qt-font-small align-self-center position-relative text-center">
                    <div className="header d-flex py-4 px-5">
                        <img src="/public/images/dice/logo.svg" />
                        <div className="w-100 align-self-center">
                            Roll & Win Up to 100X in Cryptos
                        </div>
                    </div>
                    {this.Screens[index]}
                </div>
            </div>
        )
    }
}