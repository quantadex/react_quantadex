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
    z-index: 999;

    .flex {
        display: flex;
        justify-content: center;
    }

    h1 {
        font-weight: bold;
        margin-bottom: 30px;
    }
    .content-ft {
        position: relative;
        max-width: 1100px;
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
                max-width: 520px;
            }
            p {
                font-size: 18px;
                margin: 40px;
            }
            h1 {
                margin-top: 30px;
            }
            h1 img {
                vertical-align: bottom;
                margin-left: 20px;
            }
            .go-back {
                position: absolute;
                top: 5px;
                left: 30px;
                cursor: pointer;
            }
            button {
                width: 150px;
            }
            a {
                color: #5045d2;
                text-decoration: underline;
            }
        }

        .left {
            padding: 100px 75px;
            padding-bottom: 35px;
            overflow: auto;
            p {
                font-size: 18px;
            }
            a {
                float: right;
                color: #292626;
                margin-top: 20px;
                font-size: 14px;
		        border-bottom: 1px solid #979797;
            }
        }

        .right {
            align-items: center;
            background-color: #f7f7f7;
            padding: 100px 75px;
            text-align: left;
            border-radius: 0 7px 7px 0;

            button {
                width: 150px;
                margin-left: 70px;
                border-radius: 2px;
            }
        }
    }
    button {
        margin-top: 10px;
        background-color: #5045d2;
        color: #fff;
        font-size: 18px;
        border-radius: 2px;
        height: 45px;
        padding: 0 20px 0 20px;
        cursor: pointer;
    }

    .leaderboard-rule {
        padding-left: 70px;
        margin-bottom: 30px;
        
        .header {
            font-size: 20px;
            font-weight: bold;
            color: #5045d2;
        }
    }

    .leaderboard-rule.balance {
        background: url(${devicePath('public/images/balance.png')}) no-repeat;
    }
    .leaderboard-rule.frequency {
        background: url(${devicePath('public/images/frequency.svg')}) no-repeat;
    }
    
    .disclaimer {
        font-size: 12px;
		letter-spacing: -0.3px;
    }
    .disclaimer::before {
		content: '*';
		height: 100px;
		float: left;
		padding-right: 5px;
		font-size: 15px;
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

    &.mobile {
        height: calc(100% - 32px) !important;
        overflow: auto;
        
        .content-ft {
            width: 100%;
            max-width: 100%;
            height: 100%;
            border-radius: 0;
            .left, .right {
                overflow: hidden;
                padding: 40px 20px;
                border-radius: 0;
            }
            img {
                max-width: 90%;
            }
            button {
                margin: auto;
                width: 100%;
            }

            .go-back {
                width: 50px;
                top: 0 !important;
                left: 15px !important;
            }
        }

        #contest-rules {
            flex-flow: column;
        }

        #starting-fund {
            padding: 20px;
        }

        #status-dialog {
            width: calc(100% - 20px);
        }

        #status-dialog::after {
            left: calc(50% - 25px);
        }
    }
`

class FirstTime extends Component {
    openFund(isMobile) {
        const el = document.getElementById("starting-fund");
        const rl = document.getElementById("contest-rules");
        if (el.style.display !== "block") {
            el.style.display = "block";
            if (isMobile) {
                rl.classList.remove("d-flex")
                rl.classList.add("d-none")
            }
        } else {
            el.style.display = "none";
            if (isMobile) {
                rl.classList.remove("d-none")
                rl.classList.add("d-flex")
            }
        }

        
    }

    // acceptFund() {
    //     document.getElementById("first-time").style.display = "none";
    // }

    statusDialog() {
        // window.scrollTo(0,document.body.scrollHeight);
        document.getElementsByClassName("content-ft")[0].style.display = "none";
        document.getElementById("status-dialog").style.display = "block";
        document.getElementById("first-time").style.height = "calc(100% - 54px)"
    }

    letsGo() {
        document.getElementById("first-time").style.display = "none";
        // window.scrollTo(0,0);
        localStorage.setItem("firstTimeComplete", true);
    }


    render() {
        return (
            <div id="first-time" className={container + (this.props.mobile ? " mobile" : "")}>
                <div className="content-ft">
                    <div id="contest-rules" className="d-flex">
                        <div className="left">
                            <h2>Welcome to </h2>
                            <img src={devicePath("public/images/qdex-fantasy.svg")} alt="QDEX Fantasy" />
                            <p style={{margin: '30px 0 30px'}}>We are currently on the Warm-up Contest where 
                            you can win a grand prize $500 USD + 40,000 QDEX tokens, with total value of $12,500 USD*.</p>

                            <p style={{margin: '30px 0 40px'}}>The Main Contest will start when this contest ends, 
                            which is Jan 18th 2019, with a grand prize of $1000 USD + 60,000 QDEX tokens.</p>

                            <div class="disclaimer">
                                QDEX token is currently valued at $0.3USD based on pre-sale value, and is redeemable upon MainNet launch.  
                                Actual QDEX token value will depend on market pricing at time of redemption.     
                            </div>
                            <a href="https://quantadex.com/fantasy" target="_blank">Full Details</a>
                        </div>
                        <div className="right">
                            <h1>Two ways to win</h1>
                            <div className="leaderboard-rule balance">
                                <span className="header">Balance Leaderboard</span>
                                <p>Win by having the biggest trading balance at the end of the contest.</p>
                                <b>Prize: $500 USD + 20,000 QDEX tokens*</b>
                            </div>
                            <div className="leaderboard-rule frequency">
                                <span className="header">Frequency Leaderboard</span>
                                <p>Win by having the highest number of trades at the end of the contest while 
                                    maintaining a balance of at least 8,000 QDEX (80% of initial balance).</p>
                                <b>Prize: $500 USD + 20,000 QDEX tokens*</b>
                            </div>
                             <button onClick={() => this.openFund(this.props.mobile)}>Continue</button>
                        </div>
                    </div>

                    <div id="starting-fund">
                        <div className="flex justify-center">
                            <img onClick={() => this.openFund(this.props.mobile)} className="go-back" src={devicePath("public/images/back-button.svg")}/>
                            <div class="flex-center">
                                <img src={devicePath("public/images/coins.svg")} />
                                <h1>You have unlocked 10,000 QDEX to start trading.
                                    <img src={devicePath("public/images/thumb-up.svg")} />
                                </h1>
                                {/* <p>You can earn more initial tokens by depositing up to three Ropstein 
                                    Testnet Ethers into the QUANTA wallet, and experience QUANTA’s cross-chain 
                                    technology. <a>Learn more.</a> </p> */}
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