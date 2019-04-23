import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { AccountLogin, GetAccount, TOGGLE_CONNECT_DIALOG } from '../redux/actions/app.jsx'
import { PrivateKey, PublicKey, decryptWallet, encryptWallet } from "@quantadex/bitsharesjs";
import WalletApi from "../common/api/WalletApi";
import QTTabBar from './ui/tabBar.jsx'
import Loader from '../components/ui/loader.jsx'
import Lock from './ui/account_lock.jsx'
import CONFIG from '../config.js'
import bs58 from 'bs58'
import Recaptcha from 'react-google-invisible-recaptcha';
import {getItem, setItem, removeItem, clear } from "../common/storage.js";

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
        border-radius: 30px;
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
        font-size: 16px;
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
        width: 100%;
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

            input:read-only {
                background: #eee;
            }

            .generate-key {
                background: url(${devicePath('public/images/generate.svg')}) no-repeat 0 50%;
                padding-left: 18px;
            }

            .personal-key input {
                padding: 0;
                height: auto;
                width: auto ;
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
                    <div className={container + (isMobile ? " mobile" : "")}>
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
            no_email: false,
            encrypted_data: null,
            private_key: "",
            public_key: "",
            valid_key: true,
            email: "",
            email_code: "",
            username: "",
            password: "",
            confirm_password: "",
            authError: false,
            errorMsg: "",
            downloaded: false,
            uploaded_file_name: false,
            scan_qr: true,
            bip58: ""
        };

        this.handleChange = this.handleChange.bind(this)
        this.KeyConnect = this.KeyConnect.bind(this)
        this.KeyCreate = this.KeyCreate.bind(this)
        this.VerifyEmail = this.VerifyEmail.bind(this)
        this.ConfirmEmail = this.ConfirmEmail.bind(this)
        this.Register = this.Register.bind(this)
        this.KeyDownload = this.KeyDownload.bind(this)
        this.ConnectEncrypted = this.ConnectEncrypted.bind(this)
        this.ConnectPrivateKey = this.ConnectPrivateKey.bind(this)
        this.EncryptKey = this.EncryptKey.bind(this)
        this.downloadKey = this.downloadKey.bind(this)
        this.generateKey = this.generateKey.bind(this)
    }

    componentDidMount() {
        this.generateKey()
        this.loadStore().then(() => {            
        })

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
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        console.log(error)
    }
    componentDidCatch(error, info) {
        console.log(error, info)
    }

    resetInputs(e = {}) {
        this.setState({
            ...e,
            private_key: "",
            bip58: "",
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

    ConnectWithBin(type = undefined, nav = true) {
        const { mobile_nav, dispatch } = this.props
        const { password, bip58, storeEncrypted } = this.state
        
        try {
            var encrypted_data
            if (type === "bip58") {
                const hex = bs58.decode(bip58).toString('hex')
                if (hex.length !== 192) throw "Invalid Key"
                encrypted_data = {encryption_key: hex.slice(0,96), wallet_encryption_key: hex.slice(-96)}
            } else if (type === "qr") {
                encrypted_data = JSON.parse(atob(bip58))
            } else {
                encrypted_data = this.state.encrypted_data || JSON.parse(storeEncrypted)
            }

			const decrypted = decryptWallet(encrypted_data, password)
            const private_key = decrypted.toWif()

            dispatch(AccountLogin(private_key)).then(() => {
                setItem("encrypted_data", JSON.stringify(encrypted_data))
                if (nav && mobile_nav) {
                    mobile_nav()
                }
            })
            .catch(error => {
                this.setState({authError: true, errorMsg: error})
            })

		} catch(e) {
            console.log(e)
            let errorMsg
            if (e == "Invalid Key") {
                errorMsg = e
            } else {
                errorMsg = "Your password and key does not match"
            }
			this.setState({authError: true, errorMsg })
		}
        
    }
    
    ConnectWithKey() {
        const { mobile_nav, dispatch } = this.props
        const { private_key } = this.state
        try {
            const pKey = PrivateKey.fromWif(private_key);

            dispatch(AccountLogin(private_key)).then(() => {
                removeItem("encrypted_data")
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
        const { password, confirm_password, username, personal_key, public_key, private_key, no_email, email, email_code, referrer, referrer_error } = this.state
        if(!personal_key) {
            if (password !== confirm_password) {
                this.recaptcha.reset()
                this.setState({authError: true, errorMsg: "Your password inputs are not the same"})
                return
            } 

            if (!this.validatePassword(password)) {
                this.recaptcha.reset()
                this.setState({authError: true, errorMsg: "Password must contains at least 8 characters, 1 uppercase, and 1 number."})
                return
            }
        }

        const reg_json = {
            name: username.toLowerCase(),
			public_key: public_key,
        }

        if (referrer && !referrer_error) {
            reg_json.referrer= referrer
        }
        
        this.setState({processing: true})

		fetch(CONFIG.getEnv().API_PATH + "/register_account", {
			method: "post",
			headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
            },
            mode: "cors",
			body: JSON.stringify(reg_json)
		}).then(response => {
			if (response.status == 200) {
                const encryption = encryptWallet(PrivateKey.fromWif(private_key), password)
                const encrypted_data= JSON.stringify(encryption)

                this.setState({
                    regStep: 4,
                    authError: false
                });
				
                if (!no_email) {
                    fetch(CONFIG.getEnv().API_PATH + "/send_walletinfo", {
                        method: "post",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json"
                        },
                        body: JSON.stringify({
                            email: email,
                            confirm: email_code,
                            public_key: public_key,
                            account: username,
                            json: window.btoa(encrypted_data)
                        })
                    })
                }
                
                if (window.isApp) {
                    this.setState(encrypted_data)
                    this.ConnectWithBin(undefined, false)
                }

				return response.json()
			} else {
                this.recaptcha.reset()
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

    downloadKey() {
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

    VerifyEmail() {
        const self = this
        const { email, email_error, processing } = this.state

        function validateEmail() {
            const isValid = email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            
            if (!isValid) {
                this.recaptcha.reset()
                self.setState({email_error: "Not a valid email address."})
            } else {
                this.recaptcha.execute()
            }
        }

        function verify() {
            const { email, email_error, processing } = self.state
            self.setState({email_error: false, processing: true})
            fetch(CONFIG.getEnv().API_PATH + "/verify_email", {
                mode: "cors",
                method: "post",
                headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                },
                body: JSON.stringify({ email: email, recaptcha: this.recaptcha.getResponse() })
            }).then(e => e.json()).then(response => {
                if (response.success) {
                    self.setState({
                        regStep:2
                    });
                } 
            }).finally(() => {
                self.setState({processing: false})
            })
        }
        
        return (
            <React.Fragment>
                <h3 className="text-dark qt-font-bold">1/3 - VERIFY YOUR EMAIL</h3>
                <p className="qt-font-small my-4">
                    The QUANTA blockchain is Graphene-based Architecture which uses an 
                    account system based on username, and public-private key signature. 
                    This wallet creation will generate you a random public-private key, 
                    and register your account with the blockchain, then encrypt your private 
                    key with a password  into a private “json” key.
                </p>

                <label>EMAIL TO RECEIVE THE ENCRYPTED KEY</label><br/>
                <input type="email" name="email" placeholder="Email" spellCheck="false"
                    value={email} onChange={(e) => this.setState({email: e.target.value})}
                />
                {email_error ? <span className="text-danger">{email_error}</span> : null}
                <div className="text-center mt-5">
                    <button onClick={validateEmail.bind(this)} disabled={processing || !email} >
                        {processing ? <Loader /> : "VERIFY EMAIL"}
                    </button>
                    <Recaptcha
                        ref={ ref => this.recaptcha = ref }
                        sitekey="6Lc4OZ4UAAAAAEfECNb09tkSL_3UBCuV_sdITK5B"
                        onResolved={ verify.bind(this) } />
                </div>
                {window.isApp ? null :
                    <div className="link qt-font-small text-center mt-4" 
                        onClick={() => this.setState({no_email: true, regStep: 3})}>
                        <u>Skip. Download locally</u>
                    </div>
                }
            </React.Fragment>
        )
    }

    ConfirmEmail() {
        const self = this
        const { email, email_code, processing } = this.state
        function confirm() {
            self.setState({processing: true})
            fetch(CONFIG.getEnv().API_PATH + "/confirm_email", {
                mode: "cors",
                method: "post",
                mode: "cors",
                headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                },
                body: JSON.stringify({ email: email, confirm: email_code })
            }).then(e => e.json()).then(response => {
                if (response.success) {
                    self.setState({
                        regStep:3
                    });
                } 
            }).finally(() => {
                self.setState({processing: false})
            })
        }

        return (
            <React.Fragment>
                <h3 className="text-dark qt-font-bold">2/3 - CONFIRM YOUR EMAIL</h3>
                <p className="qt-font-small my-4">
                    We sent a code to {email}. Enter it below:
                </p>

                <label>VERIFICATION CODE</label><br/>
                <input type="text" name="email_code" spellCheck="false"
                    value={email_code} onChange={(e) => this.setState({email_code: e.target.value})}
                />

                <div className="text-center mt-5">
                    <button onClick={confirm} disabled={processing} >
                        {processing ? <Loader /> : "NEXT"}
                    </button>
                </div>
            </React.Fragment>
        )
    }

    generateKey() {
        const keys = WalletApi.generate_key()
        this.setState({ public_key: keys.publicKey, private_key: keys.privateKey, valid_key: true })
    }

    Register() {
        const { no_email, username, public_key, personal_key, valid_key, password, confirm_password, authError, errorMsg, processing } = this.state

        return (
            <React.Fragment>
                <h3 className="text-dark qt-font-bold">{no_email ? "": "3/3 - "}SETUP YOUR WALLET</h3>
                <div className="mb-2">
                    <label>USERNAME</label>
                    <br/>
                    <input id="name-input" type="text" autoComplete="off" placeholder="Username" spellCheck="false" 
                        value={username} onChange={(e) => this.setState({username: e.target.value})}/>
                </div>

                <div className="mb-2">
                    <div className="d-flex justify-content-between">
                        <label>PUBLIC KEY</label>
                        <div className="d-flex align-items-center">
                            <label className="generate-key cursor-pointer mb-0" onClick={this.generateKey}>Generate</label>
                            { no_email ?
                                <div className="personal-key d-flex align-items-center ml-5">
                                    <input type="checkbox" id="personal-key" name="personal-key" 
                                        onChange={e => {
                                            this.setState({personal_key: e.target.checked})
                                            if (!e.target.checked && !valid_key) this.generateKey()
                                        }}/>
                                    <label className="mb-0 ml-2" htmlFor="personal-key">Use my own public key</label>
                                </div>
                                : null
                            }
                        </div>
                    </div>
                    <input type="text" autoComplete="off" placeholder="Public Key" spellCheck="false" readOnly={!personal_key}
                        value={public_key} onChange={(e) => {
                            const valid_key = PublicKey.fromPublicKeyString(e.target.value)
                            this.setState({public_key: e.target.value, valid_key: valid_key && true})
                        }}/>
                    {!valid_key ? <span className="text-danger">Invalid Key</span> : null}
                </div>
                {!personal_key ?
                    <React.Fragment>
                        <div className="mb-2">
                            <label>WALLET PASSWORD</label>
                            <br/>
                            <input id="pw-input" type="password" placeholder="Password"
                                value={password} onChange={(e) => this.setState({password: e.target.value})}/>
                        </div>

                        <div className="mb-2">
                            <label>CONFIRM WALLET PASSWORD</label>
                            <br/>
                            <input id="pwconf-input" type="password" placeholder="Confirm Password" spellCheck="false" 
                                value={confirm_password} onChange={(e) => this.setState({confirm_password: e.target.value})}/>
                        </div>
                    </React.Fragment>
                : null
                }

                <span className="error" hidden={!authError}>{errorMsg}</span><br/>

                <div className="text-center">
                    <button onClick={() => this.recaptcha.execute()} 
                        disabled={!valid_key || username.length == 0 || (!personal_key && (password.length == 0 || confirm_password.length == 0)) || processing}>
                        {processing ? <Loader /> : "REGISTER ACCOUNT"}
                    </button>
                    <Recaptcha
                        ref={ ref => this.recaptcha = ref }
                        sitekey="6Lc4OZ4UAAAAAEfECNb09tkSL_3UBCuV_sdITK5B"
                        onResolved={ this.registerAccount.bind(this) } />
                </div>
            </React.Fragment>
        )
    }

    keyCreateStep(step) {
        switch (step) {
            case 1:
                return <this.VerifyEmail />
            case 2:
                return <this.ConfirmEmail />
            case 3:
                return <this.Register />
            case 4:
                return <this.KeyDownload />
        }
    }

    async loadStore() {
        const storeName = await getItem("name")
        const storeEncrypted = await getItem("encrypted_data")
        this.setState({storeName, storeEncrypted})
    }

    ConnectEncrypted() {
        const self = this
        const { isMobile, network } = this.props
        const { encrypted_data, uploaded_file_msg, password, authError, errorMsg, scan_qr, bip58, storeName, storeEncrypted, processing } = this.state

        if (window.isApp) {
            function scanQR() {
                self.setState({processing: true})
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        // alert("We got a barcode\n" +
                        //     "Result: " + result.text + "\n" +
                        //     "Format: " + result.format + "\n" +
                        //     "Cancelled: " + result.cancelled);
                        if (result.text) {
                            self.setState({bip58: result.text, processing: false})
                        }
                    },
                    function (error) {
                        alert("Scanning failed: " + error);
                        self.setState({processing: false})
                    },
                    {
                        preferFrontCamera: false, // iOS and Android
                        showFlipCameraButton: true, // iOS and Android
                        showTorchButton: true, // iOS and Android
                        torchOn: false, // Android, launch with the torch switched on (if available)
                        saveHistory: false, // Android, save scan history (default false)
                        prompt: "Place QUANTA QRCode inside the scan area", // Android
                        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                        formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                        orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                        disableAnimations: true, // iOS
                        disableSuccessBeep: true // iOS and Android
                    }
                );                                
            }
            return (
                storeEncrypted ?
                <div className="input-container text-center">
                    <div className="text-secondary text-center mb-2">
                        Continue as <b>{storeName}</b> or&nbsp;
                        <span className="qt-color-theme"
                            onClick={() => {
                                const c = confirm("This will remove your credentials from current device. Make sure you have backup of you Private Key before continue!")
                                if (c) {
                                    clear()
                                    window.location.assign("/" + network + "/?app=true")
                                }
                            }}
                        >
                            Log Out
                        </span>
                    </div>
                    <div className="text-left">
                        <label>PASSWORD</label><br/>
                        <input type="password" name="password" placeholder="Password" 
                            value={password} onChange={(e) => this.setState({password: e.target.value})}
                            onKeyPress={e => {
                                if (e.key == "Enter" && password.length >= 8) {
                                    this.ConnectWithBin()
                                }
                            }}
                            />
                    </div>
                    <span className="text-danger small">{errorMsg}</span>
                    <button className="mt-5" 
                        disabled={password.length < 8}
                        onClick={() => this.ConnectWithBin()}>Connect Wallet</button>
                </div>
                    
                : 
                scan_qr ? 
                    bip58 ?
                    <div className="input-container">
                        <div className="d-inline-block" onClick={() => this.setState({bip58: ""})}>
                            <img src={devicePath("public/images/back-btn-black.svg")} />
                        </div>
                        <p className="mb-5 mt-4">
                            Key from QR Code: {bip58.slice(0,6)}.....{bip58.slice(-6)}
                        </p>
                        <div className="text-left">
                            <label>PASSWORD</label><br/>
                            <input type="password" name="password" placeholder="Password" 
                                value={password} onChange={(e) => this.setState({password: e.target.value})}
                                onKeyPress={e => {
                                    if (e.key == "Enter" && password.length > 0) {
                                        this.ConnectWithBin("qr")
                                    }
                                }}
                            />
                        </div>
                        <span className="text-danger small">{errorMsg}</span>
                        <button className="mt-5" 
                            disabled={password.length < 8}
                            onClick={() => this.ConnectWithBin("qr")}>Connect Wallet</button>
                    </div>
                    :
                    <div className="input-container text-center">
                        <p className="qt-font-small mb-5">
                            On your desktop, open the email containing your wallet QR code.
                        </p>

                        <button disabled={processing} onClick={scanQR.bind(this)}>{processing ? <Loader /> : "SCAN QR CODE"}</button>
                        <div className="mt-4 mb-5" onClick={() => this.resetInputs({scan_qr: !scan_qr})}>
                            Or <span className="qt-color-theme">Copy & Paste Base58 Key</span>
                        </div>
                    </div>
                :
                    <div className="input-container text-center">
                        <p className="qt-font-small mb-5">
                            On your desktop, open the email containing your wallet BIP58 encrypted key.
                        </p>
                        <div className="text-left">
                            <label>BIP58 ENCRYPTED KEY</label><br/>
                            <input type="text" name="bip58" placeholder="BIP58 Encrypted Key" 
                                value={bip58} onChange={(e) => this.setState({bip58: e.target.value})}
                            />
                        </div>
                        <div className="text-left">
                            <label>PASSWORD</label><br/>
                            <input type="password" name="password" placeholder="Password" 
                                value={password} onChange={(e) => this.setState({password: e.target.value})}
                                onKeyPress={e => {
                                    if (e.key == "Enter" && password.length >= 8 && bip58) {
                                        this.ConnectWithBin("bip58")
                                    }
                                }}
                                />
                        </div>
                        <span className="text-danger small">{errorMsg}</span>
                        <button className="mt-5" 
                            disabled={password.length < 8 || !bip58}
                            onClick={() => this.ConnectWithBin("bip58")}>Connect Wallet</button>
                        <div className="mt-4" onClick={() => this.resetInputs({scan_qr: !scan_qr})}>
                            Or <span className="qt-color-theme">Scan QR Code</span>
                        </div>
                    </div>
            )
        }

        return (
            <div className="input-container">
                {!encrypted_data && storeEncrypted ?
                <div className="text-secondary text-center mb-2">
                    Continue as <span className="qt-color-theme">{storeName}</span> or&nbsp;<label className="cursor-pointer" htmlFor="file"><u>browse your files.</u></label>
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
                        disabled={password.length < 8 || !(encrypted_data || storeEncrypted)}>
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
        const { regStep, referrer, referrer_error } = this.state
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
                    {this.keyCreateStep(regStep)}
                </div>
            </div>
        )
    }

    KeyDownload() {
        const { isMobile, network, mobile_nav } = this.props
        const { authError, errorMsg, no_email, personal_key, downloaded } = this.state
        return (
            <React.Fragment>
                <h5>ACCOUNT REGISTERED</h5>
                <div className="warning qt-font-light">
                    <h5>IMPORTANT INFORMATION</h5>
                    <ul>
                        <li>We do not store your encrypted or unencrypted key.</li>
                        {no_email ?
                            <li>You have elected not to use email backup, keep your private key safe.</li>
                        :
                            <li>We have emailed you your encrypted key and a QR code to login on your mobile app.</li>
                        }
                        {personal_key ?
                            null
                        :
                            <li>Your password is used to decrypt the wallet. We cannot recover this if you lose it.</li>
                        }
                        
                    </ul>
                </div>

                <div className="text-center mt-5">
                    {window.isApp ?
                        <button className="mb-2" onClick={mobile_nav}>CONTINUE</button>
                    :
                    personal_key ? 
                        null
                        :
                        <button className="mb-2" onClick={this.downloadKey}>DOWNLOAD JSON</button>
                    }

                    { personal_key || downloaded ?
                        <div className="link qt-font-small text-center mb-2" 
                            onClick={() => this.resetInputs({dialogType: "connect"})}>
                            <u>Proceed to Connect your Wallet</u>
                        </div>
                        : null
                    }
                    
                </div>
            </React.Fragment>
        )
    }

    render() {
        const { isMobile, network } = this.props
        const { dialogType } = this.state
        return (
            <div id="connect-dialog" className={dialog + " d-flex align-content-center qt-font-regular" + (isMobile ? " mobile" : "")} 
                onDragOver={(e)=> e.preventDefault()} onDrop={(e) => e.preventDefault()}>
                <div className={"container " + network}>
                    {!isMobile ? 
                        <div className="close-btn" onClick={this.closeDialog.bind(this)}><img src={devicePath("public/images/close_btn.svg")} /></div> 
                        : null
                    }
                    {dialogType == "create" ? 
                        <this.KeyCreate />
                        :
                        <this.KeyConnect />
                    }
                    <p>Your private keys are not sent to QUANTA. All transactions are signed within your browser 
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
