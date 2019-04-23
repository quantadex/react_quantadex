import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN } from "../redux/actions/app.jsx";
import { clear, getItem } from '../common/storage.js'
import { PrivateKey, PublicKey, decryptWallet } from "@quantadex/bitsharesjs";
import bs58 from 'bs58'

const container = css`
    input {
        color: #333;
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
        width: 180px;
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

    toByteArray(hexString) {
        var result = [];
        while (hexString.length >= 2) {
          result.push(parseInt(hexString.substring(0, 2), 16));
          hexString = hexString.substring(2, hexString.length);
        }
        return result;
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
            <div className={container + " mt-5"}>
                { private_key && bip58 ?
                    <div>
                        <textarea value={private_key} readOnly />
                        <textarea value={bip58} readOnly />
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
                        <button className="mt-5" 
                            disabled={password.length < 8}
                            onClick={() => this.getKeys()}>CONTINUE</button>
                    </div>
                }

            </div>
        )
    }
}

export default ExportKey