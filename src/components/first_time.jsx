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

    h1 {
        font-weight: bold;
        margin-bottom: 30px;
    }
    .content {
        display: flex;
        max-width: 1300px;
        max-height: 100%;
        align-self: center;
        background-color: #fff;
        border-radius: 7px;
        color: #292626;
        font-size: 16px;
        line-height: 25px;

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
            display: flex;
            align-items: center;
            width: 500px;
            background-color: #f7f7f7;
            padding: 75px;
            text-align: center;
            border-radius: 0 7px 7px 0;

            input, button {
                width: 100%;
                border-radius: 2px;
                height: 45px;
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
            button {
                margin-top: 10px;
                background-color: #00d8d0;
                color: #fff;
                font-size: 18px;
            }
        }
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
`

class FirstTime extends Component {
    render() {
        return (
            <div className={container}>
                <div className="content">
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
                    <div className="right">
                        <div>
                            <h1>Confirm your leaderboard username</h1>
                            <p>This is your default username on the leaderboard 
                                based on the first 10 characters of your public key. 
                                You may change it to easily identify yourself.</p>
                            <input type="text" />
                            <button>Confirm</button>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default FirstTime