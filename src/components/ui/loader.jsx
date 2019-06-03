import React, { Component } from 'react';
import { css } from 'emotion'

const loader = css`
    border: 3px solid rgba(255,255,255,0.5);
    border-radius: 50%;
    border-top: 3px solid #fff;
    width: 20px;
    height: 20px;
    margin: auto;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
        
    @-webkit-keyframes spin {
        0% { -webkit-transform: rotate(0deg); }
        100% { -webkit-transform: rotate(360deg); }
    }
        
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`

const fb_loader = css`
    .lds-facebook {
        display: inline-block;
        position: relative;
        width: 64px;
        height: 64px;
    }
    .lds-facebook div {
        display: inline-block;
        position: absolute;
        left: 6px;
        width: 13px;
        background: rgba(0,0,0,0.5);
        animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
    }
    .lds-facebook div:nth-child(1) {
        left: 6px;
        animation-delay: -0.24s;
    }
    .lds-facebook div:nth-child(2) {
        left: 26px;
        animation-delay: -0.12s;
    }
    .lds-facebook div:nth-child(3) {
        left: 45px;
        animation-delay: 0;
    }
    @keyframes lds-facebook {
        0% {
        top: 6px;
        height: 51px;
        }
        50%, 100% {
        top: 19px;
        height: 26px;
        }
    }
  
`

export default class Loader extends Component {
    render() {
        if (this.props.type == "box") {
            return (
                <div className={fb_loader} style={{width: this.props.size, height: this.props.size, margin: this.props.margin}}>
                    <div className="lds-facebook"><div></div><div></div><div></div></div>
                </div>
            )
        } else {
            return (
                <div className={loader} style={{width: this.props.size, height: this.props.size, margin: this.props.margin}}></div>
            )
        }
        
    }
}