import React, { Component } from 'react'
import { css } from 'emotion'
import Loader from './ui/loader.jsx'
import CONFIG from '../config.js'
import { PrivateKey, Signature } from "@quantadex/bitsharesjs";
import { getItem, setItem } from "../common/storage.js";

const container = css `
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
            color: #999;
            font-size: 15px;

            tr {
                border-bottom: 1px solid #ccc;
            }

            td {
                padding: 5px 0;
            }

            td.btns-container {
                width: 300px;
            }

            button {
                background-color: #66d7d7;
                padding: 2px 15px;
                color: #fff;
                border-radius: 4px;
                width: 90px;
                height: 40px;
                font-size: 12px;
                cursor: pointer;
            }
            button:disabled {
                background-color: #999;
            }
        }
    }
`

export default class SendWyre extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false,
        }
        
        this.supported_coins = ["BTC", "ETH", "DAI"]
        this.scriptId = 'SendWyreScript'
    }

    async componentDidMount() {
        const script = document.createElement('script')
        script.id = this.scriptId
        script.src = 'https://verify.sendwyre.com/js/widget-loader.js'
        document.body.appendChild(script)

        const all_rates = await this.getRates()

        const rates = {}
        for (let coin of this.supported_coins) {
            rates[coin] = all_rates["USD" + coin]
        }
        this.setState({rates})
    }

    componentWillUnmount() {
        const script = document.querySelector(`#${this.scriptId}`)
        window.Wyre = undefined
        if (script) {
          script.remove()
        }
    }

    getRates() {
        return fetch("https://api.sendwyre.com/v3/rates").then(e => e.json())
    }

    async startWidget(asset, user, type) {
        this.setState({processing: true})
        const url = CONFIG.getEnv().API_PATH + "/node1/address/" + (asset == "BTC" ? "btc" : "eth") + "/" + user
        let address = await fetch(url, { mode: "cors" }).then(e => e.json())
        .then(e => {
            return e[e.length-1] && e[e.length-1].Address || null
        })

        if (!address) {
            address = await this.generateAddress(url)
        }

        if (address) {
            this.openWidget(asset, address, type)
        }

        this.setState({processing: false})
    }

    generateAddress(url) {
        return fetch(url, {
            method: "post",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: {}
        }).then(e => e.json())
        .then(res => {
            return res[0] && res[0].Address || null
        })
      }

    async openWidget(coin, address, type) {
        var deviceToken = await getItem("DEVICE_TOKEN");
        if(!deviceToken) {
            const sig = Signature.signBuffer(Buffer.from("SENDWYRETOKEN"), PrivateKey.fromWif(this.props.private_key)).toBuffer()
            deviceToken = sig.toString('base64').slice(0, 50)
            setItem("DEVICE_TOKEN", deviceToken);
        }
        // configure the widget to authenticate using the generated key
        var widget = new Wyre.Widget({
            env: CONFIG.getEnv().ENV == "testnet" ? "test" : "prod",
            accountId: CONFIG.getEnv().ENV == "testnet" ? "AC_C3CZWL2993W" : "AC_CZXRVLV4WUJ",
            auth: { 
                type: "secretKey",
                secretKey: deviceToken
            },
            operation: {
                type: type,
                destCurrency: coin,
                dest: (coin == "BTC" ? "bitcoin:" : "ethereum:") + address,
            }
        });
        widget.open()
        
        widget.on("complete", function(event) {
            console.log("Completed", event);
        });
    }

    render() {
        const { close, user } = this.props
        const { rates, processing } = this.state
        return (
            <div className={container + " popup-container"}>
                <div className="container">
                    <div className="close-btn" onClick={close}><img src={devicePath("public/images/close_btn.svg")} /></div>
                    <h4 className="mb-4">BUY CRYPTOCURRENCIES</h4>
                    <div className="input-container">
                        { rates ? 
                            <React.Fragment>
                                <table className="w-100 mb-4">
                                    <thead className="qt-font-bold">
                                        <tr>
                                            <td>COIN</td>
                                            <td className="text-right">PRICE</td>
                                            <td className="text-right"></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.supported_coins.map(coin => {
                                            return (
                                                <tr key={coin}>
                                                    <td>{coin}</td>
                                                    <td className="text-right">${rates[coin].toFixed(2)}</td>
                                                    <td className="btns-container text-right">
                                                        <button disabled={processing} onClick={() => this.startWidget(coin, user, "debitcard")}>
                                                            { processing ? <Loader /> : "Buy with Debit"}
                                                        </button>
                                                        <button disabled={processing} className="ml-3" onClick={() => this.startWidget(coin, user, "onramp")}>
                                                            { processing ? <Loader /> : "Buy with Bank"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <span className="qt-font-small">
                                    <b>Fees:</b> 0.75% transaction fee or $1 minimum (domestic), $15 (global) <br/>
                                    <b>Minimum:</b> $5.00 <br/>
                                    <b>Estimated Time:</b> 30 minutes
                                </span>
                            </React.Fragment>
                            : <Loader type="box" className="text-center" />
                        }
                    </div>
                </div>
            </div>
        )
    }

}