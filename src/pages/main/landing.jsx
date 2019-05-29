import React, { Component } from 'react';
import NavHeader from './nav_header.jsx'
import MarketBox from './markets.jsx'
import Reasons from './reasons.jsx'
import Media from './media.jsx'
import Footer from './footer.jsx'
import { css } from 'emotion'

const styles = css`
background-color: #000000;
background-image: linear-gradient(315deg, #000000 0%, #414141 74%);

height: 100vh;
width: 100vw;
    div {
        position: relative;
        margin-left: auto;
        margin-right: auto;      
        width: 500px;
        top: 200px;
        text-align: center;
    }

    a {
        font-size: 18px;
        margin-top: 50px;
        
    }
    a.btn {
        color: #ccc;
    }

    @media (max-width: 640px) {
        div {
            width: 100%;

            img {
                width: 100%;
            }
        }
    }
`;

export default class Landing extends Component {
    render() {
        return (
            <div class={styles}>
                <div>
                    <img src="/public/images/logo.svg" width="500"/>
                    <a href="/mainnet/exchange/ETH_BTC" className="btn btn-link">LAUNCH EXCHANGE ></a>
                </div>                    
            </div>
        )
    }
}