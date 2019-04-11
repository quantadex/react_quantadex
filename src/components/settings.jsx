import React, { Component } from 'react';
import { css } from 'emotion'
import { connect } from 'react-redux'
import { LOGIN } from "../redux/actions/app.jsx";

const container = css`
    .menu-item {
        padding: 15px 20px;
        color: #f2f2f2;
        background-color: #222730;
    }

    .nav {
        background: #222730 url("/public/images/right-arrow.svg") no-repeat calc(100% - 10px) 50%;
    }
`

class Settings extends Component {
    
    render() {
        const { mobile_nav, publicKey, private_key, name, dispatch } = this.props
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
            title: "Lock Wallet",
            hide: !private_key && true,
            action: () => dispatch({ type: LOGIN, private_key: null })
        },{
            title: "Logout",
            hide: !private_key && !publicKey,
            action: () => {
                localStorage.clear()
                window.location.assign(window.isApp ? "index.html" : (window.location.pathname.startsWith("/testnet") ? "/testnet" : "/mainnet"))
            }
        }]

        return (
            <div className={container + " qt-font-small mt-5"}>
                {tabs.map((item, index) => {
                    if (item.hide) return
                    return (
                        <div key={index} className={"menu-item mb-4" + (item.nav ? " nav" : "")} onClick={item.action}>
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