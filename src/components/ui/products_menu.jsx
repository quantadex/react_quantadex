import React, {PropTypes} from 'react';
import { css } from 'emotion'
import { Link } from 'react-router-dom'

const container = css`
    position: relative;

    .menu {
        position: absolute;
        top: 50px;
        background: #4c4c4c;
        border-radius: 3px;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
        border: solid 1px rgba(35, 40, 44, 0.13);
        left: 50%;
        transform: translateX(-50%);
        z-index: 99;
        margin-top: -15px;
        width: 260px;
    }

    .menu::after {
        content: "";
        border: solid 10px transparent;
        border-bottom-color: #4c4c4c;
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
    }

    a {
        display: flex;
        padding: 10px 20px !important;
        cursor: pointer;
        width: 100% !important;
    }

    a:hover {
        background: #656565;
    }

    .icon {
        width: 35px;
        text-align: center;
        margin-right: 10px;
    }
`

export default class ProductsMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        menuOpen: false
    }

    this.toggleMenu = this.toggleMenu.bind(this)
  }

  toggleMenu(e) {
    const menu = this.refs.menu;
    var isClickInside = menu.contains(e.target);
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
    const { className } = this.props
    const network = this.props.network || "mainnet"
    return (
      <div ref="menu" className={container + (className ? " " + className : "")}>
            <img className="cursor-pointer" src="/public/images/grid.svg" />
            { this.state.menuOpen ?
                <div className="menu d-flex flex-column py-4">
                    <Link to={"/" + network}>
                        <div className="icon">
                            <img src="/public/images/advanced-trader-interface.svg" />
                        </div>
                        <img src="/public/images/quantadex_link.svg" />
                    </Link>
                    <Link to={"/" + network + "/dice"}>
                        <div className="icon">
                            <img src="/public/images/dice.svg" />
                        </div>
                        <img src="/public/images/quantadice_link.svg" />
                    </Link>
                    <a href={"http://explorer.quantadex.com/" + network}>
                        <div className="icon">
                            <img src="/public/images/explorer.svg" />
                        </div>
                        <img src="/public/images/quantaexplorer_link.svg" />
                    </a>
                </div>
                : null
            }
            
      </div>
    )
  }
}
