import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    margin: 10px 5px 0;
    width: 100%;
    white-space: nowrap;

    label {
        display: block;
        width: 110px;
        text-transform: uppercase;
        margin-right: 10px;
        margin-bottom: 0;
        font-size: 12px;
        color: #777;
    }
    input {
        color: #555;
        width: 100%;
        background: #fff;
        text-align: center;
    }

    input:disabled {
        background: #eee;
        color: #999;
    }

    input::-moz-selection { background: #ccc; }
    input::selection { background: #ccc; }

    .toggle {
        align-self: center;
        background: #ccc;
        color: #777;
        padding: 5px;
        margin-right: 2px;
        border-radius: 3px;
        cursor: pointer;
    }

    .toggle.active {
        background: #555;
        color: #fff;
    }

    .input-field {
        border: 1px solid #026a5f;
        border-radius: 3px;
        overflow: hidden;

        .after {
            position: absolute;
            right: 0;
            align-self: center;
            background: #eee;
            color: #999;
            padding: 0 10px;
            cursor: default;
            line-height: 32px;
            user-select: none;
        }

        .asset-symbol {
            position: absolute;
            height: 50%;
            top: 25%;
            right: 10px;
        }
    }

    .offset {
        input {
            min-width: 0;
        }
        .after {
            position: static;
            height: 32px;
        }
    }
`

export default class DiceInput extends Component {
    render() {
        const { label, type, step, min, value, disabled, onChange, onBlur, after, children, offset, asset, className } = this.props

        return (
            <div className={container + " " + (className || "")}>
                <label>{label}</label>
                <div className="d-flex">
                    {children}
                    <div className={"input-field d-flex position-relative w-100" + (offset ? " offset" : "") }>
                        <div className="position-relative w-100">
                            <input type={type} step={step} min={min} value={value} 
                                disabled={disabled}
                                onFocus={(e) => e.target.select()}
                                onChange={onChange}
                                onBlur={onBlur}
                                onKeyPress={e => {
                                    if (e.key == "Enter") onBlur(e)
                                }} />
                            
                            { asset ?
                                <img className="asset-symbol"
                                    src={devicePath(`public/images/coins/${asset.toLowerCase()}.svg`)} 
                                    onError={(e) => {
                                        e.target.src=devicePath('public/images/crosschain-coin.svg')
                                    }}
                                    title={asset} 
                                />
                                : null
                            }
                        </div>
                        { after ?
                            after
                            : null
                        }
                    </div>
                </div>
                
            </div>
        )
    }
}