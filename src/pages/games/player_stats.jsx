import React, { Component } from 'react'
import { css } from 'emotion'
import { GetAccount } from "../../redux/actions/app.jsx"
import Loader from '../../components/ui/loader.jsx'
import Utils from '../../common/utils.js'
import CONFIG from '../../config.js'

const container = css `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    min-height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 999;

    .info-container {
        background: #fff;
        color: #666;
        border-radius: 5px;    
        width: 600px;
        max-width: 100%;
    }

    .menu {
        position: absolute;
        left: 50%;
        top: 25px;
        transform: translateX(-50%);
        background: #333;
        border-radius: 3px;
        padding: 5px 10px;
        font-size: 12px;
        color: #fff;
        white-space: nowrap;
    }

    .menu::after {
        content: "";
        border: solid 5px transparent;
        position: absolute;
        border-bottom-color: #333;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
    }

    .arrow {
        font-size: 20px;
        line-height: 0px;
    }

    h4 {
        width: max-content;
    }

    table {
        img {
            width: 15px;
            margin-left: 5px;
        }

        tr {
            line-height: 35px;
        }

        tbody td {
            color: #888;
        }
    }

    .win {
        color: #57bc90;
    }

    .loss {
        color: #e17055;
    }

    .close-btn {
        position: absolute;
        top: 15px;
        right: 20px;
    }
`

export default class PlayerStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            show_menu: false,
        }

        this.toggleMenu = this.toggleMenu.bind(this)
    }

    async componentDidMount() {
        const { id } = this.props
        const data = {}
        const account = await GetAccount(id)
        const name = account.name
        const acc_id = account.id
        const risk = (await fetch(CONFIG.getEnv().API_PATH + "/account?filter_field=operation_type&filter_value=50&size=100&type=agg_by_risk&account_id=" + acc_id).then(e => e.json()))[0].buckets
        const payout = (await fetch(CONFIG.getEnv().API_PATH + "/account?filter_field=operation_type&filter_value=50&size=100&type=agg_by_payout&account_id=" + acc_id).then(e => e.json()))[0].buckets
        const loss = (await fetch(CONFIG.getEnv().API_PATH + "/account?filter_field=operation_type&filter_value=50&size=100&type=agg_by_loss&account_id=" + acc_id).then(e => e.json()))[0].buckets

        for (let asset of risk) {
            data[asset.key] = { bet_count: asset.doc_count, bet_total: asset.total_risk.value }
        }

        for (let asset of payout) {
            Object.assign(data[asset.key], { payout_count: asset.doc_count, payout_total: asset.total_payout.value })
        }

        for (let asset of loss) {
            Object.assign(data[asset.key], { loss_count: asset.doc_count, loss_total: asset.total_payout.value })
        }

        this.setState({data, name, init: true})

        document.addEventListener('click', this.toggleMenu, true)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.toggleMenu, true)
    }

    toggleMenu(e) {
        if (e.target.className == "menu" || !this.props.allow_action) return
        const NameMenu = this.refs.NameMenu
        if (NameMenu.contains(e.target)) {
            this.setState({show_menu: !this.state.show_menu})
        } else {
            this.setState({show_menu: false})
        }
    }

    render() {
        const { close, sendTip } = this.props
        const { name, data, init, show_menu } = this.state
        return (
            <div className={container + " d-flex justify-content-center"} onClick={close}>
                <div className="info-container text-center qt-font-small align-self-center p-5 position-relative" onClick={(e) => e.stopPropagation()}>
                    <div className="close-btn cursor-pointer" onClick={close}>
                        <img src="/public/images/x_close.svg" height="12" alt="Close" />
                    </div>
                    { init ?
                        <React.Fragment>
                            <h4 ref="NameMenu" className="mb-5 mx-auto position-relative cursor-pointer">
                                <b>{name} <span className="arrow">{String.fromCharCode(9662)}</span></b>
                                { show_menu ?
                                    <div className="menu" onClick={(e) => {
                                        sendTip(name)
                                        close()
                                    }}>
                                        Send Tip
                                    </div>
                                    : null
                                }
                                
                            </h4>

                            { Object.keys(data).length > 0 ?
                                <table className="w-100">
                                    <thead>
                                        <tr>
                                            <th>Bets</th>
                                            <th>Wins</th>
                                            <th>Losses</th>
                                            <th>Wagered</th>
                                            <th>Profit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(data).map((asset_id) => {
                                            const row = data[asset_id]
                                            const asset = window.assets[asset_id]
                                            const payout_count = row.payout_count || 0
                                            const payout_total = row.payout_total || 0
                                            const loss_total = row.loss_total || 0
                                            const profit = payout_total + loss_total
                                            return (
                                                <tr key={asset_id}>
                                                    <td>{Utils.localeString(row.bet_count)}</td>
                                                    <td>{Utils.localeString(payout_count)}</td>
                                                    <td>{Utils.localeString(row.bet_count - payout_count)}</td>
                                                    <td>
                                                        {Utils.localeString(row.bet_total / Math.pow(10, asset.precision), asset.precision)}
                                                        <img src={`/public/images/coins/${asset.symbol.toLowerCase()}.svg`} 
                                                            onError={(e) => {
                                                                e.target.src='/public/images/crosschain-coin.svg'}
                                                            }
                                                            title={row.symbol} 
                                                        />
                                                    </td>
                                                    <td className={profit > 0 ? "win" : "loss"}>
                                                        {Utils.localeString(profit / Math.pow(10, asset.precision), asset.precision)}
                                                        <img src={`/public/images/coins/${asset.symbol.toLowerCase()}.svg`} 
                                                            onError={(e) => {
                                                                e.target.src='/public/images/crosschain-coin.svg'}
                                                            }
                                                            title={asset.symbol} 
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                : <span>Has not made any bet</span>
                            }
                        </React.Fragment>
                        : <Loader type="box" />
                    }
                </div>
            </div>
        )
    }
}