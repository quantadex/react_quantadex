import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    color: #fff;
    margin-top: 120px;

    label {
        display: block;
    }

    .inactive {
        opacity: 0.5;
    }
`

export default class Toolbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    render() {
        const {  } = this.state
        const { sounds, hot_keys, stats, toggleSounds, toggleHotkeys, toggleStats, className } = this.props
        
        return (
            <div className={container + " toolbar-container justify-content-center qt-font-extra-small text-center " + (className || "")}>
                <div className={"cursor-pointer mx-5" + (sounds ? "" : " inactive")}
                    onClick={toggleSounds}
                >
                    <img src={"/public/images/dice/sound-icon.svg"} />
                    <label>Sounds</label>
                </div>
                <div className={"cursor-pointer mx-5 d-none d-lg-block" + (hot_keys ? "" : " inactive")}
                    onClick={toggleHotkeys}
                >
                    <img src={"/public/images/dice/hot-keys.svg"} />
                    <label>Hot Keys</label>
                </div>
                <div className={"cursor-pointer mx-5" + (stats ? "" : " inactive")}
                    onClick={toggleStats}
                >
                    <img src={"/public/images/dice/live-stats.svg"} />
                    <label>Live Stats</label>
                </div>
            </div>
        )
    }
}