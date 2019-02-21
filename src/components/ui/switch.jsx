import React, { Component } from 'react';
import { css } from 'emotion'

const container = css `
    #container {
        display: inline-block;
        position: relative;
        width: 25px;
        height: 14px;
        border: 1px solid rgba(255,255,255,0.27);
        border-radius: 20px;
        vertical-align: middle;
        margin-left: 10px;
    }
    
    #switch {
        position: absolute;
        left: 0;
        background-color: #fff;
        width: 10px;
        height: 10px;
        margin: 1px;
        border-radius: 20px;
        transition: left 0.1s;
    }

    .active#container {
        background-color: #68d1ce;
        border-color: #68d1ce;
    }

    .active #switch {
        left: 10px;
    }
`

export default class Switch extends Component {
    handleSwitch(toggle) {
        const el = document.getElementById("container")
        if (el.classList.contains("active")) {
            el.classList.remove("active")
            toggle(false)
        } else {
            el.classList.add("active")
            toggle(true)
        }
    }

    render() {
        return (
            <div className={container + " qt-font-extra-small"}>
                <span>{this.props.label}</span>
                <div id="container" onClick={this.handleSwitch.bind(this, this.props.onToggle)}>
                    <span id="switch"></span>
                </div>
            </div>
            
        )
    }
}