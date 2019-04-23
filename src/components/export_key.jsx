import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN } from "../redux/actions/app.jsx";
import { clear, getItem } from '../common/storage.js'
import { PrivateKey, PublicKey, decryptWallet } from "@quantadex/bitsharesjs";
import bs58 from 'bs58'

const container = css`
    font-size: 15px;
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
        display: block;
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
`

class ExportKey extends Component {
    constructor(props) {
        super(props)
        this.state = {
            encrypted_data: "",
            private_key: "",
            password: "",
        }
    }

    componentDidMount() {
        this.loadStore()
    }

    async loadStore() {
        const encrypted_data = await getItem("encrypted_data")
        this.setState({encrypted_data: JSON.parse(encrypted_data)})
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
        } catch(e) {
            console.log(e)
            this.setState({errorMsg: "Your password and key does not match"})
        }
    }

    render() {
        const { password, errorMsg, private_key, bip58 } = this.state
        return (
            <div className={container + " mt-5 px-3"}>
                { private_key && bip58 ?
                    <div>
                        <label>PRIVATE KEY</label>
                        <textarea id="private-key" name="privateKey" 
                            onFocus={(e) => e.target.select()}
                            value={private_key} readOnly />
                        <button className="white-btn" onClick={() => this.copyText("private-key")}>Copy</button>
                        <label className="mt-5">BIP58 KEY</label>
                        <textarea id="bip58" name="bip58" 
                            onFocus={(e) => e.target.select()} 
                            value={bip58} readOnly />
                        <button className="white-btn" onClick={() => this.copyText("bip58")}>Copy</button>
                    </div>
                    :
                    <div className="text-left">
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
                }

            </div>
        )
    }
}

export default ExportKey