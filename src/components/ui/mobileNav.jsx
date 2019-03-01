import React, { Component } from 'react';
import { css } from 'emotion'

const container = css `
    background-color: #393a3b;

    .nav-item {
        flex: 1 1 auto;
        text-align: center;
        padding: 10px 0;
        border-left: 1px solid #444;
        font-size: 14px;
    }
    .nav-item.active {
        color: #2ed4cf;
    }
`

export default class MobileNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
          selectedTabIndex:this.props.selectedTabIndex,
        }
    }

    componentWillReceiveProps(nextProps) {
		if (nextProps.selectedTabIndex != undefined && nextProps.selectedTabIndex != this.state.selectedTabIndex) {
			this.setState({
				selectedTabIndex: nextProps.selectedTabIndex
			  })
		}
    }
    
    render() {
        return (
            <div className={container + " d-flex"}>
                { this.props.tabs.names.map((tab, index) => {
                    return (
                        <div key={index} data-index={index} 
                            className={"nav-item" + (this.state.selectedTabIndex == index ? " active" : "")}
                            onClick={(e) => {this.setState({selectedTabIndex:e.target.dataset.index})
                                    this.props.switchTab(e.target.dataset.index)
                            }}>
                            {tab}
                        </div>
                    )
                })}
            </div>
        )
    }
}