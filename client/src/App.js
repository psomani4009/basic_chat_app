import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import './App.css'

console.log(window.location.href.split(':3000')[0])
const url = window.location.href.split(':3000')[0]
const port = 3001
let socket;
const CONNECTION_PORT = `${url}:${port}/`

export default function App() {
  const debug = false;
  // Before Login
  const [logIn, setlogIn] = useState(debug?true:false)
  const [userName, setUserName] = useState(debug?'Piyush Somani':'')
  const [room, setRoom] = useState(debug?'100011':'')
  useEffect(() => {
    socket = io(CONNECTION_PORT)
    socket.on('connection')
    // console.log('lee')
    if (debug) socket.emit('user_joined', {room: room, userName: userName})
  }, [CONNECTION_PORT])

  
  const submitRoom = () => {
    if (userName==='' || room==='') return
    socket.emit('user_joined', {room: room, userName: userName})
    setlogIn(true);
  }
  
  // After LogIn
  const [message, setMessage] = useState('')
  const [messageList, setMessageList] = useState([])
  const [personList, setPersonList] = useState([]) // braodcast
  
  useEffect(() => {
    socket.on('receive_user', (data) => {
      setPersonList(data)
    })
    socket.on('receive_message', (data) => {
      if (data===undefined) return
      setMessageList([...messageList, data])
    })
  })

  const submitSend = () => {
    if (message === '') return
    const detailed_message = {
      room: room,
      component: {
        message: message,
        author: userName
      }
    }
    setMessageList([...messageList, detailed_message.connect])
    socket.emit('send_message', detailed_message)
    setMessage('')
  }
  
  window.addEventListener('beforeunload', () => {
    socket.emit('disconnect')
  })

  const logOut = () => {
    socket.disconnect()
    setlogIn(false)
  }

  return (
    logIn?(
    <div className='container'>
      <div className='nav-bar'>
        <h1>Name: {userName}</h1>
        <h1>Room: {room}</h1>
        <button onClick={logOut}>Log Out</button>
      </div>
      <div className='person-list'>
        <h1>Person List</h1>
        {personList.map(
          person => {
            return (person[0]===room?<div className='person'>{person[1]}</div>:<div></div>)
          }
        )}
      </div>
      <div className='message-area'>
        <div className='messages'>
          {
            messageList.map(
              mess => {
                if (mess!==undefined)
                  return (
                    <div className='message'>
                      <p className='author'>{mess.author}: </p><p className='mess'>{mess.message}</p>
                    </div>
                  )
                else
                  return null
              }
            )
          }
        </  div>
        <div className='message-input'>
          <input value={message} onChange={(e) => {setMessage(e.target.value)}} />
          <button onClick={submitSend}>Send</button>
        </div>
      </div>
    </div>):(
      <div className='login-container'>
        <div className='login'>
          <input onChange={(e) => {setUserName(e.target.value)}} placeholder='Name' />
          <input onChange={(e) => {setRoom(e.target.value)}} placeholder='Room' />
          <button onClick={submitRoom} >Submit</button>
        </div>
      </div>
    )
  )
}