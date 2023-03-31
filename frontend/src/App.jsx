import { useState, useEffect, useRef } from 'react'

import presidency_logo from './assets/presidency_logo.png'
import vikasana_logo from './assets/vikasana_logo.svg'
import send_svg from './assets/send.svg'

import { io } from 'socket.io-client';
const socket = io('http://127.0.0.1:5000')

function App() {
  const [text, setText] = useState('')
  const [chatSocket, setChatSocket] = useState()
  const [chatMessage, setChatMessage] = useState([])
  const bottomRef = useRef(null)

  const socketEmit = () => {
    let temp = {
      message:text,
      self:true
    }
    setChatMessage((prev) => [...prev, temp])
    socket.emit('message', {
      message:text
    })
    setText('')
  }

  useEffect(() => {
    
    socket.on('recv_message', (data) => {
      let temp = {
        message: data,
        self: false
      }
      setChatMessage((prev) => [...prev, temp])
    });
    
    return () => {
      socket.off('recv_message');
    
    };
  }, []);

  useEffect(() => {
    
    bottomRef.current?.scrollIntoView()
  }, [chatMessage])

  return (
    <div className="App flex flex-col w-full h-screen items-center text-white">
      <nav className='w-full py-5 flex flex-col items-center z-20'>
        <div className="flex items-center">
          <a href="https://presidencyuniversity.in/" target="_blank"><img className='h-14' src={presidency_logo} /></a>

          <i id="x-mark" className="fa-solid fa-xmark text-white text-4xl mx-4"></i>

          <a href="https://vikasana.tech/" target="_blank"> <img className='h-16' src={vikasana_logo} /></a>
        </div>

        <div className="flex flex-col items-center font-bebas mt-2  text-lg lg:text-2xl">
        <a href="https://www.linkedin.com/company/forge-dsc/" target="_blank"><h2>VikBot by Forge</h2></a>
          <h2 className='mt-2'>Team Vikasana</h2>
          <a href="https://presidencyuniversity.in/" target="_blank"><h2>Presidency University</h2></a>
        </div>

      </nav>

      <div id='back-ball' className='absolute rounded-full bg-purple-500/40'></div>
      <div id='back-ball-2' className='absolute rounded-full bg-sky-400/50'></div>
      <div id='backdrop' className='w-screen h-screen fixed z-10'></div>

      <div className="flex flex-col h-3/4 w-4/5 xl:w-2/4 bg-black/40 backdrop-blur-md z-20 rounded-3xl border-2 border-zinc-900/50">
        <div className="heading py-2 px-8 flex items-center border-b-2 border-zinc-500/30">
          <img className='w-16' src="https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/02/4cbe8d_f1ed2800a49649848102c68fc5a66e53mv2.gif" />
          <p className='ml-4 text-2xl font-anton'>VikBot</p>
        </div>

        <div id='chatscreen' className="flex flex-col w-full h-full overflow-auto px-8 py-5">
          {
            chatMessage.map((item, key) => {
              return (
                <div key={key} id='chatContainer' dangerouslySetInnerHTML={{ __html: item.message}} className={`max-w-3/4 py-1 px-3 font-poppins text-lg rounded-3xl ${item.self ? 'bg-indigo-400' : 'bg-slate-600'} text-white ${item.self ? 'ml-auto' : 'mr-auto'} my-2`}>
                  
                </div>
              )
            })
          }
          
          <div ref={bottomRef} />
          
        </div>

        <div className="flex w-full justify-center items-center px-4 py-3 border-t-2 border-zinc-500/30">
          <input onKeyDown={(e) => {
            if (e.key === 'Enter') {
              socketEmit()
            }
          }} placeholder='Enter message' className='rounded-3xl w-full bg-slate-900 py-2 px-5 border-2 border-slate-700/50' onChange={(e) => setText(e.target.value)} type='text' value={text} />
          <button className='text-2xl bg-blue-400 py-2 px-2 flex justify-center items-center rounded-full font-bebas ml-2' onClick={socketEmit}>
          {/* <i class="fa-sharp fa-solid fa-paper-plane-top"></i> */}
            <img className='w-7' src={send_svg} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
