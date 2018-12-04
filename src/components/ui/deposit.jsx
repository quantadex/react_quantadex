import React, {PropTypes} from 'react';

import { css } from 'emotion'
import globalcss from '../global-css.js'

const container = css`
  margin:0 -15px;
  padding: 22px 0;

  .content-container {
    background-color:white;
    height:298px;
    padding: 36px;

    .qr-code {
      width:223px;
      height:223px;
      background-color:black;
    }

    .content {
      margin-left: 32px;
      max-width: calc(100% - 300px);

      .header-container {
        margin-left:22px;

        .header {
          font-size:18px;
          color: #ff3282;
          letter-spacing:0.7px;
        }

        .sub-header {
          color: #28303c;
          letter-spacing: 0.5px;
        }
      }

      .address-container {
        border-radius: 2px;
        border: solid 1px rgba(151, 151, 151,0.27);
        padding: 12px 12px 12px 18px;
        margin-top:41px;
        color:black;

        .link {
          max-width:calc(100% - 164px);
          word-wrap:break-word;
        }

        .copy-btn {
          padding:22px 27px;
          width: 93px;
          height: 40px;
          border-radius: 2px;
          background-color: ${globalcss.COLOR_THEME};
          border: solid 1px ${globalcss.COLOR_THEME};
          color:white;
        }
      }

      .explain {
        letter-spacing: 0.5px;
        color: rgba(40, 48, 60,0.76);
        margin-top:42px;
      }
    }
  }
`

export default class QTDeposit extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={container}>
        <div className="content-container d-flex">
          <div className="qr-code"></div>
          <div className="content d-flex flex-column">
            <div className="d-flex align-items-center">
              <img src="/assets/images/attention.svg" width="30" height="37.5" />
              <div className="header-container d-flex flex-column">
                <span className="header qt-font-semibold">Send only CHAT (ChatCoin) to this deposit address.<br /></span>
                <span className="sub-header qt-font-small">Sending any other currency to this address may result in the loss of your deposit.</span>
              </div>
            </div>
            <div className="address-container d-flex justify-content-between align-items-center">
              <div className="link qt-font-small">DdzFFzCqrhsqsimEyCtvAUEbow79mQ79dk9TudSd5tk9cC2nB3ozgkzDhqUFCXhuXcmvAngzjkxb3gWSPqLK8RUwZRk6mDfaTFYXchST</div>
              <div className="qt-cursor-pointer qt-font-bold qt-font-small copy-btn d-flex align-items-center">
                <span>Copy</span>
              </div>
            </div>
            <div className="explain qt-font-extra-small ">
              Coins will be deposited immediately after 15 network confirmation<br />
              After making a deposit, you can track its progress on the transaction history page.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

QTDeposit.propTypes = {
};
