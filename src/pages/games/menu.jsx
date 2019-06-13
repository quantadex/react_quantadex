import React, { Component } from 'react'
import { css } from 'emotion'
import { Link } from 'react-router-dom'
import { TOGGLE_CONNECT_DIALOG, LOGOUT } from '../../redux/actions/app.jsx'

const container = css`
    position: relative;

    .menu {
        position: absolute;
        top: 30px;
        right: 0;
        border-radius: 3px;
        background: #fff;
        color: #377a5d;
        white-space: nowrap;
        box-shadow: 0px 1px 5px rgba(0,0,0,0.5);

        .menu-item {
            a {
                color: #377a5d;
            }
        } 
    }
`

export default class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
        menuOpen:false
        }
        this.toggleMenu = this.toggleMenu.bind(this)
        
        const { dispatch } = this.props
        this.menuItems = [
        {label : "Connect Wallet", 
            onClick: () => {
            dispatch({
                type: TOGGLE_CONNECT_DIALOG,
                data: "connect"
            })
            },
            disabled: (connected) => connected
        },
        {label : "Deposit", link: `/${this.props.network}/wallets#Dice`, disabled: (connected) => !connected},
        {label : "Logout", 
            onClick: () => {
            dispatch({
                type: LOGOUT,
            })
            },
            disabled: (connected) => !connected
        },
        ]
    }

    toggleMenu(e) {
        const Menu = this.refs.Menu;
        var isClickInside = Menu.contains(e.target);
        if (isClickInside) {
        this.setState({menuOpen:!this.state.menuOpen})
        } else {
        this.setState({menuOpen:false})
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.toggleMenu)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.toggleMenu)
    }

    render() {
        const { connected } = this.props
        const { menuOpen } = this.state
        return (
            <div ref="Menu" className={container}>
                <img className="cursor-pointer" src={devicePath("public/images/hamb.svg")} width="18" height="18" />
                { menuOpen ?
                    <div className="menu">
                        { this.menuItems.map((item, index) => {
                            if (item.disabled(connected)) return
                            return (
                                <div key={index} className="menu-item my-3 mx-4 cursor-pointer"
                                onClick={item.onClick}
                                >
                                    { item.link ? <Link to={item.link} >{item.label}</Link> : item.onClick ? item.label : null }
                                </div>
                            )
                        })}
                    </div>
                    : null
                }
            </div>
        )
    }
}
