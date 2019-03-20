import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { ConnectLink } from '../connect.jsx';
import { css } from 'emotion'
import Menu from '../menu.jsx';

const container = css `
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    background: #121517;
    z-index: 999;
    
    .header-logo {
		margin-bottom: -2px;
	}
`

class MobileHeader extends Component {
    handleConnectDialog(type) {
        this.setState({dialog: type})
        setTimeout(() => {
            document.getElementById("connect-dialog").style.display = "flex"
        }, 0)
    }

    render() {
        return (
            <div className={container + " d-flex p-4 justify-content-between border-bottom border-dark"}>
                <Link to="/exchange" className="header-logo"><img src={this.props.network == "mainnet" ? devicePath("public/images/logo-light.svg") : devicePath("public/images/qdex-fantasy-light.svg")} height="26" /></Link>
                {this.props.private_key ? <Menu isMobile={true} style={{padding: 0, alignSelf: "center", minWidth: 0}}/> : <ConnectLink isMobile={true} onOpen={this.handleConnectDialog.bind(this)} />}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
	network: state.app.network,
    private_key: state.app.private_key,
});


export default connect(mapStateToProps)(MobileHeader);