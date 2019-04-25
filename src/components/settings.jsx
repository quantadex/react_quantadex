import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN } from "../redux/actions/app.jsx";
import {clear, removeItem} from '../common/storage.js'

const container = css`
    .menu-item {
        padding: 15px 20px;
        color: #f2f2f2;
        background-color: #222730;
    }

    .nav {
        background: #222730 url(${devicePath("public/images/right-arrow.svg")}) no-repeat calc(100% - 10px) 50%;
    }
`

class Settings extends Component {
    
    render() {
        const { mobile_nav, publicKey, private_key, name, dispatch, network } = this.props
        const tabs = [{
            title: "Create Wallet",
            nav: true,
            hide: publicKey && true,
            action: () => mobile_nav("create")
        },{
            title: publicKey && !private_key ? "Unlock Wallet" : "Connect to Wallet",
            nav: true,
            hide: private_key && true,
            action: () => mobile_nav("connect")
        },{
            title: "Sign / Verify",
            nav: true,
            action: () => mobile_nav("message")
        },{
            title: "Export Private Key",
            nav: true,
            hide: !private_key && true,
            action: () => mobile_nav("export_key")
        },{
            title: "Lock Wallet",
            hide: !private_key && true,
            action: () => {
                removeItem("private_key")
                dispatch({ type: LOGIN, private_key: null })
            },
            className: "mt-5"
        },{
            title: "Logout",
            hide: !private_key && !publicKey,
            action: () => {
                const c = confirm("This will remove your credentials from current device. Make sure you have backup of you Private Key before continue!")
                if (c) {
                    clear()
                    window.location.assign("/" + network + "/?app=true")
                }
            }
        },{
            title: <a href="https://quantadex.zendesk.com/hc/en-us" target="_blank">Customer Support</a>,
            className: "mt-5"
        }]

        return (
            <div className={container + " qt-font-small mt-5"}>
                {tabs.map((item, index) => {
                    if (item.hide) return
                    return (
                        <div key={index} className={"menu-item mb-4" + (item.nav ? " nav" : "") + (item.className ? " " + item.className : "")} onClick={item.action}>
                            {item.title}
                        </div>
                    )
                })}
                
                { publicKey ?
                    <div className="d-flex justify-content-around px-4 mb-4 text-secondary">
                        <span>Wallet: {name}</span>
                        <span>Status: { private_key ? "Unlock" : "Locked"}</span>
                    </div>
                    : null
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    network: state.app.network,
    name: state.app.name,
    publicKey: state.app.publicKey,
    private_key: state.app.private_key
});

export default connect(mapStateToProps)(Settings);