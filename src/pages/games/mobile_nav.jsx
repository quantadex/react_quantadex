import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    position: fixed;
    bottom: 0;
    width: 100%;
    background: #015249;
    min-height: 50px;
    text-align: center;
    box-shadow: 0px -1px 1px rgba(0,0,0,0.1);
    user-select: none;
    z-index: 999;
    
    div {
        color: #fff;
        font-size: 15px;
        font-weight: bold;
        width: 100%;
        height: 100%;
        line-height: 50px;
        color: rgba(255,255,255,0.5);
    }

    div:nth-child(2) {
        border-left: 1px solid rgba(255,255,255,0.2);
        border-right: 1px solid rgba(255,255,255,0.2);
    }

    div.active {
        color: #fff;
    }
`

export default class MobileNav extends Component {
    render() {
        const { show_bets, show_chat, onClick } = this.props
        
        return (
            <div className={container + " d-flex d-lg-none justify-content-around align-items-center"}>
                <div className={"cursor-pointer" + (show_chat ? " active" : "")} 
                    onClick={() => onClick({show_chat: true, show_bets: false})}>CHAT</div>
                <div className={"cursor-pointer" + (show_chat || show_bets ? "" : " active")} 
                    onClick={() => onClick({show_chat: false, show_bets: false})}>DICE</div>
                <div className={"cursor-pointer" + (show_bets ? " active" : "")} 
                    onClick={() => onClick({show_bets: true, show_chat: false})}>BETS</div>
            </div>
        )
    }
}