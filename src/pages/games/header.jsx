import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    height: 80px;
    background: rgb(168,157,59);
    background: linear-gradient(165deg,rgba(168,157,59,1) 10%,rgba(230,213,69,1) 59%,rgba(168,157,59,1) 90%);
    box-shadow: 0 1px 3px;
    border-bottom: 1px solid #d6c740;

    .avail-fund {
        width: 160px;
        background: #b09520;
        border-radius: 3px;
        padding: 5px 15px;
        box-shadow: 1px 1px 1px #fde829;
    }

    .user-data {
        color: #fff;
    }
`

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    render() {
        const { fund } = this.props
        return (
            <div className={container + " d-flex justify-content-between align-items-center px-5"}>
                <img src="/public/images/dice/logo.svg" alt="QUANTA DICE" />
                <div className="user-data d-flex qt-font-normal align-items-center">
                    <div className="avail-fund text-right">{fund}</div>
                    <div className="pl-5">CONNECT WALLET</div>
                </div>
            </div>
        )
    }

}