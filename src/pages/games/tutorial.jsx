import React, { Component } from 'react'
import { css } from 'emotion'

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
    
    h4 {
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
                <h4 className="mb-4">Easy to get started</h4>
                <div className="d-flex justify-content-center align-items-center ">
                    <div className="card">
                        <div className="step">1</div>
                        Connect<br/> Your Wallet
                        <img src="/public/images/dice/connect.svg" />
                    </div>
                    <div className="card mx-3 mx-sm-5">
                        <div className="step">2</div>
                        Roll<br/> Your Dice
                        <img src="/public/images/dice/dice.svg" />
                    </div>
                    <div className="card">
                        <div className="step">3</div>
                        Collect<br/> Your Winnings
                        <img src="/public/images/dice/coin.svg" />
                    </div>
                </div>

                <h4 className="mt-5 mb-4">Blockchain Security & Fairness</h4>
                <div className="d-flex flex-column flex-sm-row">
                    <div className="w-100">
                        <h5>Trust</h5>
                        <p className="qt-font-extra-small">
                            Dice is operated on smart contract. 
                            Quanta Blockchain ensures asset security, unlockable by your private key. 
                        </p>
                    </div>
                    <div className="w-100">
                        <h5>Fairness</h5>
                        <p className="qt-font-extra-small">
                            Distributed N+1 randomness, 
                            computes outcome from your roll’s unique signature.
                        </p>
                    </div>
                    <div className="w-100">
                        <h5>Proveable</h5>
                        <p className="qt-font-extra-small">
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
        return (
            <div className="content info p-5">
                <h4>Multi-assets support</h4>
                <p>
                    Supported with Quanta innovative cross-chain technology. 
                    You can use Quanta Dice with QDEX, BTC, ETH, BCH, LTC, along with dozens of other assets listed on QuantaDex.
                </p>

                <h4 className="mt-5">Fees</h4>
                <p>
                    <b>4%</b> Standard Fees<br/>
                    Fees are deducted from the payout in the asset you put at risk.<br/>
                    <br/>
                    Save <b>50%</b> on fees when paid in QDEX.<br/>
                    Maintain your QDEX balance above the fees * exchange rates & the system will automatic deduct the discounted fees.
                </p>

                <h4 className="mt-5">Referral Program</h4>
                <p>
                    When you refer your friends, you can earn up to 30% of the QDEX fees from your referee’s dice, and QuantaDex activities.
                </p>

                <button className="mt-5" onClick={this.props.close}>GET STARTED</button>
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
                            Play & Win Up to 99X in Cryptos
                        </div>
                    </div>
                    {this.Screens[index]}
                </div>
            </div>
        )
    }
}