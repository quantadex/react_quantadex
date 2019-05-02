import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    background-color: #2e3744;
    color: #fff;
    padding: 50px 80px 80px;

    .group a{
        display: block;
        color: rgba(255,255,255,0.3);
        font-size: 15px;
        line-height: 35px;
    }
`

export default class Footer extends Component {
    render() {
        return (
            <React.Fragment>
                <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MVB2VB5"
                                height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

                <section className={container + " footer"}>
                    <div className="container">
                        <div className="row footer-row d-flex flex-column flex-md-row justify-content-between">
                            <div className="footer-logo-list">
                                <a href="/"><img className="footer-logo" src="/public/images/group-4.svg" alt=""/></a>
                                <div className="logo-sub-header qt-font-small my-3">
                                    DECENTRALIZED<br />EXCHANGE
                                </div>
                                <p className="footer-brand-text qt-font-extra-small qt-white-27">
                QUANTA Foundation, Ltd is a<br/> registered Singaporean company<br/> (UEN: 201814412H).
                                </p>
                            </div>
                            <div className="footer-link-group">
                                <span className="footer-header">COMMUNITY</span>
                                <div className="group">
                                    <a href="https://www.facebook.com/quantadexchange/" target="_blank">Facebook</a>
                                    <a href="https://twitter.com/quantadex" target="_blank">Twitter</a>
                                    <a href="https://t.me/quantadex" target="_blank">Telegram</a>
                                </div>
                            </div>
                            <div className="footer-link-group">
                                <span className="footer-header">ORGANIZATION</span>
                                <div className="group">
                                    <a href="http://legacy.quantadex.com/about">QUANTA Foundation</a>
                                    <a href="http://legacy.quantadex.com/press">Press</a>
                                    <a href="http://legacy.quantadex.com/contact">Contact</a>
                                </div>
                            </div>
                            <div className="footer-link-group">
                                <span className="footer-header">DOCUMENTATION</span>
                                <div className="group">
                                    <a href="http://legacy.quantadex.com/whitepaper">White Paper</a>
                                    <a href="https://quantadex.zendesk.com/hc/en-us">Support Center</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </React.Fragment>
        )
    }
}