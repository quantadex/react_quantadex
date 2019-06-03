import React, { Component } from 'react';
import NavHeader from './nav_header.jsx'
import MarketBox from './markets.jsx'
import Reasons from './reasons.jsx'
import Media from './media.jsx'
import Footer from './footer.jsx'

export default class Landing extends Component {
    render() {
        return (
            <div style={{fontSize: "initial", color: "#555"}}>
                <NavHeader />
                <MarketBox />
                <Reasons />
                <Media />
                <Footer />
            </div>
        )
    }
}