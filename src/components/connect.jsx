import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { AccountLogin, GetAccount, TOGGLE_CONNECT_DIALOG } from '../redux/actions/app.jsx'
import { PrivateKey, decryptWallet, encryptWallet } from "@quantadex/bitsharesjs";
import WalletApi from "../common/api/WalletApi";
import QTTabBar from './ui/tabBar.jsx'
import Loader from '../components/ui/loader.jsx'
import Lock from './ui/account_lock.jsx'
import CONFIG from '../config.js'

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
        color: #fff;
        text-decoration: underline;
        cursor: pointer;
    }

    &.link {
        color: #66d7d7;
        white-space: nowrap;
        padding-right: 20px;
        margin-right: 20px;
        background: url(${devicePath('public/images/right-arrow.svg')}) no-repeat 100% 52%;
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
        text-align: right;
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

    .referral {
        margin-top: -15px;
    }

    .container.testnet {
        background-color: #555;
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
        background: rgba(80, 227, 194, 0.5) url(${devicePath("public/images/drag_drop.png")}) no-repeat 10px;

        label {
            margin: 0;
            font-weight: bold;
            text-decoration: underline;
            cursor: pointer;
        }
    }

    &.mobile {
        position: relative;
        background-color: transparent;
        z-index: 1;

        .container {
            width: 100% !important;
            background-color: transparent;
            .input-container {
                button {
                    margin: 0;
                    width: 100%;
                }
            }
        }
    }
`

class Connect extends Component {
    openDialog(dialogType) {
        const { mobile_nav, dispatch } = this.props
        if (mobile_nav) {
            mobile_nav(dialogType)
        } else {
            dispatch({
                type: TOGGLE_CONNECT_DIALOG,
                data: dialogType
            })
        }
    }

    render() {
        const { type, isMobile } = this.props
        return (
            <React.Fragment>
                {
                    type == "link" ? 
                    <div className={container + " link cursor-pointer" + (isMobile ? " mobile" : "")} onClick={() => this.openDialog("connect")} >CONNECT WALLET</div>
                :   type == "lock" ?
                    <Lock unlock={() => this.openDialog("connect")}/>
                    :
                    <div className={container}>
                        <p>Connect your <span className="qt-font-bold">Quanta</span> wallet to start trading in this market.</p>
                        <button onClick={() => this.openDialog("create")}>GET STARTED</button>
                        <div>
                            or
                            <div className="connect-link mt-3" onClick={() => this.openDialog("connect")}>Connect Wallet</div>
                        </div>
                </div>
                }
            </React.Fragment>
        )
    }
}

export class ConnectDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogType: this.props.default,
            selectedTabIndex: 0,
            regStep: 1,
            encryptStep: 0,
            encrypted_data: null,
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

    componentDidMount() {
        const search = window.location.search.slice(1).split("=")
        const referrer = search.indexOf("referrer") !== -1 && search[search.indexOf("referrer") + 1]
        if (!referrer) return
        
        this.setState({referrer})
        
        GetAccount(referrer).then(e => {
            if (e.membership_expiration_date !== "1969-12-31T23:59:59") {
                this.setState({referrer_error: "Referrer account is not a lifetime member - user need to activate the referral program"})
            }
        }).catch(error => {
            this.setState({referrer_error: "Referrer account does not exist"})
        })
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
        this.props.dispatch({
            type: TOGGLE_CONNECT_DIALOG,
            data: false
        })
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
        return pw1.length >= 8 && pw1.match(/[A-Z]/) && pw1.match(/[0-9]/)
    }

    ConnectWithBin() {
        const { mobile_nav, dispatch } = this.props
        const { password } = this.state
        try {
            const encrypted_data = this.state.encrypted_data || JSON.parse(localStorage.encrypted_data)
			const decrypted = decryptWallet(encrypted_data, password)
            const private_key = decrypted.toWif()

            dispatch(AccountLogin(private_key)).then(() => {
                localStorage.setItem("encrypted_data", JSON.stringify(encrypted_data))
                if (mobile_nav) {
                    mobile_nav()
                }
            })
            .catch(error => {
                this.setState({authError: true, errorMsg: error})
            })

		} catch(e) {
			console.log(e)
			this.setState({authError: true, errorMsg: "Incorrect Password"})
		}
        
    }
    
    ConnectWithKey() {
        const { mobile_nav, dispatch } = this.props
        const { private_key } = this.state
        try {
            const pKey = PrivateKey.fromWif(private_key);

            dispatch(AccountLogin(private_key)).then(() => {
                localStorage.removeItem("encrypted_data")
                if (mobile_nav) {
                    mobile_nav()
                }
            })
            .catch(error => {
                this.setState({authError: true, errorMsg: error})
            })
		} catch(e) {
			this.setState({authError: true, errorMsg: "Invalid Key"})
		}
    }

    Encrypt() {
        const { network } = this.props
        const { password, confirm_password, private_key, username } = this.state
        if (password !== confirm_password) {
            this.setState({authError: true, errorMsg: "Your password inputs are not the same"})
            return
        } 

        if (!this.validatePassword(password)) {
            this.setState({authError: true, errorMsg: "Password must contains at least 8 characters, 1 uppercase, and 1 number."})
            return
        }

        try {
            const key = PrivateKey.fromWif(private_key)
            const encryption = encryptWallet(key, password)
            const text= JSON.stringify(encryption)
            this.download(`quanta_${network}_${username}.json`, text)
            this.setState({downloaded: true, authError: false})
        } catch(e) {
            this.setState({authError: true, errorMsg: "Invalid Key"})
        }
    }

    registerAccount() {
        const { password, confirm_password, username, referrer, referrer_error } = this.state
        if (password !== confirm_password) {
            this.setState({authError: true, errorMsg: "Your password inputs are not the same"})
            return
        } 

        if (!this.validatePassword(password)) {
            this.setState({authError: true, errorMsg: "Password must contains at least 8 characters, 1 uppercase, and 1 number."})
            return
        }

        const keys = WalletApi.generate_key()
        const reg_json = {
            name: username.toLowerCase(),
			public_key: keys.publicKey,
        }

        if (referrer && !referrer_error) {
            reg_json.referrer= referrer
        }

		this.setState({processing: true, private_key: keys.privateKey})

		fetch(CONFIG.getEnv().API_PATH + "/register_account", {
			method: "post",
			headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
			},
			body: JSON.stringify(reg_json)
		}).then(response => {
			if (response.status == 200) {
				this.setState({
                    regStep:2,
					authError: false
				});
				return response.json()
			} else {
				return response.json().then(res => {
					var msg;
					if (res.error.includes("already exists")) {
						msg = "Username already exist"
					} else if (res.error.includes("is_valid_name")) {
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
        this.setState({downloaded: true})
    }

    uploadFile(file) {
        var self = this
        if (!file.name.endsWith(".json")) {
            self.setState({uploaded_file_msg: ".json file only"})
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
        const { isMobile } = this.props
        const { encrypted_data, uploaded_file_msg, password, authError, errorMsg } = this.state
        return (
            <div className="input-container">
                {!encrypted_data && localStorage.encrypted_data ?
                <div className="text-secondary text-center mb-2">
                    Continue as <span className="qt-color-theme">{localStorage.name}</span> or&nbsp;<label className="cursor-pointer" htmlFor="file"><u>browse your files.</u></label>
                    <input className="d-none" type="file" name="file" id="file" accept=".json" onChange={(e) => this.uploadFile(e.target.files[0])}/>
                </div>
                : 
                <React.Fragment>
                    <div className={"drop-zone align-items-center" + (isMobile ? " pt-3" : " d-flex")} onDragOver={(e)=> e.preventDefault()} onDrop={(e) => this.handleDrop(e)}>
                        Drop your backup file in this area or&nbsp;<label htmlFor="file">browse your files.</label>
                        <input className="d-none" type="file" name="file" id="file" accept=".json" onChange={(e) => this.uploadFile(e.target.files[0])}/>
                    </div>
                    
                    <div className="d-flex justify-content-between qt-font-small mb-2">
                        <div>{uploaded_file_msg}</div>
                        <div className="link text-right"
                            onClick={() => this.resetInputs({encryptStep: 1})}>I don’t have a .json-file</div>
                    </div>
                </React.Fragment>
                }
                

                <label>PASSWORD</label><br/>
                <input type="password" name="password" placeholder="Password" 
                    value={password} onChange={(e) => this.setState({password: e.target.value})}
                    onKeyPress={e => {
                        if (e.key == "Enter" && password.length > 0) {
                            this.ConnectWithBin()
                        }
                       }}
                    /><br/>
                <span className="error" hidden={!authError}>{errorMsg}</span><br/>
                <div className="text-center">
                    <button onClick={this.ConnectWithBin.bind(this)} 
                        disabled={password.length < 8 || !(encrypted_data || localStorage.encrypted_data)}>
                        Connect Wallet
                    </button>
                </div>
            </div>
        )
    }

    EncryptKey() {
        const { private_key, password, confirm_password, authError, errorMsg, downloaded } = this.state
        return (
            <div className="input-container">
                <div className="link float-right qt-font-small" onClick={() => this.resetInputs({encryptStep: 0})}>Close</div>
                <h5>CREATE AN ENCRYPTED PRIVATE "JSON" KEY</h5>
                <p className="info">
                    Encrypting your private key will make it safer to login, and store.
                    This process is done within your browser and the keys are not exposed on the Internet.
                </p>

                <div className="mb-2">
                    <label>PRIVATE KEY</label><br/>
                    <input id="key-input" type="text" autoComplete="off" placeholder="Private Key" spellCheck="false" 
                        value={private_key} onChange={(e) => this.setState({private_key: e.target.value})}/>
                </div>
                
                <div className="mb-2">
                    <label>PASSWORD</label><br/>
                    <input id="en-pw-input" type="password" placeholder="Password"
                        value={password} onChange={(e) => this.setState({password: e.target.value})}/>
                </div>

                <div className="mb-2">
                    <label>CONFIRM PASSWORD</label><br/>
                    <input id="en-pwconf-input" type="password" placeholder="Confirm Password" spellCheck="false" 
                        value={confirm_password} onChange={(e) => this.setState({confirm_password: e.target.value})}/>
                </div>

                <span className="error" hidden={!authError}>{errorMsg}</span><br/>

                <div className="text-center">
                    <button onClick={this.Encrypt.bind(this)} disabled={private_key.length == 0 || password.length == 0 || confirm_password.length == 0}>
                        ENCRYPT KEY
                    </button>
                </div>

                <div className={"link qt-font-small text-center" + (!downloaded ? " invisible" : "")} onClick={() => this.resetInputs({encryptStep: 0})}>
                    <u>Proceed to Connect Wallet</u>
                </div>
            </div>
        )
    }

    ConnectPrivateKey() {
        const { private_key, authError, errorMsg } = this.state
        return (
            <div className="input-container">
                <label>PRIVATE KEY</label><br/>
                <input id="pkey-input" type="text" autoComplete="off" autoFocus placeholder="Private Key" spellCheck="false" 
                    name="privateKey"
                   value={private_key}
                   onChange={(e) => this.setState({private_key: e.target.value})}
                   onKeyPress={e => {
                    if (e.key == "Enter" && private_key.length > 0) {
                        this.ConnectWithKey()
                    }
                   }}/><br/>
                <span className="error" hidden={!authError}>{errorMsg}</span><br/>

                <div className="text-center">
                    <button onClick={this.ConnectWithKey.bind(this)} disabled={private_key.length == 0}>Connect Wallet</button>
                </div>
            </div>
        )
    }

    
    KeyConnect() {
        const { isMobile, network } = this.props
        const { selectedTabIndex, encryptStep } = this.state
        const tabs = {
            names: ["Encrypted Key", "Private Key"],
            selectedTabIndex: selectedTabIndex,
        }

        return (
            <div id="key-connect">
                <div className="d-flex justify-content-between">
                    <h4>CONNECT {network == "testnet" ? "TESTNET" : ""} WALLET</h4>
                    <div className={"link text-nowrap" + (isMobile ? "" : " mr-5")} onClick={() => this.resetInputs({dialogType: "create"})}>Don’t have an account?</div>
                </div>
                <QTTabBar
                    className="underline small static set-width qt-font-bold d-flex justify-content-left"
                    width={120}
                    gutter={10}
                    tabs={tabs}
                    switchTab={this.handleSwitch.bind(this)}
                />
                
                {selectedTabIndex == 0 ? 
                    (encryptStep == 0 ? <this.ConnectEncrypted /> : <this.EncryptKey />)
                    : <this.ConnectPrivateKey />}
            </div>
        )
    }

    KeyCreate() {
        const { isMobile, network } = this.props
        const { referrer, referrer_error, username, password, confirm_password, authError, errorMsg, processing } = this.state
        return (
            <div id="key-create">
                <div className="d-flex justify-content-between">
                    <h4>CREATE {network == "testnet" ? "TESTNET" : ""} WALLET</h4>
                    <div className={"link text-nowrap" + (isMobile ? "" : " mr-5")} onClick={() => this.resetInputs({dialogType: "connect"})}>Already have a key?</div>
                </div>
                <div className="input-container">
                    {referrer ? 
                        <div className="referral text-right small mb-1">
                            <b>Referral:</b> {referrer}
                            {referrer_error ? <span className="text-danger"><br/>{referrer_error}</span> : null}
                        </div>
                    : null
                    }
                    <p className="info">
                        The QUANTA blockchain is Graphene-based Architecture which uses 
                        an account system based on username, and public-private key signature. 
                        This wallet creation will generate you a random public-private key, 
                        and register your account with the blockchain, then encrypt your private 
                        key with a password into a private “json” key to download to your computer. 
                        Beware, if you lose the password, you will lose your funds forever.
                    </p>

                    <div className="mb-2">
                        <label>USERNAME</label><br/>
                        <input id="name-input" type="text" autoComplete="off" placeholder="Username" spellCheck="false" 
                            value={username} onChange={(e) => this.setState({username: e.target.value})}/>
                    </div>
                    

                    <div className="mb-2">
                        <label>PASSWORD</label><br/>
                        <input id="pw-input" type="password" placeholder="Password"
                            value={password} onChange={(e) => this.setState({password: e.target.value})}/>
                    </div>

                    <div className="mb-2">
                        <label>CONFIRM PASSWORD</label><br/>
                        <input id="pwconf-input" type="password" placeholder="Confirm Password" spellCheck="false" 
                            value={confirm_password} onChange={(e) => this.setState({confirm_password: e.target.value})}/>
                    </div>

                    <span className="error" hidden={!authError}>{errorMsg}</span><br/>

                    <div className="text-center">
                        <button onClick={this.registerAccount.bind(this)} disabled={username.length == 0 || password.length == 0 || confirm_password.length == 0}>
                            {processing ? <Loader /> : "REGISTER ACCOUNT"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    KeyDownload() {
        const { isMobile, network } = this.props
        const { authError, errorMsg, downloaded } = this.state
        return (
            <div id="key-create">
                <div className="d-flex justify-content-between">
                    <h4>CREATE {network == "testnet" ? "TESTNET" : ""} WALLET</h4>
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
                    <span className="error" hidden={!authError}>{errorMsg}</span><br/>
                    <div className="text-center">
                        <button className="mb-2" onClick={this.DownloadKey}>DOWNLOAD FILE</button>
                        <div className={"link qt-font-small" + (!downloaded ? " invisible" : "")} onClick={() => this.resetInputs({dialogType: "connect"})}>
                            <u>Proceed to Connect your Wallet</u>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    render() {
        const { isMobile, network } = this.props
        const { dialogType, regStep } = this.state
        return (
            <div id="connect-dialog" className={dialog + " d-flex align-content-center qt-font-regular" + (isMobile ? " mobile" : "")} 
                onDragOver={(e)=> e.preventDefault()} onDrop={(e) => e.preventDefault()}>
                <div className={"container " + network}>
                    {!isMobile ? 
                        <div className="close-btn" onClick={this.closeDialog.bind(this)}><img src={devicePath("public/images/close_btn.svg")} /></div> 
                        : null
                    }
                    {dialogType == "create" ? 
                        regStep == 1 ? <this.KeyCreate /> : <this.KeyDownload /> :
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
    network: state.app.network,
    private_key: state.app.private_key,
    isMobile: state.app.isMobile
});

export default connect(mapStateToProps)(Connect)
