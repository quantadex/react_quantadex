import React, { Component } from 'react';
import { css } from 'emotion'

const container = css `
    width: 100%;
    height: 40px;

    .nav-item {
        flex: 1 1 auto;
        text-align: center;
        font-size: 12px;
        color: #72747a;
    }
    .nav-item.active {
        color: #66d7d7;
    }

    &.app {
        background-color: #222730;
        height: 63px;
        padding: 8px 0 5px;
    }

    &.web {
        background-color: #393a3b;
        align-items: center;

        .nav-item {
            color: #eee;
            font-size: 16px;
            border-right: 1px solid #555;
        }
        
        .nav-item.active {
            color: #66d7d7;
        }

        .nav-item:last-child {
            border: 0;
        }
    }
`

export default class MobileNav extends Component {
    render() {
        const {hide, selectedTabIndex, tabs, switchTab} = this.props
        return (
            <div className={container + (hide ? " d-none" : " d-flex") + (window.isApp ? " app" : " web")}>
                { tabs.names.map((tab, index) => {
                    return (
                        <div key={index}
                            className={"nav-item" + (selectedTabIndex == index ? " active" : "")}
                            onClick={() => {
                                switchTab(index)
                            }}>
                            {
                                window.isApp ?
                                <React.Fragment>
                                    <img src={`/public/images/menuicons/${tab.toLowerCase()}-${selectedTabIndex == index ? "on" : "off"}.svg`} height="32" />
                                    <br/>
                                </React.Fragment>
                                : null
                            }
                            {tab}
                        </div>
                    )
                })}
            </div>
        )
        
    }
}