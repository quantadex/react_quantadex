import React, { Component } from 'react';
import { css } from 'emotion'

const loader = css `
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

export default class Loader extends Component {
    render() {
        return (
            <div className={loader} style={{width: this.props.size, height: this.props.size, margin: this.props.margin}}></div>
        )
    }
}