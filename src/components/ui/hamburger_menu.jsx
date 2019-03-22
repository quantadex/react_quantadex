import React, {PropTypes} from 'react';
import { Redirect, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { LOGIN } from '../../redux/actions/app.jsx'
import { css } from 'emotion'

import { Link } from 'react-router-dom'

const container = css`
  position: relative;

  .hamburger-menu {
    width:205px;
    background-color: #454f56;
    box-shadow: 0 2px 34px 0 rgba(0, 0, 0, 0.5);
    position:absolute;
    right:0;
    top:30px;
    z-index:9999;

    .group-head {
      height: 69px;
      border-bottom: solid 1px rgba(18, 21, 23,0.24);

      .header {
        font-size:30px;
        line-height:32px;
      }

      .subheader {
        font-size:12px;
      }
    }

    .group {
      padding: 16px 0;
      border-bottom: solid 1px rgba(18, 21, 23,0.24);

      .menu-row {
        padding:6px 0 6px 24px;
      }

      .menu-row div {
        pointer-events: none;
      }

      .menu-row img {
        margin-right:18px;
        pointer-events: none;
      }
    }
  }

`

export class HamburgerMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen:false,
      hoverIndex:-1
    }

    this.toggleMenu = this.toggleMenu.bind(this)
  }

  toggleMenu(e) {
    const hamburgerMenu = this.refs.hamburgerMenu;
    var isClickInside = hamburgerMenu.contains(e.target);
    if (isClickInside) {
      this.setState({menuOpen:!this.state.menuOpen})
    } else {
      this.setState({menuOpen:false})
    }
  }

  handleHover(img,e) {
    const image = e.target.getElementsByTagName("IMG")[0];
    if(image.src) {
      image.src = img
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.toggleMenu)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.toggleMenu)
  }

  render() {
    const a = Math.random()
    return (
      <div ref="hamburgerMenu" className={container}>
        <a><img src={devicePath("public/images/menuicons/hamburger.svg")} width="16" height="16" /></a>
        <div className={"hamburger-menu flex-column position-absolute qt-font-small qt-font-regular " + (this.state.menuOpen ? 'd-flex' : 'd-none')}>
          {
            this.props.menuList.map((e, index) => {

              if (index == 0) {
                return (
                  <div key={index} className="group-head d-flex flex-column align-items-center justify-content-center">
                    <div className="header qt-font-light">${this.props.total_fund ? this.props.total_fund.toLocaleString(navigator.language, {maximumFractionDigits: 0}): "N/A"}</div>
                    <div className="subheader">{e.items[0].subheader}</div> {/*<a className="qt-cursor-pointer qt-color-theme">hide</a>*/}
                  </div>
                )
              }

              return (
                <div key={index} className={"group " + css`background-color:${e.backgroundColor};`}>
                  {
                    e.items.map((item, index) => {
                      if (item.onClick) {
                        return (
                          <a key={index} onClick={item.onClick}
                             className="d-flex menu-row qt-cursor-pointer"
                             onMouseOver={this.handleHover.bind(this,item.iconPathActive)}
                             onMouseLeave={this.handleHover.bind(this,item.iconPath)}>
                            <img src={item.iconPath} />
                            <div>{item.text}</div>
                          </a>
                        )
                      } else {
                        if ( this.props.network == "mainnet" && item.text == "Leaderboard" ) return
                        return (
                          <Link key={index} to={item.text == "Exchange" ? item.url + this.props.currentTicker.replace("/", "_") : item.url}
                                onMouseOver={this.handleHover.bind(this,item.iconPathActive)}
                                onMouseLeave={this.handleHover.bind(this,item.iconPath)}
                                className="d-flex menu-row">
                            <img src={item.iconPath} />
                            <div>{item.text}</div>
                          </Link>
                        )
                      }
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }
}

var net = window.location.pathname.startsWith("/testnet") ? "testnet" : "mainnet"
HamburgerMenu.defaultProps = {
  menuList: [
    {
    items: [{
      header:"$12.560",
      subheader:" estimated funds"
    }]
  },
  {
    items: [{
      iconPath: devicePath("public/images/menuicons/quanta-grey.svg"),
      iconPathActive: devicePath("public/images/menuicons/quanta-white.svg"),
      text:"Exchange",
      url:"/" + net + "/exchange/"
    }]
  },{
    items: [{
      iconPath: devicePath("public/images/menuicons/wallet-grey.svg"),
      iconPathActive: devicePath("public/images/menuicons/wallet-white.svg"),
      text:"Wallets",
      url:"/" + net + "/wallets"
    },{
      iconPath: devicePath("public/images/menuicons/quanta-grey.svg"),
      iconPathActive: devicePath("public/images/menuicons/quanta-white.svg"),
      text:"Sign/Verify",
      url:"/" + net + "/message"
    },
    {
      iconPath: devicePath("public/images/menuicons/quanta-grey.svg"),
      iconPathActive: devicePath("public/images/menuicons/quanta-white.svg"),
      text:"Leaderboard",
      url:"/" + net + "/leaderboard"
    },
  ],
    backgroundColor:"rgba(40, 48, 52,0.36)"
  },{
    items: [{
      iconPath: devicePath("public/images/menuicons/quanta-grey.svg"),
      iconPathActive: devicePath("public/images/menuicons/quanta-white.svg"),
      text:"Logout",
      onClick: () => {
        window.location.assign(window.isApp ? "index.html" : "/")
      }
    }],
    backgroundColor:"#323b40"
  }]
}

HamburgerMenu.propTypes = {
};

const mapStateToProps = (state) => ({
  total_fund: state.app.totalFundValue,
  currentTicker: state.app.currentTicker,
  network: state.app.network
});

export default connect(mapStateToProps)(withRouter(HamburgerMenu))