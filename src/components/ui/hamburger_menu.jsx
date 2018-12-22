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
        <a><img src="/public/images/menuicons/hamburger.svg" width="16" height="16" /></a>
        <div className={"hamburger-menu flex-column position-absolute qt-font-small qt-font-regular " + (this.state.menuOpen ? 'd-flex' : 'd-none')}>
          {
            this.props.menuList.map((e, index) => {

              // if (index == 0) {
              //   return (
              //     <div className="group-head d-flex flex-column align-items-center justify-content-center">
              //       <div className="header qt-font-light">{e.items[0].header}</div>
              //       <div className="subheader"><a className="qt-cursor-pointer qt-color-theme">hide</a>{e.items[0].subheader}</div>
              //     </div>
              //   )
              // }

              return (
                <div className={"group " + css`background-color:${e.backgroundColor};`}>
                  {
                    e.items.map((item) => {
                      if (item.onClick) {
                        return (
                          <a onClick={item.onClick}
                             className="d-flex menu-row qt-cursor-pointer"
                             onMouseOver={this.handleHover.bind(this,item.iconPathActive)}
                             onMouseLeave={this.handleHover.bind(this,item.iconPath)}>
                            <img src={item.iconPath} />
                            <div>{item.text}</div>
                          </a>
                        )
                      } else {
                        return (
                          <Link to={item.url}
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


HamburgerMenu.defaultProps = {
  menuList: [
  //   {
  //   items: [{
  //     header:"$12.560",
  //     subheader:" estimated funds"
  //   }]
  // },
  {
    items: [{
      iconPath:"/public/images/menuicons/quanta-grey.svg",
      iconPathActive:"/public/images/menuicons/quanta-white.svg",
      text:"Exchange",
      url:"/exchange"
    }]
  },{
    items: [{
      iconPath:"/public/images/menuicons/wallet-grey.svg",
      iconPathActive:"/public/images/menuicons/wallet-white.svg",
      text:"Wallets",
      url:"/exchange/wallets"
    },
  //   {
  //     iconPath:"/public/images/menuicons/deposit-grey.svg",
  //     iconPathActive:"/public/images/menuicons/deposit-white.svg",
  //     text:"Deposit / Withdraw",
  //     url:"/exchange/wallets"
  //   },{
  //     iconPath:"/public/images/menuicons/fund-history-grey.svg",
  //     iconPathActive:"/public/images/menuicons/fund-history-white.svg",
  //     text:"Funds History",
  //     url:"/exchange/history"
  //   },{
  //     iconPath:"/public/images/menuicons/order-history-grey.svg",
  //     iconPathActive:"/public/images/menuicons/order-history-white.svg",
  //     text:"Orders History",
  //     url:"/exchange/orders"
  //   }]
  // },{
  //   items: [{
  //     iconPath:"/public/images/menuicons/referral-grey.svg",
  //     iconPathActive:"/public/images/menuicons/referral-white.svg",
  //     text:"Referrals",
  //     url:"/referrals"
  //   }]
  // },{
  //   items: [{
  //     iconPath:"/public/images/menuicons/profile-grey.svg",
  //     iconPathActive:"/public/images/menuicons/profile-white.svg",
  //     text:"Profile",
  //     url:"/exchange/wallets"
  //   }
  ],
    backgroundColor:"rgba(40, 48, 52,0.36)"
  },{
    items: [{
      iconPath:"/public/images/menuicons/quanta-grey.svg",
      iconPathActive:"/public/images/menuicons/quanta-white.svg",
      text:"Logout",
      url:"/login"
    }],
    backgroundColor:"#323b40"
  }]
}

HamburgerMenu.propTypes = {
};

const mapStateToProps = (state) => ({
	private_key: state.app.private_key,
});

export default connect(mapStateToProps)(withRouter(HamburgerMenu))