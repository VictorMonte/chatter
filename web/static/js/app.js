import "phoenix_html"
import {Socket, Presence} from "phoenix"

let user = document.getElementById("user").innerText
let socket = new Socket("/socket", {params: {user: user}})
socket.connect()

let presences =  {}

let formatedTimestamp = (Ts) => {
    let date = new Date(Ts)

    return date.toLocaleString()
}

let listBy = (user, {metas: metas}) => {
    return {
        user: user,
        onlineAt: formatedTimestamp(metas[0].online_at)
    }
}

let userList = document.getElementById("userList")
let render = (presence) => {
    userList.innerHTML = Presence.list(presences, listBy)
        .map(presence => `
        <li>
            ${presence.user}
            <br>
            <small>online since ${presence.onlineAt}</small>
        </li>`)
        .join("")
}

let room = socket.channel("room:lobby")
room.on("presence_state", state => {
    presences = Presence.syncState(presences, state)
    render(presences)
})

room.on("presence_diff", diff => {
    presences = Presence.syncDiff(presences, diff)
    render(presences)
})

room.join()

let messageInput = document.getElementById("newMessage")
messageInput.addEventListener("keypress", (e) => {
    if(e.keyCode == 13 && messageInput.value != ""){
        room.push("message:new", messageInput.value)
        messageInput.value = ""
    }
})

let messageList = document.getElementById("messageList")
let renderMessage = (message) => {
    let messageElement = document.createElement("li")
    messageElement.innerHTML = `
    <b>${message.user}</b>
    <i>${formatedTimestamp(message.timestamp)}</i>
    <p>${message.body}</p>
`

    messageList.appendChild(messageElement)
    message.scrollTop = messageList.scrollHeight;
}

room.on("message:new", message => renderMessage(message))

