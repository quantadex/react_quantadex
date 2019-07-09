import React, { Component } from 'react'
import { css } from 'emotion'
import QTDeposit from '../../components/ui/deposit.jsx'

const container = css `
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 999;

    .info-container {
        width: 600px;
        max-width: 100%;
    }

`

export default class Deposit extends Component {
    render() {
        const { close, asset, isETH } = this.props
        return (
            <div className={container + " d-flex justify-content-center"}>
                <div className="info-container qt-font-small align-self-center text-center p-5 position-relative">
                    <QTDeposit asset={asset} handleClick={close} quantaAddress={name} 
                        isETH={isETH} vertical={true}/>
                </div>
            </div>
        )
    }
}