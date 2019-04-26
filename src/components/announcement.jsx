import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import Carousel from 'react-bootstrap/Carousel'

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

const carousel_container = css `
    .carousel-indicators {
        bottom: -15px;
    }
`

export default class Announcement extends Component {
    render() {
        const {announcements, image} = this.props

        if (image) {
            return (
                <div className={carousel_container}>
                    <Carousel
                        controls={true}
                    >
                        {announcements.map((item, index) => {
                            if (!item.banner) return null
                            return (
                                <Carousel.Item key={index}>
                                    <div>
                                        <a href={item.link} target="_blank">
                                            <img className="w-100" src={item.banner} alt={item.title} />
                                        </a>
                                    </div>
                                </Carousel.Item>
                            )
                        })}
                    </Carousel>
                </div>
            )
        }

        return (
            <div id="announcements-container" 
                className={container + " " + this.props.className + " d-flex justify-content-around flex-wrap mb-1 qt-font-light"}>
                {announcements.map((item, index) => {
                    if (item.link.startsWith("http")) {
                        return <a key={index} href={item.link} target="_blank">{item.title}</a>
                    }
                    return <Link key={index} to={item.link + window.location.search}>{item.title}</Link>
                })}
            </div>
        )
    }
}