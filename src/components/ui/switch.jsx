import React, { Component } from 'react';
import { css } from 'emotion'
import ReactTooltip from 'react-tooltip'

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
        left: 11px;
    }

    &.dark {
        #container {
            border: 1px solid #333;
        }
        #switch {
            background-color: #333;
        }
        .active#container {
            background-color: transparent;
            border-color: #333;
        }
    }
`

export default class Switch extends Component {

    render() {
        const { label, onToggle, active, className, dataTip } = this.props
        return (
            <div className={container + " qt-font-extra-small " + (className || "")}>
                <span>{label}</span>
                <div id={"container"} className={(active ? "active" : "")} onClick={onToggle}>
                    <span id="switch"></span>
                </div>
                { dataTip ?
                    <React.Fragment>
				        <img className="ml-2" src={devicePath("public/images/question.png")} data-tip={dataTip} />
                        <ReactTooltip clickable={true} html={true} />
                    </React.Fragment>
                    : null
                }
            </div>
            
        )
    }
}