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

const keys_list = css `
    background: rgba(255,255,255, 0.6);
    color: #125750;
    border-radius: 100px;
    width: min-content;
    white-space: nowrap;
    margin: auto;

    span {
        margin: 0 10px;
    }
`

export default class Toolbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    render() {
        const { sounds, hot_keys, stats, toggleSounds, toggleHotkeys, toggleStats, className } = this.props
        
        return (
            <React.Fragment>
                <div className={container + " toolbar-container justify-content-center qt-font-extra-small text-center " + (className || "")}>
                    <div className={"cursor-pointer mx-5" + (sounds ? "" : " inactive")}
                        onClick={toggleSounds}
                    >
                        <img src={"/public/images/dice/sound-icon.svg"} />
                        <label>Sounds</label>
                    </div>
                    { hot_keys !== undefined ?
                        <div className={"cursor-pointer mx-5" + (hot_keys ? "" : " inactive")}
                            onClick={toggleHotkeys}
                        >
                            <img src={"/public/images/dice/hot-keys.svg"} />
                            <label>Hot Keys</label>
                        </div>
                        : null
                    }
                    
                    <div className={"cursor-pointer mx-5" + (stats ? "" : " inactive")}
                        onClick={toggleStats}
                    >
                        <img src={"/public/images/dice/live-stats.svg"} />
                        <label>Live Stats</label>
                    </div>
                </div>

                { hot_keys !== undefined && hot_keys ?
                    <div className={keys_list + " d-flex justify-content-around py-2"}>
                        <span>Space - Roll Dice</span>
                        <span>F - Flip Bet</span>
                        <span>S - Half Bet</span>
                        <span>D - Double Bet</span>
                    </div>
                    : null
                }
                
            </React.Fragment>
        )
    }
}