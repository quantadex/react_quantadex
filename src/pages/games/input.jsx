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
        text-align: left;
        padding: 10px;
        color: #555;
        border: 1px solid #026a5f;
        border-radius: 3px;
        width: 100%;
        background: #fff;
        text-align: center;
    }

    input:disabled {
        background: #f5f5f5;
    }

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
`

export default class DiceInput extends Component {
    render() {
        const { label, type, step, min, value, disabled, onChange, onBlur, children } = this.props

        return (
            <div className={container}>
                <label>{label}</label>
                <div className="d-flex justify-">
                    {children}
                    <input type={type} step={step} min={min} value={value} 
                        disabled={disabled}
                        onChange={onChange}
                        onBlur={onBlur}
                        onKeyPress={e => {
                            if (e.key == "Enter") onBlur(e)
                        }} />
                </div>
                
            </div>
        )
    }
}