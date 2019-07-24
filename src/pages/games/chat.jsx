import React, { Component } from 'react';
import { css } from 'emotion';
import ReactGA from 'react-ga';
import UserTip from './user_tip.jsx'

const container = css `
    height: 100%;
    position: relative;
    background: #015249;
    width: 30%;
    overflow: hidden;

    .messages {
        height: calc(100% - 70px);
        padding: 20px 14px 0px 20px;

        .bet-id {
            text-decoration: underline;
            cursor: pointer;
            color: #bad0ce;
        }

        .bet-id:hover {
            color: #fff;
        }
    }

    .message {
        background: rgba(255,255,255,0.1);
        border-radius: 5px;
        width: 100%;

        .name {
            color: #a8c6c4;
        }

        .msg {
            color: #fff;
            word-break: break-word;
        }
    }

    .menu {
        position: absolute;
        background: #1b645c;
        border: 2px solid #57a38b;
        color: #fff;
        left: 50%;
        transform: translateX(-50%);
        width: max-content;
        border-radius: 4px;
        cursor: pointer;
        z-index: 1;
    }

    .menu.top {
        bottom: 20px;
    }

    .menu.bottom {
        top: 25px;
    }

    .menu div {
        padding: 0 20px;
    }

    .menu div:hover {
        background: #57a38b;
    }

    .menu::after {
        content: "";
        border: solid 10px transparent;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .menu.top::after {
        border-top-color: #57a38b;
    }

    .menu.bottom::after {
        border-bottom-color: #57a38b;
        bottom: 100%;
    }

    .arrow {
        font-size: 18px;
        line-height: 0px;
    }

    .bot-msg {
        color: #fff;
        border-radius: 5px;
        word-break: break-word;
        border: 1px solid rgba(255,255,255,0.3);
        
        .bot-name {
            text-transform: uppercase;
            line-height: 25px;
        }

        .user-name {
            white-space: nowrap;
            display: inline-block;
        }
    }
    
    .message-input {
        position:absolute;
        bottom: 0;
        padding: 10px;
        background: #015249;

        textarea {
            height: 50px;
            resize: none;
            padding: 10px;
            border: 0;
            border-radius: 5px;
            color: #555;
        }

        button {
            border-radius: 5px;
            background: #57a38b;
            color: #fff;
        }
    }
`

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            message: "",
            menu: null,
            tip_user: null
        }

        this.messagesEnd = React.createRef();
        this.onMessage = this.onMessage.bind(this)
        this.post = this.post.bind(this)
        this.closeMenu = this.closeMenu.bind(this)
    }

    componentDidMount() {
        this.config = {
            firebase: {
              apiKey: "AIzaSyCwbyI8f9wUMIXE34-MZRKM_O9xixMiJn8",
              authDomain: "quantadice-01.firebaseapp.com",
              databaseURL: "https://quantadice-01.firebaseio.com",
              projectId: "quantadice-01",
              storageBucket: "quantadice-01.appspot.com",
              messagingSenderId: "81485966475",
              appId: "1:81485966475:web:dbb871925a9b99a2"
            },
            channel: this.props.network + '_channel_1',
            user: 'anonymous',
            delayRender: false
        }
        this.scriptId = 'FirebaseScript'

        if (document.querySelector(`#${this.scriptId}`)) {
            this.onLoad()
        } else {
            const script = document.createElement('script')
            script.id = this.scriptId
            script.src = 'https://www.gstatic.com/firebasejs/4.3.1/firebase.js'
            document.body.appendChild(script)
            script.onload = () => {
                this.onLoad()
            }
        }

        window.addEventListener("focus", () => {
			this.scrollToBottom()
        });
        
        document.addEventListener('click', this.closeMenu, true)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user != this.state.user) {
            this.setState({user: nextProps.user})
            this.setUser(nextProps.user)
        }

        if (nextProps.shared_message) {
            const { message } = this.state
            this.setState({message: (message ? message + " " + nextProps.shared_message : nextProps.shared_message) + " "})
        }

        if (nextProps.tip_user) {
            this.setState({tip_user: nextProps.tip_user})
        }

        if(nextProps.show_chat && !this.props.show_chat) {
            this.scrollToBottom()
        }
    }

    componentWillUnmount() {
        this.destroy()
        document.removeEventListener('click', this.closeMenu, true)
    }

    closeMenu(e) {
        if (["menu", "menu-item"].includes(e.target.className)) return
        this.setState({menu: null})
    }

    onLoad(initRef = true) {
        this.config.user = this.config.user || 'anonymous'
        this.initFirebase(initRef)
    }

    initFirebase(initRef) {
        if (!window.firebase) {
          return false
        }
    
        if (!this.db) {
          var app = window.firebase.initializeApp(this.config.firebase)
          this.db = app.database()
        }
        
        if (initRef) {
            this.setState({messages: []})
            this.initRef()
        }
    }
    
    initRef() {
        const channel = (this.config.channel || '').replace(/[^a-zA-Z\d]/gi, '_')

        if (!this.db) {
            return false
        }

        this.ref = this.db.ref(`quantadice/${channel}`)
        this.ref.off('child_added', this.onMessage)
        this.ref.limitToLast(20)
        .on('child_added', this.onMessage)

        setTimeout(() => {
            this.scrollToBottom(false)
        }, 1000)
    }
    
    // setChannel (channel) {
    //     if (channel === this.config.channel) {
    //         return false
    //     }

    //     this.config.channel = channel
    //     this.onLoad()
    // }
    
    setUser (user) {
        if (user === this.config.user) {
            return false
        }

        this.config.user = user
        this.onLoad(false)
    }

    parseMessage(message, bet_ids = []) {
        if (message.includes("/bet ")) {
            message = message.replace(/\/bet /g, " /bet ").replace(/\s+/g,' ').trim()
            let parseMsg
            const arr = message.split(" ")
            const bet_index = arr.indexOf("/bet")
            bet_ids.push(arr[bet_index + 1])
            arr.splice(bet_index, 2, "[bet]")
            parseMsg = arr.join(" ")

            return this.parseMessage(parseMsg, bet_ids)
        }

        return {message, bet_ids}
    }
    
    post() {
        if (!this.ref || !this.props.user) {
            return false
        }
        const { message } = this.state
        if (message) {
            const parse_msg = this.parseMessage(message)
            this.ref.push().set({
                user: this.config.user,
                message: parse_msg.message,
                bet_ids: parse_msg.bet_ids,
                date: Date.now()
            })
            this.setState({message: ""}, () => this.scrollToBottom())

            ReactGA.event({
                category: 'DICE',
                action: "Chat"
            });

            const bot_call = message.match(/![A-z]+/)
            if (bot_call) {
                const bot_type = bot_call[0].slice(1)
                
                if(window.binance_data && window.binance_data[bot_type.toUpperCase()]) {
                    const msg = `${bot_type.toUpperCase()} price is $${parseFloat(window.binance_data[bot_type.toUpperCase()].last_price).toLocaleString(navigator.language, {maximumFractionDigits: 2})} USD`
                    setTimeout(() => {
                        this.ref.push().set({
                            user: "pricebot",
                            message: msg,
                            date: Date.now(),
                            metadata: {bot: "pricebot", message: msg}
                        }).then(() => this.scrollToBottom())
                    }, 1000)
                }
            }
        }
    }

    chatBot(msg) {
        if (!this.ref || !this.props.user) {
            return false
        }

        this.ref.push().set({
            user: "chatbot",
            message: msg,
            date: Date.now(),
            metadata: {bot: "chatbot", message: msg}
        }).then(() => this.scrollToBottom())
    }
    
    onMessage(snapshot) {
        const { messages } = this.state
        const value = snapshot.val()
        
        if (typeof value !== 'object') {
          return false
        }
        
        messages.push({name: value.user, message: value.message, ts: value.date, bet_ids: value.bet_ids, metadata: value.metadata})
        this.setState({messages: messages.slice(-100)}, () => {
            if (this.messagesEnd.getBoundingClientRect().top < window.innerHeight) {
                this.scrollToBottom()
            }
        })
    }

    scrollToBottom = (smooth = true) => {
        setTimeout(() => {
            if (this.refs.Chat.clientWidth == 0) return
            this.messagesEnd.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
        }, 100)
    }

    destroy () {
        if (this.ref) {
          this.ref.off('child_added', this.onMessage)
        }
    
        const script = document.querySelector(`#${this.scriptId}`)
        window.firebase = undefined

        if (script) {
          script.remove()
        }
    }

    LinkedMessage(message, bet_ids) {
        const arr = message.split("[bet]")
        return (
            arr.map((text, index) => {
                return (
                    bet_ids && index < bet_ids.length && /^\d+$/.test(bet_ids[index]) ? 
                        <React.Fragment key={index}>
                            {text}<span className="bet-id" onClick={() => this.props.display_bet(bet_ids[index])}>
                                bet: #{bet_ids[index]}
                            </span>
                        </React.Fragment>
                    : bet_ids && index < bet_ids.length ? "bet: #" + text + bet_ids[index] : text
                    
                )
            })
        )
    }

    BotMessage(metadata, key) {
        if (metadata.bot === "rainbot" && metadata.users) {
            return (
                <div className="bot-msg mb-3">
                    <div className="message p-2 px-3">
                        Rainbot 💧💧💧 has tipped the following {metadata.users.length} users {metadata.amount} {metadata.asset} each:&nbsp;
                        {metadata.users.map((user, index) => {
                            return (
                                <span key={user.id || index} className="user-name">{this.NameMenu(user.name, key + user.id)}</span>
                                
                            )
                        })}
                    </div>
                </div>
            )
        }

        if (metadata.message) {
            return (
                <div className="bot-msg mb-3">
                    <div className="message p-2 px-3">{metadata.message}</div>
                </div>
            )
        }

        return null
    }

    NameMenu(name, key, separator = " ") {
        return (
            <span className="name pr-2 position-relative cursor-pointer" 
                onClick={(e) => {
                    this.menu_pos = e.target.getBoundingClientRect().y > window.innerHeight/2 ? 0 : 1
                    this.setState({menu: key})
                }}
            >
                {name} <span className="arrow">{String.fromCharCode(9662)}</span> {separator}
                { key === this.state.menu ?
                    <div className={"menu " + (this.menu_pos ? "bottom" : "top")}> 
                        {this.props.user ?
                            <div className="menu-item" onClick={(e) => {
                                e.stopPropagation()
                                this.setState({menu: null, tip_user: name})
                            }}>Tip</div>
                            : null
                        }

                        <div className="menu-item" onClick={(e) => {
                            e.stopPropagation()
                            this.props.display_stats(name)
                            this.setState({menu: null})
                        }}>Stats</div>
                    </div>
                    : null
                }
            </span>
        )
    }

    render() {
        const { user, balance, dispatch, toast } = this.props
        const { message, messages, tip_user } = this.state
        let last_ts
        let last_dt
        return (
            <React.Fragment>
                <div ref="Chat" className={container + " chat-container"}>
                    <div className="messages no-scrollbar qt-font-small">
                        { messages.map((msg) => {
                            let date, time
                            if (!last_ts || msg.ts - last_ts > 5 * 60 * 1000) {
                                time = new Date(msg.ts)
                                if (time.getDate() != last_dt) {
                                    date = time.getDate()
                                    last_dt = date
                                }
                            }
                            last_ts = msg.ts

                            const react_key = msg.name + msg.ts

                            return (
                                <React.Fragment key={react_key}>
                                    { time ? 
                                        <div className="d-flex justify-content-between w-100 qt-font-extra-small qt-white-62">
                                            <span>{date ? time.toLocaleDateString([], {weekday: "long"}) : ""}</span>
                                            <span>{time.toLocaleTimeString([], {hour: "numeric", minute: "numeric"})}</span>
                                        </div>
                                        : null
                                    }
                                    { msg.metadata && msg.metadata.bot ?
                                        this.BotMessage(msg.metadata, react_key)
                                        :
                                        <div className="message p-2 px-3 mb-3">
                                            {this.NameMenu(msg.name, react_key, ":")}
                                            <span className="msg">{this.LinkedMessage(msg.message, msg.bet_ids)}</span>
                                        </div>
                                    }
                                    
                                </React.Fragment>
                            )
                        })}
                        <div ref={(el) => { this.messagesEnd = el; }}/>
                    </div>
                    
                    <div className="message-input d-flex w-100">
                        <textarea value={message}
                            className="w-100 qt-font-small"
                            type="text"
                            placeholder={user ? "Type your message" : "Login to use chat"}
                            autoComplete="off"
                            disabled={!user}
                            onChange={(e) => this.setState({message: e.target.value})}
                            onKeyPress={e => {
                                if (e.key == "Enter") {
                                    e.preventDefault()
                                    this.post()
                                }
                            }} />
                        <button className="btn ml-3" onClick={this.post}>
                            SEND
                        </button>
                    </div>
                </div>
                { tip_user ?
                    <UserTip from={this.config.user} 
                        name={tip_user} 
                        announce_tip={this.chatBot.bind(this)}
                        close={() => this.setState({tip_user: null})} 
                        balance={balance} dispatch={dispatch} toast={toast} />
                    : null
                }
                
            </React.Fragment>
        )
    }
    
}
  