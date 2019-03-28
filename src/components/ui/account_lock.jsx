import React, { Component } from 'react';
import { connect } from 'react-redux'
import {LOGIN} from "../../redux/actions/app.jsx";

class Lock extends Component {
    render() {
        const {private_key} = this.props
        return (
            <img className="cursor-pointer mr-3"
                src={private_key ? devicePath('public/images/acc_unlock.svg') : devicePath('public/images/acc_lock.svg')} 
                alt={private_key ? "Unlocked" : "Locked"}
                title={private_key ? "Unlocked" : "Locked"}
                onClick={private_key ? () => {
                    this.props.dispatch({
                        type: LOGIN,
                        private_key: null
                    })
                }
                : this.props.unlock
                }
            />
        )
    }
}

export class LockIcon extends Component {
    render() {
        return (
            <img src={devicePath('public/images/white_lock.svg')} 
                style={this.props.centerText ? { opacity: "0.5", marginLeft: "-22px", marginTop: "-4px"} 
                                             : { opacity: "0.5", marginTop: "-4px"}}
            />
        )
    }
}

const mapStateToProps = (state) => ({
    private_key: state.app.private_key
});

export default connect(mapStateToProps)(Lock);