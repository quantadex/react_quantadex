import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Connect, { ConnectDialog } from '../connect.jsx';
import { css } from 'emotion'
import Menu from '../menu.jsx';

const container = css `
    background: #121517;
    z-index: 999;
    
    .header-logo {
		margin-bottom: -2px;
	}
`

class MobileHeader extends Component {

    render() {
        return (
            <React.Fragment>
                <div className={container + " d-flex p-4 justify-content-between border-bottom border-dark"}>
                    <Link to="/exchange" className="header-logo"><img src={this.props.network == "mainnet" ? devicePath("public/images/logo-light.svg") : devicePath("public/images/qdex-fantasy-light.svg")} height="26" /></Link>
                    {this.props.publicKey ? 
                        <Menu isMobile={true} style={{padding: 0, alignSelf: "center", minWidth: 0}}/> 
                        : <Connect type="link" isMobile={true}/>}
                </div>
                { this.props.connectDialog ? 
					<ConnectDialog default={this.props.connectDialog} 
						network={this.props.network} 
						dispatch={this.props.dispatch}/> 
					: null
				}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
	network: state.app.network,
    publicKey: state.app.publicKey,
    private_key: state.app.private_key,
    connectDialog: state.app.ui.connectDialog
});


export default connect(mapStateToProps)(MobileHeader);