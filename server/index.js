const http = require('http')

const os = require('os');
const networkInterfaces = os.networkInterfaces();
const port = 3001
const url = networkInterfaces.wlp2s0[0].address

const requestListener = (req, res) => {
    req.writeHead(200);
    res.end('Hello World!')
}

const server = http.createServer(requestListener)

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

var users = []
var d = null;

io.on('connect', (socket) => {
    // console.log('Connected' + socket.id)
    socket.on('user_joined', (data) => {
        console.log('user connected')
        socket.join(data.room)
        users.push([data.room, data.userName, socket.id])
        io.to(data.room).emit('receive_user', users)
    })
    socket.on('send_message', (data) => {
        io.to(data.room).emit('receive_message', data.component)
    })
    socket.on('disconnect', (data) => {
        // console.log('Disconnected' + socket.id)
        users = users.filter(
            item => {
                if (item[2]===socket.id)
                    d = item[0]
                return item[2]!=socket.id
            }
        )
        if (d!=null) {
            io.to(d).emit('receive_user', users)
        }
        // console.log(users)
    })
})

server.listen(port, url, () => console.log(`Server URL: http://${url}:${port}/\nClient URL: http://${url}:3000/ for the Website`))