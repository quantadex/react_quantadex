import React, { Component } from 'react';
import { css } from 'emotion';
import { GetAccountBalances } from "../../redux/actions/app.jsx"

const container = css `
    color: #fff;
    background: #555;
    margin-top: auto;

    h1 {
        color: rgb(211,174,13);
        background: rgb(211,174,13);
        background:  -webkit-linear-gradient(rgba(211,174,13,1) 25%, rgba(255,237,71,1) 50%, rgba(211,174,13,1) 60%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .num-box {
        font-size: 25px;
        font-weight: bold;
        text-align: center;
        width: 30px;
        animation: 0.3s ease-out flipIn;
    }

    @keyframes flipIn {
        0% {
            transform: rotateX(90deg);
        }
        100% {
            transform: rotateX(0deg);
        }
    }
`


export default class Jackpot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: 0,
            precision: 5,
        }
    }

    componentDidMount() {
        this.getBalance()
        setInterval(() => {
            this.getBalance()
        }, 1000)
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getBalance() {
        if (!this.props.init) return 

        const asset = window.assetsBySymbol[this.props.asset]
        GetAccountBalances("1.2.2", [asset.id]).then((e) => {
            this.setState({amount: e[0].amount, precision: asset.precision})
        })
    }

    render() {
        const { amount, precision } = this.state
        const { asset } = this.props
        const num_arr = (amount/Math.pow(10, precision)).toFixed(precision).split("")
        
        return (
            <div className={container + " text-center p-4 qt-font-bold"}>
                <h1 className="qt-font-bold">JACKPOT</h1>
                <div className="pot-amount d-flex justify-content-center align-items-center">
                    <img className="mr-4" height="25" src={devicePath(`public/images/coins/${asset.toLowerCase()}.svg`)} 
                        onError={(e) => {
                            e.target.src=devicePath('public/images/crosschain-coin.svg')
                        }}
                        title={asset} 
                    />
                    { num_arr.map((char, index) => {
                        return <div key={char+index} className="num-box" >{char}</div>
                    })}
                </div>
            </div>
        )
    }
}