import React, { Component } from 'react';
import { css } from 'emotion';

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
            opacity: 0.7;
        }

        .bet-id:hover {
            opacity: 1;
        }
    }

    .message {
        background: rgba(255,255,255,0.1);
        border-radius: 5px;
        width: 100%;

        .name {
            color: rgba(255,255,255,0.8);
        }

        .msg {
            color: #fff;
            word-break: break-word;
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
        }

        this.messagesEnd = React.createRef();
        this.onMessage = this.onMessage.bind(this)
        this.post = this.post.bind(this)
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
            channel: 'test',
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

        if(nextProps.show_chat && !this.props.show_chat) {
            this.scrollToBottom()
        }
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
        this.ref.limitToLast(50)
        .on('child_added', this.onMessage)

        setTimeout(() => {
            this.scrollToBottom()
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
        }
    }
    
    onMessage(snapshot) {
        const { messages } = this.state
        const value = snapshot.val()
        
        if (typeof value !== 'object') {
          return false
        }
        
        messages.push({name: value.user, message: value.message, ts: value.date, bet_ids: value.bet_ids})
        this.setState(messages, () => {
            if (this.messagesEnd.getBoundingClientRect().top < window.innerHeight) {
                this.scrollToBottom()
            }
        })
    }

    scrollToBottom = () => {
        setTimeout(() => {
            if (this.refs.Chat.clientWidth == 0) return
            this.messagesEnd.scrollIntoView({ behavior: "smooth" });
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

    componentWillUnmount() {
        this.destroy()
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

    render() {
        const { user } = this.props
        const { message, messages } = this.state
        let last_ts
        let last_dt
        return (
            <div ref="Chat" className={container + " chat-container"}>
                <div className="messages no-scrollbar qt-font-small">
                    { messages.map((msg) => {
                        let date, time
                        if (!last_ts || msg.ts - last_ts > 2 * 60 * 1000) {
                            time = new Date(msg.ts)
                            if (time.getDate() != last_dt) {
                                date = time.getDate()
                                last_dt = date
                            }
                        }
                        last_ts = msg.ts
                        
                        return (
                            <React.Fragment  key={msg.name + msg.ts}>
                                { time ? 
                                    <div className="d-flex justify-content-between w-100 qt-font-extra-small qt-white-62">
                                        <span>{date ? time.toLocaleDateString([], {weekday: "long"}) : ""}</span>
                                        <span>{time.toLocaleTimeString([], {hour: "numeric", minute: "numeric"})}</span>
                                    </div>
                                    : null
                                }
                                <div className="message p-2 px-3 mb-3">
                                    <span className="name pr-2">{msg.name}:</span>
                                    <span className="msg">{this.LinkedMessage(msg.message, msg.bet_ids)}</span>
                                </div>
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
        )
    }
    
}
  