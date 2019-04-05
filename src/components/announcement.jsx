import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { css } from 'emotion'

const container = css`
    background: #23282c;
    height: 25px;
    overflow: hidden;
    
    a {
        white-space: nowrap;
        color: #ccc !important;
        padding: 5px;
    }
    a:hover {
        color: #66D7D7 !important;
    }
`

export default class Announcement extends Component {
    render() {
        const {announcements} = this.props
        return (
            <div id="announcements-container" 
                className={container + " " + this.props.className + " d-flex justify-content-around flex-wrap mb-1 qt-font-light"}>
                {announcements.map((item, index) => {
                    if (item.link.startsWith("http")) {
                        return <a key={index} href={item.link} target="_blank">{item.title}</a>
                    }
                    return <Link key={index} to={item.link}>{item.title}</Link>
                })}
            </div>
        )
    }
}