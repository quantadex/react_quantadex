import React, { Component } from 'react';
import { css } from 'emotion'

const container = css `
    width: 150px;
    border-radius: 50px;
    text-align: left;
    padding: 0 35px 0 20px;
    font-size: 13px;
    background: url(${devicePath("public/images/search.png")}) no-repeat calc(100% - 15px) 50%;
`

export default class SearchBox extends Component {
    // really silly way to remove the autocomplete on chrome
    render() {
        return (
            <input className={container} spellCheck="false" autoComplete="nope" onClick={(e) => e.stopPropagation()}
				onChange={this.props.onChange} placeholder={this.props.placeholder} style={this.props.style} />
        )
    }
}