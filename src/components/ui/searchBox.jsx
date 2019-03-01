import React, { Component } from 'react';
import { css } from 'emotion'

const container = css `
    width: 150px;
    border-radius: 50px;
    text-align: left;
    padding: 0 35px 0 20px;
    font-size: 13px;
    background: url(/public/images/search.png) no-repeat calc(100% - 15px) 50%;
`

export default class SearchBox extends Component {
    render() {
        return (
            <input className={container} spellCheck="false" onClick={(e) => e.stopPropagation()}
				onChange={this.props.onChange} placeholder={this.props.placeholder} style={this.props.style} />
        )
    }
}