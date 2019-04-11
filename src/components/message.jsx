import React, { Component } from 'react';
import Header from './headersimple.jsx';
import { connect } from 'react-redux'
import { css } from 'emotion'
import globalcss from './global-css.js'
import MobileHeader from './ui/mobileHeader.jsx';
import QTTabBar from './ui/tabBar.jsx'
import { PrivateKey, PublicKey, Signature } from "@quantadex/bitsharesjs";

const Buffer = require("safe-buffer").Buffer;

const container = css`
    background-color:${globalcss.COLOR_BACKGROUND};
    min-height: 100vh;

    .header-row {
        padding:0 20px;
    }

    .tab-row {
        background-color: rgba(52, 62, 68, 0.4);
        height:72px;
        border-top: 1px solid rgba(255,255,255,0.09);
        border-bottom: 1px solid rgba(255,255,255,0.09);

        .tabs {
            font-size: 14px;
            margin-top:auto;
        }
    }

    .content {
        width: 100%;
        max-width: 1000px;
        margin: 20px auto 0;

        textarea {
            width: 100%;
            min-height: 160px;
            border-radius: 4px;
            background: #293135;
            border: 1px solid #222;
            color: #fff;
            padding: 10px;
        }

        button {
            padding: 5px 20px;
            border-radius: 2px;
        }
        button:hover {
            box-shadow: 0 0 5px #777;
        }
        button:disabled, button:disabled:hover {
            background: #444;
            color: #999;
            box-shadow: none;
        }
    }

    .verify {
        padding: 5px 10px;
    }
    .verify.true {
        background-color: green;
    }
    .verify.false {
        background-color: red;
    }

    &.mobile {
        background-color: transparent;
        min-height: unset;
        padding: 0;
        .row {
            margin: 0;
        }
        
        .content {
            padding: 0 10px;
        }
    }
`

class Message extends Component {
    constructor(props) {
        super(props)
        this.state = {
          selectedTabIndex: 0,
          signedMsg: "",
          isVerified: null,
        }

        this.signMessage = this.signMessage.bind(this)
        this.verifyMessage = this.verifyMessage.bind(this)
        this.Sign = this.Sign.bind(this)
        this.Verify = this.Verify.bind(this)
    }

    handleSwitch(index) {
        this.setState({selectedTabIndex: index, isVerified: null})
    }

    selectText(e) {
        e.target.select()
    }

    signMessage() {
        const msg = document.getElementById("message").value
        const sig = Signature.signBuffer(Buffer.from(msg), PrivateKey.fromWif(this.props.private_key)).toHex()
        const timestamp = new Date()
        const signedMsg = "-----BEGIN QUANTA SIGNED MESSAGE-----\r" +
                            msg + 
                            "\r-----BEGIN META-----" +
                            "\raccount=" + this.props.name +
                            "\rmemokey=" + this.props.publicKey +
                            "\rtimestamp=" + timestamp +
                            "\r-----BEGIN SIGNATURE-----\r" +
                            sig +
                            "\r-----END QUANTA SIGNED MESSAGE-----"
        this.setState({signedMsg: signedMsg})
    }

    verifyMessage() {
        const msg = document.getElementById("message").value
        const key = msg.match(/memokey=\w+/g)[0].split("=")[1]
        const hex = msg.match(/-----BEGIN SIGNATURE-----\n^\w+/gm)[0].split("\n")[1]
        const content = msg.split("\n-----BEGIN META-----")[0].split("-----BEGIN QUANTA SIGNED MESSAGE-----\n")[1]
        let verified
        try {
            verified = Signature.fromHex(hex).verifyBuffer(
                Buffer.from(content),
                PublicKey.fromPublicKeyString(key)
                )
        } catch (e) {
            verified = false
        }

        this.setState({ isVerified: verified })
    }

    Sign() {
        return(
            <div className="content">
                <div>
                    <textarea id='message' className="d-block" autoFocus placeholder="Your message here..."></textarea>
                </div>
                <button disabled={!this.props.private_key} className="my-4 cursor-pointer" onClick={this.signMessage}>
                    {this.props.private_key ? "Sign" : "LOCK"}
                </button>
                <div>
                    <textarea className="d-block" readOnly onClick={(e) => this.selectText(e)} value={this.state.signedMsg} >
                    </textarea>
                </div>
            </div>
        )
    } 

    Verify() {
        return(
            <div className="content">
                <div>
                    <textarea id='message' className="d-block" spellCheck="false" autoFocus
                        onChange={() => this.setState({isVerified: null})}></textarea>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <button className="my-4 cursor-pointer" onClick={this.verifyMessage}>Verify</button>
                    {this.state.isVerified !== null ?
                        this.state.isVerified ? <div className="verify true">Verified</div>
                            : <div className="verify false">Not Verified</div>
                        : null
                    }
                </div>
                
            </div>
        )
    } 
        

    render() {
        // if (publicKey == null) {
        //     window.location.assign('/exchange')
        //     return
        // } 
        const { isMobile } = this.props
        const tabs = {
            names: ['Sign Message', 'Verify Message'],
            selectedTabIndex: 0,
        }

        const content = [<this.Sign />, <this.Verify />]

        return (
            <div className={container + " container-fluid" + (isMobile ? " mobile" : "")}>
                {isMobile ? 
                    null
                    :
                    <div className="row header-row">
                    <Header />
                    </div>
                }
                <div className="tab-row row d-flex flex-column align-items-center">
                    <div className="tabs">
                        <QTTabBar
                            className="underline static even-width qt-font-bold d-flex justify-content-left"
                            width={isMobile || 130}
                            gutter={10}
                            tabs = {tabs}
                            switchTab = {this.handleSwitch.bind(this)}
                        />
                    </div>
                </div>

                {content[this.state.selectedTabIndex]}

            </div>
        )
    }

}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
    publicKey: state.app.publicKey,
    private_key: state.app.private_key,
	name: state.app.name
});

export default connect(mapStateToProps)(Message)