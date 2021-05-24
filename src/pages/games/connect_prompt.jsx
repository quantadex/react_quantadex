import React, { Component } from 'react'
import { css } from 'emotion'

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
        background: #fff;
        color: #666;
        border-radius: 5px;    
        width: 500px;
        max-width: 100%;
    }

    .close-btn {
        position: absolute;
        top: 15px;
        right: 20px;
    }

    button {
        width: 100% !important;
        height: 47px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5) !important;
        color: #777;
        cursor: pointer;
    }

    .roll-btn.secondary:hover {
        background: #ccc;
    }
`

export default class ConnectPrompt extends Component {
    render() {
        const { close, dispatch } = this.props
        return (
            <div className={container + " d-flex justify-content-center"}>
                <div className="info-container qt-font-small align-self-center text-center p-5 position-relative">
                    <div className="close-btn cursor-pointer" onClick={close}>
                        <img src="/react_quantadex/public/images/x_close.svg" height="12" alt="Close" />
                    </div>
                    <h4>Ready to win some real bitcoins?</h4>

                    <button className="roll-btn gold mt-5"
                        onClick={() => {
                            close()
                            dispatch({
                                type: "TOGGLE_CONNECT_DIALOG",
                                data: "create"
                            })
                        }}>
                        CREATE WALLET
                    </button>
                    <button className="roll-btn secondary mt-4"
                        onClick={() => {
                            close()
                            dispatch({
                                type: "TOGGLE_CONNECT_DIALOG",
                                data: "connect"
                            })
                        }}>
                        CONNECT WALLET
                    </button>
                </div>
            </div>
        )
    }
}