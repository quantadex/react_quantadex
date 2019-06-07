import React, { Component } from 'react';
import { css } from 'emotion';

const container = css `
    height: calc(100vh - 80px);
    position: relative;
    background: #015249;
    width: 350px;

    .messages {
        height: calc(100% - 80px);
        padding: 20px 14px 0px 20px;
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
    
    post() {
        if (!this.ref) {
            return false
        }
        const { message } = this.state
        if (message) {
            this.ref.push().set({
                user: this.config.user,
                message: message,
                date: Date.now() | 0
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
        
        messages.push({name: value.user, message: value.message, ts: value.date})
        this.setState(messages, () => {
            if (this.messagesEnd.getBoundingClientRect().top < window.innerHeight) {
                this.scrollToBottom()
            }
        })
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    destroy () {
        if (this.ref) {
          this.ref.off('child_added', this.onMessage)
        }
    
        const script = document.querySelector(`#${this.scriptId}`)
    
        if (script) {
          script.remove()
        }
    }

    componentWillUnmount() {
        this.destroy()
    }

    render() {
        const { message, messages } = this.state
        return (
            <div className={container}>
                <div className="messages no-scrollbar qt-font-small">
                    { messages.map((msg) => {
                        return (
                            <div key={msg.name + msg.ts} className="message p-2 px-3 mb-3">
                                <span className="name pr-2">{msg.name}:</span>
                                <span className="msg">{msg.message}</span>
                            </div>
                        )
                    })}
                    <div ref={(el) => { this.messagesEnd = el; }}/>
                </div>
                
                <div className="message-input d-flex w-100">
                    <textarea value={message}
                        className="w-100 qt-font-small"
                        type="text"
                        placeholder="Type your message" 
                        autoComplete="off"
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
  