import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN, switchTicker } from '../redux/actions/app.jsx'
import { PrivateKey, changeWalletPassword, decryptWallet, encryptWallet } from "@quantadex/bitsharesjs";
import WalletApi from "../common/api/WalletApi";
import QTTabBar from './ui/tabBar.jsx'
import Loader from '../components/ui/loader.jsx'

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

    .connect-link {
        display: inline;
        color: #fff;
        text-decoration: underline;
        cursor: pointer;
    }

    &.link {
        color: #66d7d7;
        white-space: nowrap;
        padding-right: 20px;
        margin-right: 20px;
        background: url(${(window.isApp ? "": "/") + 'public/images/right-arrow.svg'}) no-repeat 100% 52%;
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

    label {
        font-size: 12px;
    }

    .link {
        color: #66d7d7;
        cursor: pointer;
    }

    .info {
        font-size: 12px;
        line-height: 12px;
    }

    .container {
        position: relative;
        width: auto;
        max-width: 750px;
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
        }
    }

    .warning {
        background-color: rgba(255, 50, 130, 0.03);
        border: 2px solid #f0185c;
        padding: 15px;
        border-radius: 5px;
        color: #333;
        font-size: 14px;

        h5{
            color: #f0185c;
        }

        ul {
            padding: 2px 18px;
            margin: 0;
            list-style: none;
            li::before {content: "•"; color: #aaa;
                display: inline-block; width: 1em;
                margin-left: -1em}
        }
    }

    .agreements {
        margin-left: 20px;
        font-size: 13px;
        color: #333;
        div {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        input {
            width: auto !important;
            height: auto;
            margin-right: 10px;
        }
        label {
            margin: 0;
        }
    }

    .drop-zone {
        height: 70px;
        color: #333;
        font-size: 14px;
        padding-left: 70px;
        border: 1px dashed #979797;
        background: rgba(80, 227, 194, 0.5) url(${(window.isApp ? "": "/") + "public/images/drag_drop.png"}) no-repeat 10px;

        label {
            margin: 0;
            font-weight: bold;
            text-decoration: underline;
            cursor: pointer;
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

class ConnectLink extends Component {
    render() {
        return (
            <div className={container + " link cursor-pointer" + (this.props.isMobile ? " mobile" : "")} onClick={() => this.props.onOpen("connect")}>CONNECT WALLET</div>
        )
    }
    
} 

class Connect extends Component {
    render() {
        return (
            <div className={container}>
                <p>Connect your <span className="qt-font-bold">Quanta</span> wallet to start trading in this market.</p>
                <button onClick={() => this.props.onOpen("create")}>GET STARTED</button>
                <div>
                    or<br/>
                    <div className="connect-link" onClick={() => this.props.onOpen("connect")}>Connect Wallet</div>
                </div>
            </div>
        )
    }
}

class ConnectDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogType: this.props.default,
            selectedTabIndex: 0,
            regStep: 1,
            encryptStep: 0,
            encrypted_data: {},
            private_key: "",
            username: "",
            password: "",
            confirm_password: "",
            authError: false,
            errorMsg: "",
            downloaded: false,
            uploaded_file_name: false,
        };

        this.handleChange = this.handleChange.bind(this)
        this.KeyConnect = this.KeyConnect.bind(this)
        this.KeyCreate = this.KeyCreate.bind(this)
        this.KeyDownload = this.KeyDownload.bind(this)
        this.ConnectEncrypted = this.ConnectEncrypted.bind(this)
        this.ConnectPrivateKey = this.ConnectPrivateKey.bind(this)
        this.EncryptKey = this.EncryptKey.bind(this)
        this.DownloadKey = this.DownloadKey.bind(this)
    }


    componentWillReceiveProps(nextProps) {
        if (this.state.dialogType !== nextProps.default) {
            this.setState({dialogType: nextProps.default})
        }
    }

    resetInputs(e = {}) {
        this.setState({
            ...e,
            private_key: "",
            username: "",
            password: "",
            confirm_password: "",
            authError: false,
            errorMsg: "",
        })
    }

    closeDialog() {
        document.getElementById("connect-dialog").style.display = "none"
        this.resetInputs()
    }
    
    handleSwitch(index) {
        this.setState({selectedTabIndex: Number(index)})
        this.resetInputs()
    }

    handleChange(e) {
        this.setState({private_key: e.target.value})
    }

    download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
    }

    validatePassword(pw1) {
        return pw1.length >= 8 && pw1.match(/[A-Z]/).length > 0 && pw1.match(/[0-9]/).length > 0
    }

    ConnectWithBin() {
        try {
			const decrypted = decryptWallet(this.state.encrypted_data, this.state.password)
            const private_key = decrypted.toWif()
			this.props.dispatch({
                type: LOGIN,
                private_key: private_key
            });
            this.props.dispatch(switchTicker(this.props.currentTicker))
		} catch(e) {
			console.log(e)
			this.setState({authError: true, errorMsg: "Incorrect Password"})
		}
        
    }
    
    ConnectWithKey() {
        try {
			const pKey = PrivateKey.fromWif(this.state.private_key);
			this.props.dispatch({
                type: LOGIN,
                private_key: this.state.private_key
            });
            this.props.dispatch(switchTicker(this.props.currentTicker))
		} catch(e) {
			console.log(e)
			this.setState({authError: true, errorMsg: "Invalid Key"})
		}
    }

    Encrypt() {
        if (this.state.password !== this.state.confirm_password) {
            this.setState({authError: true, errorMsg: "Your password inputs are not the same"})
            return
        } 

        if (!this.validatePassword(this.state.password)) {
            this.setState({authError: true, errorMsg: "Password must contains at least 8 characters, 1 uppercase, and 1 number."})
            return
        }

        try {
            const key = PrivateKey.fromWif(this.state.private_key)
            const encryption = encryptWallet(key, this.state.password)
            const text= JSON.stringify(encryption)
            this.download("quanta_wallet.bin", text)
            this.setState({downloaded: true, authError: false})
        } catch(e) {
            this.setState({authError: true, errorMsg: "Invalid Key"})
        }
    }

    registerAccount() {
        if (this.state.password !== this.state.confirm_password) {
            this.setState({authError: true, errorMsg: "Your password inputs are not the same"})
            return
        } 

        if (!this.validatePassword(this.state.password)) {
            this.setState({authError: true, errorMsg: "Password must contains at least 8 characters, 1 uppercase, and 1 number."})
            return
        }

        const keys = WalletApi.generate_key()

		this.setState({processing: true, private_key: keys.privateKey})

		fetch("/api/register", {
			method: "post",
			headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
			},
			body: JSON.stringify({
				user_name: this.state.username.toLowerCase(),
				public_key: keys.publicKey,
			})
		}).then(response => {
			if (response.status == 200) {
				this.setState({
                    regStep:2,
					authError: false
				});
				return response.json();
			} else {
				return response.json().then(res => {
					var msg;
					if (res.message.includes("already exists")) {
						msg = "Username already exist"
					} else if (res.message.includes("is_valid_name")) {
						msg = "Name must start with a letter and only contains alpha numeric, dash, and dot"
					} else {
						msg = "Server error. Please try again."
					}
					this.setState({
						authError: true,
						errorMsg: msg
					});
				});
			}
		})
		.finally(() => {
			this.setState({processing: false})
		})
    }

    DownloadKey() {
        const checks = document.forms.agreements.getElementsByTagName("input")
        for (let input of checks) {
            if (!input.checked) {
                this.setState({authError: true, errorMsg: "You must agree to all of the above"})
                return
            }
        }

        this.Encrypt()
        this.resetInputs({downloaded: true})
    }

    uploadFile(file) {
        var self = this
        if (!file.name.endsWith(".bin")) {
            self.setState({uploaded_file_msg: ".bin file only"})
            return
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = JSON.parse(e.target.result)
            self.setState({encrypted_data: contents, uploaded_file_msg: file.name + " uploaded"})
        };
        reader.readAsText(file);
    }

    handleDrop(e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0]
        this.uploadFile(file)
    }

    ConnectEncrypted() {
        return (
            <div className="input-container">
                <div className={"drop-zone align-items-center" + (this.props.isMobile ? " pt-3" : " d-flex")} onDragOver={(e)=> e.preventDefault()} onDrop={(e) => this.handleDrop(e)}>
                    Drop your backup file in this area or&nbsp;<label htmlFor="file">browse your files.</label>
                    <input className="d-none" type="file" name="file" id="file" accept=".bin" onChange={(e) => this.uploadFile(e.target.files[0])}/>
                </div>
                
                <div className="d-flex justify-content-between qt-font-small mb-2">
                    <div>{this.state.uploaded_file_msg}</div>
                    <div className="link text-right"
                        onClick={() => this.resetInputs({encryptStep: 1})}>I don’t have a .bin-file</div>
                </div>

                <label>PASSWORD</label><br/>
                <input type="password" name="password" placeholder="Password" 
                    value={this.state.password} onChange={(e) => this.setState({password: e.target.value})}/><br/>
                <span className="error" hidden={!this.state.authError}>{this.state.errorMsg}</span><br/>
                <div className="text-center">
                    <button onClick={this.ConnectWithBin.bind(this)} disabled={this.state.password.length < 8}>Connect Wallet</button>
                </div>
            </div>
        )
    }

    EncryptKey() {
        return (
            <div className="input-container">
                <div className="link float-right qt-font-small" onClick={() => this.resetInputs({encryptStep: 0})}>Close</div>
                <h5>CREATE AN ENCRYPTED PRIVATE "BIN" KEY</h5>
                <p className="info">
                    Encrypting your private key will make it safer to login, and store.
                    This process is done within your browser and the keys are not exposed on the Internet.
                </p>

                <div className="mb-2">
                    <label>PRIVATE KEY</label><br/>
                    <input id="key-input" type="text" autoComplete="off" placeholder="Private Key" spellCheck="false" 
                        value={this.state.private_key} onChange={(e) => this.setState({private_key: e.target.value})}/>
                </div>
                
                <div className="mb-2">
                    <label>PASSWORD</label><br/>
                    <input id="en-pw-input" type="password" placeholder="Password"
                        value={this.state.password} onChange={(e) => this.setState({password: e.target.value})}/>
                </div>

                <div className="mb-2">
                    <label>CONFIRM PASSWORD</label><br/>
                    <input id="en-pwconf-input" type="password" placeholder="Confirm Password" spellCheck="false" 
                        value={this.state.confirm_password} onChange={(e) => this.setState({confirm_password: e.target.value})}/>
                </div>

                <span className="error" hidden={!this.state.authError}>{this.state.errorMsg}</span><br/>

                <div className="text-center">
                    <button onClick={this.Encrypt.bind(this)} disabled={this.state.private_key.length == 0 || this.state.password.length == 0 || this.state.confirm_password.length == 0}>
                        ENCRYPT KEY
                    </button>
                </div>

                <div className={"link qt-font-small text-center" + (!this.state.downloaded ? " invisible" : "")} onClick={() => this.resetInputs({encryptStep: 0})}>
                    <u>Proceed to Connect Wallet</u>
                </div>
            </div>
        )
    }

    ConnectPrivateKey() {
        return (
            <div className="input-container">
                <label>PRIVATE KEY</label><br/>
                <input key="124432" id="pkey-input" type="text" autoComplete="off" placeholder="Private Key" spellCheck="false" 
                   value={this.state.private_key} onChange={(e) => this.setState({private_key: e.target.value})}/><br/>
                <span className="error" hidden={!this.state.authError}>{this.state.errorMsg}</span><br/>

                <div className="text-center">
                    <button onClick={this.ConnectWithKey.bind(this)} disabled={this.state.private_key.length == 0}>Connect Wallet</button>
                </div>
            </div>
        )
    }

    
    KeyConnect() {
        const tabs = {
            names: ["Encrypted Key", "Private Key"],
            selectedTabIndex: this.state.selectedTabIndex,
        }

        return (
            <div id="key-connect">
                <div className="d-flex justify-content-between">
                    <h4>CONNECT WALLET</h4>
                    <div className="link mr-5" onClick={() => this.resetInputs({dialogType: "create"})}>Don’t have an account?</div>
                </div>
                <QTTabBar
                    className="underline small static set-width qt-font-bold d-flex justify-content-left"
                    width={120}
                    gutter={10}
                    tabs={tabs}
                    switchTab={this.handleSwitch.bind(this)}
                />
                
                {this.state.selectedTabIndex == 0 ? 
                    (this.state.encryptStep == 0 ? <this.ConnectEncrypted /> : <this.EncryptKey />)
                    : <this.ConnectPrivateKey />}
            </div>
        )
    }

    KeyCreate() {
        return (
            <div id="key-create">
                <div className="d-flex justify-content-between">
                    <h4>CREATE WALLET</h4>
                    <div className="link mr-5" onClick={() => this.resetInputs({dialogType: "connect"})}>Already have a key?</div>
                </div>
                <div className="input-container">
                    <p className="info">
                        The QUANTA blockchain is Graphene-based Architecture which uses 
                        an account system based on username, and public-private key signature. 
                        This wallet creation will generate you a random public-private key, 
                        and register your account with the blockchain, then encrypt your private 
                        key with a password into a private “bin” key to download to your computer. 
                        Beware, if you lose the password, you will lose your funds forever.
                    </p>

                    <div className="mb-2">
                        <label>USERNAME</label><br/>
                        <input id="name-input" type="text" autoComplete="off" placeholder="Username" spellCheck="false" 
                            value={this.state.username} onChange={(e) => this.setState({username: e.target.value})}/>
                    </div>
                    

                    <div className="mb-2">
                        <label>PASSWORD</label><br/>
                        <input id="pw-input" type="password" placeholder="Password"
                            value={this.state.password} onChange={(e) => this.setState({password: e.target.value})}/>
                    </div>

                    <div className="mb-2">
                        <label>CONFIRM PASSWORD</label><br/>
                        <input id="pwconf-input" type="password" placeholder="Confirm Password" spellCheck="false" 
                            value={this.state.confirm_password} onChange={(e) => this.setState({confirm_password: e.target.value})}/>
                    </div>

                    <span className="error" hidden={!this.state.authError}>{this.state.errorMsg}</span><br/>

                    <div className="text-center">
                        <button onClick={this.registerAccount.bind(this)} disabled={this.state.username.length == 0 || this.state.password.length == 0 || this.state.confirm_password.length == 0}>
                            {this.state.processing ? <Loader /> : "REGISTER ACCOUNT"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    KeyDownload() {
        return (
            <div id="key-create">
                <div className="d-flex justify-content-between">
                    <h4>CREATE WALLET</h4>
                    <div className="link mr-5" onClick={() => this.setState({dialogType: "connect"})}>Already have a key?</div>
                </div>
                <div className="input-container">
                    <h5>ACCOUNT REGISTERED</h5>
                    <div className="warning qt-font-light">
                        <h5>IMPORTANT INFORMATION</h5>
                        <ul>
                            <li>Store this wallet securely. QUANTA does not have your keys.</li>
                            <li>If you lose it you will lose your tokens.</li>
                            <li>Do not share it! Your funds will be stolen if you use this file on a malicious/phishing site.</li>
                            <li>Make a backup! Secure it like the millions of dollars it may one day be worth.</li>
                            <li>This is not a ERC-20.</li>
                        </ul>
                    </div>

                    <div className="agreements my-5">
                        <form name="agreements">
                            <div>
                                <input type="checkbox" id="pw" name="pw"/>
                                <label htmlFor="pw">I have remembered or otherwise stored my password.</label>
                            </div>
                            <div>
                                <input type="checkbox" id="rc" name="rc" />
                                <label htmlFor="rc">I understand that no one can recover my password or file 
                                    if I lose or forget it. Thus if I lose access to my account, I will lose 
                                    access to my funds without a recovery opportunity.</label>
                            </div>
                            <div>
                                <input type="checkbox" id="ts" name="ts" />
                                <label htmlFor="ts">I agree with Terms of Service and Privacy Policy.</label>
                            </div>
                        
                        </form>
                    </div>
                    <span className="error" hidden={!this.state.authError}>{this.state.errorMsg}</span><br/>
                    <div className="text-center">
                        <button className="mb-2" onClick={this.DownloadKey}>DOWNLOAD FILE</button>
                        <div className={"link qt-font-small" + (!this.state.downloaded ? " invisible" : "")} onClick={() => this.setState({dialogType: "connect"})}>
                            <u>Proceed to Connect your Wallet</u>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    render() {

        return (
            <div id="connect-dialog" className={dialog + (this.props.isMobile ? " mobile" : "")} style={{display: "none"}} 
                onDragOver={(e)=> e.preventDefault()} onDrop={(e) => e.preventDefault()}>
                <div className="container">
                    <div className="close-btn" onClick={() => this.closeDialog()}><img src={(window.isApp ? "": "/") + "public/images/close_btn.svg"} /></div>
                    {this.state.dialogType == "create" ? 
                        this.state.regStep == 1 ? <this.KeyCreate /> : <this.KeyDownload /> :
                        <this.KeyConnect />
                    }
                    <p>Your private keys are not sent to QUANTA. All transactions are signed within your browser <br/>
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
