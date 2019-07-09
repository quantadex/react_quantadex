import React, { Component } from 'react';
import { css } from 'emotion';
import Carousel from 'react-bootstrap/Carousel'

const container = css`
    background: #23282c url('/public/images/head_bg.png') no-repeat 70%;
    color: #fff;

    .carousel-indicators {
        bottom: -25px;
    }

    .announce-item, .announce-carousel {
        border: 2px solid rgba(255,255,255,0.5);
    }

    .announce-item {
        overflow: hidden;
        width: 30%;

        img {
            width: 100%;
        }
    }

    .announce-carousel {
        width: max-content;
        max-width: 100%;
        overflow: hidden;

        img {
            max-height: 200px;
            max-width: 100%;
        }
    }
`

export default class Announcement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            announcements: []
        }
    }
    componentDidMount() {
        fetch("https://s3.amazonaws.com/quantachain.io/announcement_mainnet.json").then(e => e.json())
		.then(data => {
			const entries = data.entries
			if (entries && entries.length > 0) {
				this.setState({announcements: entries.slice(0,3)})
			}
		}).catch(e=>{
			console.log(e)
		})
    }
    
    render() {
        const {announcements} = this.state
        return (
            <div className={container}>
                <div className="container py-4 px-3">
                    <h1>Experience the Future of DEX</h1>
                    <h3>Private. Low fee. Fast. Secure.</h3>
                    <div className="d-none d-lg-flex justify-content-between my-4">
                        {announcements.map((item, index) => {
                            if (!item.banner) return null
                            return (
                                <div key={index} className="rounded announce-item">
                                    <a href={item.link} target="_blank">
                                        <img src={item.banner} alt={item.title} />
                                    </a>
                                </div>
                            )
                        })}
                    </div>

                    <div className="d-lg-none text-center">
                        <Carousel
                            controls={false}
                        >
                            {announcements.map((item, index) => {
                                if (!item.banner) return null
                                return (
                                    <Carousel.Item key={index}>
                                        <div className="mx-auto rounded announce-carousel">
                                            <a href={item.link} target="_blank">
                                                <img src={item.banner} alt={item.title} />
                                            </a>
                                        </div>
                                    </Carousel.Item>
                                )
                            })}
                        </Carousel>
                    </div>
                </div>
            </div>
        )
    }
}