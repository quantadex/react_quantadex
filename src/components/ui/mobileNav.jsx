import React, { Component } from 'react';
import { css } from 'emotion'

const container = css `
    background-color: #222730;
    padding: 8px 0 5px;

    .nav-item {
        flex: 1 1 auto;
        text-align: center;
        font-size: 12px;
        color: #72747a;
    }
    .nav-item.active {
        color: #2db7e4;
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
        const {selectedTabIndex} = this.state
        return (
            <div className={container + " d-flex"}>
                { this.props.tabs.names.map((tab, index) => {
                    return (
                        <div key={index} data-index={index} 
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