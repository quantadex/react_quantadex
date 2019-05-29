import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { getItem } from '../common/storage.js'
import { decryptWallet } from "@quantadex/bitsharesjs";
import bs58 from 'bs58'
import QRCode from 'qrcode'
import Header from './headersimple.jsx';
import globalcss from './global-css.js'

const container = css`
    background-color:${globalcss.COLOR_BACKGROUND};
    min-height: 100vh;
    font-size: 15px;

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
        max-width: 1000px;
        margin: auto;
    }

    #qr-canvas {
        max-width: 95vw;
        max-height: 95vw;
    }

    input {
        color: #333;
        background: #fff;
        border: 1px solid #999;
        text-align: left;
        padding: 20px;
        width: 100%;
        border-radius: 4px;
    }

    input:read-only {
        background: #eee;
    }

    .error {
        color: #f0185c;
        font-size: 11px;
    }

    button {
        display: inline-block;
        height: 42px;
        background-color: #66d7d7;
        padding: 10px 20px;
        color: #fff;
        border-radius: 4px;
        white-space: nowrap;
        cursor: pointer;
    }
    button:disabled {
        background-color: #999;
    }
    .white-btn {
        background: #eee;
        color: #333;
        height: auto;
        padding: 6px 20px;
    }
    textarea {
        width: 100%;
        min-height: 160px;
        border-radius: 4px;
        background: #293135;
        border: 1px solid #222;
        color: #fff;
        padding: 10px;
    }

    &.mobile {
        background: transparent;
        min-height: unset;
    }
`

class ExportKey extends Component {
    constructor(props) {
        super(props)
        this.state = {
            encrypted_data: "",
            private_key: "",
            password: "",
            show_qr: false,
        }
    }

    componentDidMount() {
        this.loadStore()
    }

    async loadStore() {
        try {
            const encrypted_data = await getItem("encrypted_data")
            this.setState({encrypted_data: JSON.parse(encrypted_data)})
        } catch(e) {
            console.log(e)
        }
    }

    copyText(id) {
        var copyText = document.getElementById(id);
        copyText.select();
        document.execCommand("copy");
    }

    getKeys() {
        const { encrypted_data, password } = this.state

        try {
            const decrypted = decryptWallet(encrypted_data, password)
            const private_key = decrypted.toWif()
            const pre58 = encrypted_data.encryption_key + encrypted_data.wallet_encryption_key
            const bytes = Buffer.from(pre58, 'hex')
            const bip58 = bs58.encode(bytes)

            this.setState({private_key, bip58, errorMsg: null})
            setTimeout(() => {
                var canvas = document.getElementById('qr-canvas')
                QRCode.toCanvas(canvas, btoa(JSON.stringify(encrypted_data)))
            }, 0)
        } catch(e) {
            console.log(e)
            this.setState({errorMsg: "Your password and key does not match"})
        }
    }

    render() {
        const { isMobile } = this.props
        const { password, errorMsg, private_key, bip58, show_qr, encrypted_data } = this.state
        return (
            <div className={container + (isMobile ? " mobile mt-5 px-3" : " container-fluid" )}>
                {isMobile ? 
                    null
                    :
                    <React.Fragment>
                        <div className="row header-row">
                            <Header />
                        </div>
                        <div className="row tab-row d-flex flex-column align-items-center mb-5">
                            <h4>Export Private Key</h4>
                        </div>
                    </React.Fragment>
                }
                { isMobile && !window.isApp ?
                    <h2 className="mb-4">Export Private Key</h2>
                : null
                }
                { private_key && bip58 ?
                    <div className="content pb-5">
                        <button className="white-btn mb-5" onClick={() => this.setState({show_qr: !show_qr})}>{show_qr ? "Hide" : "Show"} QR Code</button>
                        <div id="qr-container" className={show_qr ? "d-block text-center mb-5" : "d-none"}>
                            <h4>Encrypted Data For Mobile App Login</h4>
                            <canvas id="qr-canvas"></canvas>
                        </div>
                        <div>
                            <label>PRIVATE KEY</label>
                            <textarea id="private-key" name="privateKey" 
                                onFocus={(e) => e.target.select()}
                                value={private_key} readOnly />
                            <button className="white-btn" onClick={() => this.copyText("private-key")}>Copy</button>
                        </div>
                        <div>
                            <label className="mt-5">BIP58 KEY</label>
                            <textarea id="bip58" name="bip58" 
                                onFocus={(e) => e.target.select()} 
                                value={bip58} readOnly />
                            <button className="white-btn" onClick={() => this.copyText("bip58")}>Copy</button>
                        </div>
                    </div>
                    :
                    encrypted_data ?
                        <div className="content text-left">
                            <label>PASSWORD</label>
                            <input className="text-left" type="password" name="password" placeholder="Password" 
                                value={password} onChange={(e) => this.setState({password: e.target.value})}
                                onKeyPress={e => {
                                    if (e.key == "Enter" && password.length >= 8) {
                                        this.getKeys()
                                    }
                                }}
                                />
                            <span className="text-danger small">{errorMsg}</span>
                            <button className="mt-5 w-100" 
                                disabled={password.length < 8}
                                onClick={() => this.getKeys()}>CONTINUE</button>
                        </div>
                        : 
                        <div className="text-center text-secondary">
                            You need to be connected using your encrypted JSON for this feature.
                        </div>
                }

            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    isMobile: state.app.isMobile,
});

export default connect(mapStateToProps)(ExportKey)