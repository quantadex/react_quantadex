import React, { Component } from 'react';
import Header from './headersimple.jsx';
import QTTableView from './ui/tableView.jsx'
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'
import { Link } from 'react-router-dom'
import QTDeposit from './ui/deposit.jsx'
import QTWithdraw from './ui/withdraw.jsx'
import LeaderboardTable from './leaderboard.jsx'
import MobileHeader from './ui/mobileHeader.jsx';

const container = css`
    background-color:${globalcss.COLOR_BACKGROUND};
    min-height: 100vh;

    .row {
        margin: 0;
    }
    .header-row {
        padding:0 20px;
    }

    .tab-row {
        background-color: rgba(52, 62, 68, 0.4);
        height:72px;
        border-top: 1px solid rgba(255,255,255,0.09);
        border-bottom: 1px solid rgba(255,255,255,0.09);
    
        h4 {
            font-size: 16px;
            margin-top:auto;
            margin-bottom: 0;
            border-bottom: solid 1px #fff;
            padding: 10px 30px;
        } 
    }

    .content {
        margin: auto;
        max-width: 1000px;

        h4 {
            margin: 30px 0;
            font-size: 25px;
            font-family: "SFCompactTextLight";

            #last-updated {
                padding-left: 15px;
                vertical-align: middle;
            }
        }
    }

    table {
        thead {
            font-size: 11px;
            text-transform: uppercase;
        }
        tbody {
            font-size: 14px;
        }
        
        tr {
            border-bottom: 1px solid #333;
        }
    }

    .pad-sides {
        padding: 0 !important;
    }

    .banner {
        padding: 40px 0;
        border-bottom: 1px solid #444;

        .headline {
            display: inline-block;
            padding-left: 70px;
            background: url('/public/images/trophy-blue.svg') no-repeat;
            font-size: 22px;
        }

        .leaderboard-actions {
            display: flex;
            justify-content: space-between;
            width: 300px;
            margin-top: 15px;
    
            a {
                text-align: center;
                font-size: 14px;
                color: rgba(255,255,255,0.7);
                background-color: transparent;
                border: 1px solid rgba(255,255,255,0.7);
                border-radius: 2px;
                padding: 10px;
                flex: 0 0 48%;
                white-space: nowrap;
                cursor: pointer;
            }
        }
        
        .leaderboard-share {
            margin: 27px 0 0 25px;
            font-size: 12px;
            width: 70px;
        }
    }

    &.mobile {
        .tab-row, .headline {
            display: none !important;
        }
        .banner {
            display: flex;
            flex-direction: row-reverse;
            padding: 0;
            border: 0;
        }
        .content {
            padding: 15px;
        }
        h4 {
            font-size: 18px;
            margin: 10px 0;
            span {
                display: block;
                padding: 0 !important;
            }
        }
    }
`

const screenWidth = screen.width

class Leaderboard extends Component {
    constructor(props) {
		super(props);
		this.state = {
			isMobile: screenWidth <= 992
		};
      }

    render() {
        return(
            <div className={container + (this.state.isMobile ? " mobile" : "")}>
                {this.state.isMobile ?
                    <MobileHeader />
                    :
                    <div className="row header-row">
                        <Header />
                    </div>
                }
                
                <div className="row tab-row d-flex flex-column align-items-center">
                    <h4>Leaderboard</h4>
                </div>

                <div className="content">
                    <div className="banner">
                        <div className="headline qt-font-light">
                            Participate on the Paper Trading Contest <br/> and <b>win up to $50,000 USD*</b>
                        </div>

                        <div className="leaderboard-share d-flex justify-content-between float-right">
                            <span>Share</span>
                            <a><img src="/public/images/share/twitter.svg" /></a>
                            <a><img src="/public/images/share/fbook.svg" /></a>
                        </div>
                        <div className="leaderboard-actions float-right">
                            <a href="https://t.me/quantaexchange" target="_blank">Join Chat</a>
                            <a href="https://quantadex.com/fantasy" target="_blank">Read Rules</a>
					    </div>
                    </div>
                    <LeaderboardTable tableOnly={true} complete={true}/>
                </div>
                
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key,
});


export default connect(mapStateToProps)(Leaderboard);