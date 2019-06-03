import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    margin-top: 10px;
    margin-left: 10px;
    width: 100%;
    white-space: nowrap;

    label {
        display: block;
        width: 110px;
        text-transform: uppercase;
        margin-right: 10px;
        font-size: 14px;
        color: #777;
    }
    input {
        padding: 10px;
        color: #555;
        width: 100%;
        background: #fff;
        text-align: center;
    }

    input:disabled {
        background: #eee;
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
            line-height: 35px;
        }
    }

    
`

export default class DiceInput extends Component {
    render() {
        const { label, type, step, min, value, disabled, onChange, onBlur, after, children } = this.props

        return (
            <div className={container}>
                <label>{label}</label>
                <div className="d-flex">
                    {children}
                    <div className="input-field d-flex position-relative w-100">
                        <input type={type} step={step} min={min} value={value} 
                            disabled={disabled}
                            onFocus={(e) => e.target.select()}
                            onChange={onChange}
                            onBlur={onBlur}
                            onKeyPress={e => {
                                if (e.key == "Enter") onBlur(e)
                            }} />
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