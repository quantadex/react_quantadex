import React, { Component } from 'react';

import { css } from 'emotion'

const container = css`
    position: fixed;
    display: flex;
    justify-content: center;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0,0,0,0.7);
    color: #292626;

    .flex {
        display: flex;
        justify-content: center;
    }

    h1 {
        font-weight: bold;
        margin-bottom: 30px;
    }
    .content {
        position: relative;
        max-width: 1300px;
        max-height: 100%;
        align-self: center;
        background-color: #fff;
        border-radius: 7px;
        font-size: 16px;
        line-height: 25px;
        
        #starting-fund {
            display: none;
            justify-content: center;
            width: 100%;
            height: 100%;
            background-color: #fff;
            position: absolute;
            top: 0;
            border-radius: 7px;
            text-align: center;
            
            .flex {
                height: 100%;
            }
            .flex-center {
                align-self: center;
            }
            p {
                font-size: 30px;
                margin: 40px;
                img {
                    vertical-align: bottom;
                    margin-left: 20px;
                }
            }
            .go-back {
                position: absolute;
                top: 0;
                left: 30px;
                cursor: pointer;
            }
            button {
                width: 150px;
            }
        }

        .left {
            width: calc(100% - 500px);
            padding: 75px;
            overflow: auto;

            a {
                float: right;
                margin-top: 20px;
                font-size: 14px;
		        border-bottom: 1px solid #979797;
            }
        }

        .right {
            align-items: center;
            width: 500px;
            background-color: #f7f7f7;
            padding: 75px;
            text-align: center;
            border-radius: 0 7px 7px 0;

            input, button {
                width: 100%;
                border-radius: 2px;
            }
            input {
                background-color: #fff;
                border: 1px solid #c7c7c8;
                padding: 20px;
                color: #292626;
                font-size: 23px;
                line-height: 25px;
                text-align: center;
            }
            
        }
    }
    button {
        margin-top: 10px;
        background-color: #00d8d0;
        color: #fff;
        font-size: 18px;
        border-radius: 2px;
        height: 45px;
        padding: 0 20px 0 20px;
        cursor: pointer;
    }

    .leaderboard-rule {
        padding-left: 75px;
        margin-bottom: 30px;
        
        .header {
            font-size: 20px;
            font-weight: bold;
            color: #00d8d0;
        }
    }

    .leaderboard-rule.balance {
        background: url('/public/images/balance.png') no-repeat;
    }
    .leaderboard-rule.frequency {
        background: url('/public/images/frequency.svg') no-repeat;
    }
    
    .disclaimer {
        border: 1px dashed #00d8d0;
        border-radius: 4px;
        padding: 10px 20px;
    }

    #status-dialog {
        display: none;
        position: absolute;
        bottom: 40px;
        width: 450px;
        background-color: #fff;
        border-radius: 4px;
        text-align: center;
        padding: 30px;
        font-size: 16px;
    }

    #status-dialog::after {
        content: "";
        border: solid 25px transparent;
        border-top-color: #fff;
        position: absolute;
        bottom: -48px;
        left: 200px;
    }
`

class FirstTime extends Component {
    openFund() {
        const el = document.getElementById("starting-fund");
        if (el.style.display !== "block") {
            el.style.display = "block";
        } else {
            el.style.display = "none";
        }
    }

    // acceptFund() {
    //     document.getElementById("first-time").style.display = "none";
    // }

    statusDialog() {
        window.scrollTo(0,document.body.scrollHeight);
        document.getElementsByClassName("content")[0].style.display = "none";
        document.getElementById("status-dialog").style.display = "block";
        document.getElementById("first-time").style.height = "calc(100% - 54px)"
    }

    letsGo() {
        document.getElementById("first-time").style.display = "none";
        window.scrollTo(0,0);
    }


    render() {
        return (
            <div id="first-time" className={container}>
                <div className="content">
                    <div id="username-select" className="flex">
                        <div className="left">
                            <span>Welcome to </span>
                            <h1>QDEX Fantasy</h1>
                            <p>We are currently on the Warm-up Contest where you can win a grand total of $1,000 USD.  
                                The Main Contest will start when this contest ends, which is Jan 18th 2019, with a 
                                grand prize of $2,000 USD.</p>

                            <h1>Two ways to win</h1>
                            <div className="leaderboard-rule balance">
                                <span className="header">Balance Leaderboard</span>
                                <p>Win by having the biggest trading balance at the end of the contest.</p>
                                <b>Prize: $500 USD</b>
                            </div>
                            <div className="leaderboard-rule frequency">
                                <span className="header">Frequency Leaderboard</span>
                                <p>Win by having the highest number of trades at the end of the contest while 
                                    maintaining a balance of at least 8,000 QDEX (80% of initial balance).</p>
                                <b>Prize: $500 USD</b>
                            </div>
                            <div class="disclaimer">
                                You can earn more initial tokens by depositing up to three Ropstein Testnet Ethers 
                                into the QUANTA wallet, and experience QUANTA’s cross-chain technology.  
                            </div>
                            <a>Read Full Rules</a>
                        </div>
                        <div className="right flex">
                            <div>
                                <h1>Confirm your leaderboard username</h1>
                                <p>This is your default username on the leaderboard 
                                    based on the first 10 characters of your public key. 
                                    You may change it to easily identify yourself.</p>
                                <input type="text" />
                                <button onClick={this.openFund}>Confirm</button>
                            </div>
                        </div>
                    </div>

                    <div id="starting-fund">
                        <div className="flex justify-center">
                            <img onClick={this.openFund} className="go-back" src="/public/images/back-button.svg"/>
                            <div class="flex-center">
                                <img src="/public/images/coins.svg" />
                                <p>You have unlocked 10,000 QDEX to start trading.
                                    <img src="/public/images/thumb-up.svg" />
                                </p>
                                <button onClick={this.statusDialog}>Continue</button>
                            </div>
                        </div>
                    </div>

                </div>
                <div id="status-dialog">
                    <h1>The QUANTA status bar</h1>
                    <p>Fair trading means 100% <nobr>on-chain</nobr> token custody, 100% transparent 
                        auditable order-book, 100% <nobr>sub-second</nobr> order matching.</p>
                    <button onClick={this.letsGo}>I like fairness. Let’s GO!</button>
                </div>
            </div>
        )
    }
}

export default FirstTime