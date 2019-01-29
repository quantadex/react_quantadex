import React, { Component } from 'react';
import { Link } from 'react-router-dom'
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

export default class MobileHeader extends Component {

    render() {
        return (
            <div className={container + " d-flex p-4 justify-content-between border-bottom border-dark"}>
                <Link to="/exchange" className="header-logo"><img src="/public/images/qdex-fantasy-light.svg" height="26" /></Link>
                <Menu style={{padding: 0, alignSelf: "center"}}/>
            </div>
        )
    }
}