const users = {};
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('🟢 접속:', socket.id);
  
  socket.on('set_nickname', (name) => {
    users[socket.id] = name;
});

  if (waitingUser) {
    const room = `room_${waitingUser.id}_${socket.id}`;

    waitingUser.join(room);
    socket.join(room);

    io.to(room).emit('matched', { room });

    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit('waiting', '상대방을 기다리는 중...');
  }

  socket.on('message', ({ room, text, nickname }) => {
    socket.to(room).emit('message', {
      text,
      nickname: users[socket.id] || nickname,
      time: new Date().toLocaleTimeString('ko-KR')
    });
  });

  socket.on('disconnect', () => {
    if (waitingUser?.id === socket.id) {
      waitingUser = null;
    }

    socket.rooms.forEach((room) => {
      socket.to(room).emit('partner_left', '상대방이 나갔습니다.');
    });

    console.log('🔴 퇴장:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('✅ 서버 실행 중: http://localhost:3000');
});