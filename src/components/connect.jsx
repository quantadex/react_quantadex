import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN, switchTicker } from '../redux/actions/app.jsx'
import { PrivateKey } from "@quantadex/bitsharesjs";
import QTTabBar from './ui/tabBar.jsx'

const container = css`
    text-align: center;
    margin: auto;
    padding: 20px;
    font-size: 12px;

    button {
        color: #fff;
        background-color: transparent;
        border: 2px solid #66d7d7;
        padding: 10px 30px;
        border-radius: 20px;
        margin: 10px;
        cursor: pointer;
    }

    #connect {
        color: #fff;
        text-decoration: underline;
        cursor: pointer;
    }

    &.link {
        color: #66d7d7;
        white-space: nowrap;
        padding-right: 20px;
        margin-right: 20px;
        background: url('/public/images/right-arrow.svg') no-repeat 100% 52%;
    }
    &.link.mobile {
        background: none;
    }

    &.mobile  {
        padding: 0;
        margin: 0;
    }

`

const dialog = css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,0.6);
    font-size: 13px;
    z-index: 999;

    .container {
        position: relative;
        width: auto;
        background-color: #4f637e;
        border-radius: 5px;
        padding: 20px;
        align-self: center;

        .close-btn {
            position: absolute;
            right: 20px;
            cursor: pointer;

            img {
                height: 20px;
            }
        }

        .input-container {
            position: relative;
            background-color: #fff;
            padding: 20px;
            margin: 20px 0;
            color: #999;
            font-size: 15px;

            input {
                color: #333;
                border: 1px solid #999;
                text-align: left;
                padding: 20px;
                width: 100%;
                border-radius: 4px;
            }

            .error {
                position: absolute;
                right: 20px;
                color: #f0185c;
                font-size: 11px;
            }

            button {
                background-color: #66d7d7;
                padding: 10px 20px;
                color: #fff;
                border-radius: 4px;
                margin: 0 190px;
                white-space: nowrap;
                cursor: pointer;
            }
        }
    }

    &.mobile {
        .container {
            width: 100% !important;

            .input-container {
                button {
                    margin: 0;
                    width: 100%;
                }
            }
        }
    }
`

function toggleDialog() {
    const dialog = document.getElementById("connect-dialog")
    if (dialog.style.display == "none") {
        dialog.style.display = "flex"
        document.getElementById("pkey-input").focus()
    } else {
        dialog.style.display = "none"
    }
    
}

class ConnectLink extends Component {
    render() {
        return (
            <div className={container + " link cursor-pointer" + (this.props.isMobile ? " mobile" : "")} onClick={toggleDialog}>CONNECT WALLET</div>
        )
    }
    
} 

class Connect extends Component {
    render() {
        return (
            <div className={container}>
                <p>Connect your <span className="qt-font-bold">Quanta</span> wallet to start trading in this market.</p>
                <button>GET STARTED</button>
                <div>
                    or<br/>
                    <div id="connect" onClick={toggleDialog}>Connect Wallet</div>
                </div>
            </div>
        )
    }
}

class ConnectDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            private_key: "",
            has_input: false,
            authError: false
        };
    }

    handleChange(e) {
		this.setState({private_key: e.target.value, has_input: e.target.value.length > 0})
	}
    
    ConnectWallet() {
        try {
			const pKey = PrivateKey.fromWif(this.state.private_key);
			this.props.dispatch({
                type: LOGIN,
                private_key: this.state.private_key
            });
            this.props.dispatch(switchTicker(this.props.currentTicker))
		} catch(e) {
			console.log(e)
			this.setState({authError: true})
		}
    }

    render() {
        const tabs = {
            names: ["Encrypted Key", "Private Key"],
            selectedTabIndex: 1,
        }

        return (
            <div id="connect-dialog" className={dialog + (this.props.isMobile ? " mobile" : "")} style={{display: "none"}}>
                <div className="container">
                    <div className="close-btn" onClick={toggleDialog}><img src="/public/images/close_btn.svg" /></div>
                    <h4>CONNECT WALLET</h4>
                    <QTTabBar
                        className="underline small static set-width qt-font-bold d-flex justify-content-left"
                        width={120}
                        gutter={10}
                        tabs = {tabs}
                    />
                    <div className="input-container">
                        <label>Private Key</label><br/>
                        <input id="pkey-input" type="text" autoComplete="off" placeholder="Enter private key..."
                        spellCheck="false" onChange={(e) => this.handleChange(e)}/><br/>
                        <span className="error" hidden={!this.state.authError}>Invalid Key</span><br/>
                        <button onClick={this.ConnectWallet.bind(this)}>Connect Wallet</button>
                    </div>
                    <p>Your private keys are not sent to Switcheo. All transactions are signed within your browser <br/>
                        and keys are not exposed over the internet.</p>
                </div>
            </div>
        )
    }
    
} 

const mapStateToProps = (state) => ({
    currentTicker: state.app.currentTicker
});
export default connect(mapStateToProps)(ConnectDialog)
export { Connect, ConnectLink }
