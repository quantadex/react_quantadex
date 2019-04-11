import React, { Component } from 'react';
import { connect } from 'react-redux'
import { css } from 'emotion'

const container = css `
    min-height: 50px;
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
        const { header } = this.props
        return (
            <div className={container + " d-flex align-items-center border-bottom border-dark px-3"}>
                { header.left ? 
                    <div className="left" onClick={header.left}>
                        <img src={header.left_icon ? header.left_icon : "/public/images/back-btn.svg"} />
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
}

const mapStateToProps = (state) => ({
	network: state.app.network,
    publicKey: state.app.publicKey,
    private_key: state.app.private_key
});

export default connect(mapStateToProps)(MobileHeader);