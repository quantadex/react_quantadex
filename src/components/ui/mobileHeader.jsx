import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { css } from 'emotion'
import Connect from "../connect.jsx"
import Menu from "../menu.jsx"

const container = css `
    min-height: 60px;
    z-index: 999;

    .left, .right {
        position: absolute;
    }

    .right {
        right: 15px;
    }
`

class MobileHeader extends Component {
    render() {
        const { header, publicKey, mobile_nav } = this.props

        if (window.isApp) {
            return (
                <div className={container + " d-flex align-items-center border-bottom border-dark px-3"}>
                    { header.left ? 
                        <div className="left" onClick={header.left}>
                            <img src={header.left_icon ? header.left_icon : devicePath("public/images/back-btn.svg")} />
                        </div>
                        : null
                    }
                    <div className="text-uppercase qt-font-bold qt-font-normal mx-auto">{header.header}</div>
                    { header.right ?
                        <div className="right" onClick={header.right.action}>{header.right.label}</div>
                        : null
                    }
                </div>
            )
        }

        return (
            <div className={container + " d-flex justify-content-between align-items-center border-bottom border-dark px-3"}>
                <div><Link to={"/" + window.location.search}><img src={devicePath("public/images/logo.svg")} alt="QUANTADEX" /></Link></div>
                { publicKey ?
                    <Menu mobile_nav={mobile_nav}/>
                    :
                    <Connect type="link" mobile_nav={mobile_nav} />
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
	network: state.app.network,
    publicKey: state.app.publicKey,
    private_key: state.app.private_key
});

export default connect(mapStateToProps)(MobileHeader);