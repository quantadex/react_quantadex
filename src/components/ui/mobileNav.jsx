import React, { Component } from 'react';
import { css } from 'emotion'

const container = css `
    position: fixed;
    width: 100%;
    height: 63px;
    bottom: 0;
    background-color: #222730;
    padding: 8px 0 5px;
    z-index: 99;

    .nav-item {
        flex: 1 1 auto;
        text-align: center;
        font-size: 12px;
        color: #72747a;
    }
    .nav-item.active {
        color: #66d7d7;
    }
`

export default class MobileNav extends Component {
    render() {
        const {selectedTabIndex} = this.props
        return (
            <div className={container + " d-flex"}>
                { this.props.tabs.names.map((tab, index) => {
                    return (
                        <div key={index}
                            className={"nav-item" + (selectedTabIndex == index ? " active" : "")}
                            onClick={() => {
                                this.setState({selectedTabIndex: index})
                                    this.props.switchTab(index)
                            }}>
                            <img src={`/public/images/menuicons/${tab.toLowerCase()}-${selectedTabIndex == index ? "on" : "off"}.svg`} height="32" />
                            <br/>
                            {tab}
                        </div>
                    )
                })}
            </div>
        )
    }
}