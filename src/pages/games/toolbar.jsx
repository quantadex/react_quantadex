import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    color: #fff;

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
        const { sounds, hot_keys, stats, toggleSounds, toggleHotkeys, toggleStats } = this.props
        
        return (
            <div className={container + " d-flex justify-content-center qt-font-extra-small text-center mt-5"}>
                <div className={"cursor-pointer mx-5" + (sounds ? "" : " inactive")}
                    onClick={toggleSounds}
                >
                    <img src={"/public/images/dice/sound-icon.svg"} />
                    <label>Sounds</label>
                </div>
                <div className={"cursor-pointer mx-5" + (hot_keys ? "" : " inactive")}
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