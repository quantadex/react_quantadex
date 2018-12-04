import React, {PropTypes} from 'react';

import { css } from 'emotion'
import globalcss from '../global-css.js'

const container = css`
  margin:0 -15px;
  height:298px;
  background-color:white;
  color: #28303c;

  input {
    border: solid 1px rgba(34, 40, 44,0.27);
    border-radius: 2px;
  }

  .left {
    width: 50%;
    border-right: 1px solid rgba(151, 151, 151,0.17);
    padding:32px;

    .attention {
      background: url("/public/images/attention.svg");
      width: 30px;
      height:37.5px;
      flex-shrink: 0;
    }

    .left-content {
      margin-left: 32px;

      .title {
        font-size: 18px;
        color: #ff3282;
        letter-spacing: 0.7px;
      }

      .main-text {
        letter-spacing: 0.6px;
        margin-top:10px;
      }

      .footer-text {
        opacity: 0.76;
        letter-spacing: 0.5px;
        margin-top:42px;
      }
    }
  }

  .right {
    width: 50%;
    padding:32px;

    .address-container input {
      width:100%;
    }

    .amount-container {
      margin-top:15px;

      input, .submit-btn {
        width: calc(50% - 8px);
        height:40px;
      }

      .submit-btn {
        background-color: ${globalcss.COLOR_THEME};
        color: #ffffff;
        text-align:center;
        border-radius: 2px;
      }
    }

    .result-container {
      margin-top: 58px;
      font-size: 13px;
    }
  }
`

export default class QTWithdraw extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={container + " d-flex"}>
        <div className="left d-flex">
          <div className="attention"></div>
          <div className="left-content d-flex flex-column">
            <span className="title qt-font-semibold">
              Minimum withdrawal:4 CHAT
            </span>
            <span className="main-text qt-font-normal">
              Do not withdrawal directly to a crowdfund or ICO.
              We will not credit your account with tokens from that sale.
            </span>
            <span className="footer-text qt-font-extra-small">
              Once you have submitted your withdrawal request, we
              will send a confirmation email. Please then click on the
              confirmation link in your email. After making a
              withdrawal, you can track its progress on the history page.
            </span>

          </div>
        </div>
        <div className="right d-flex flex-column">
          <div className="address-container">
            <div className="qt-font-extra-small">CHAT WITHDRAW ADDRESS</div>
            <input />
          </div>
          <div className="amount-container">
            <div className="qt-font-extra-small">AMOUNT</div>
            <div className="content d-flex justify-content-between">
              <input />
              <div className="submit-btn qt-font-small qt-font-semibold qt-cursor-pointer d-flex align-items-center justify-content-center"><span>Submit</span></div>
            </div>
          </div>
          <div className="result-container d-flex justify-content-between">
            <div>
              <span className="qt-font-bold">Transaction Fee</span><br />
              0.00000000
            </div>
            <div>
              <span className="qt-font-bold">You Will Get</span><br />
              0.00000000
            </div>
            <div>
              <span className="qt-font-bold">24h Withdraw Limit</span><br />
              0 / 2 BTC
            </div>
          </div>
        </div>
      </div>
    );
  }
}

QTWithdraw.propTypes = {
};
