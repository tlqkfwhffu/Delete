let nickname = localStorage.getItem('nickname') || '';

let socket = null;

let currentRoom = null;

// ── 닉네임 설정 ──────────────────────────────
function setNickname() {

  const input = document.getElementById('nickname');

  nickname = input.value.trim();

  if (!nickname) return;

  localStorage.setItem('nickname', nickname);

 if (!socket) {
  connectSocket();
}

socket.emit('set_nickname', nickname);

  input.disabled = true;

  setStatus(`🟢 ${nickname}님 환영합니다`);

  document.getElementById('nickname-box').style.display =
  'none';
  
  document.getElementById('messages').style.display =
  'flex';
  
  document.querySelector('.input-area').style.display =
  'flex';

}

// ── 소켓 이벤트 등록 ─────────────────────────
function setupSocketEvents() {

  socket.on('waiting', (msg) => {

    setStatus('⏳ ' + msg);

  });

  socket.on('matched', ({ room }) => {

    currentRoom = room;

    setStatus('🟢 연결됨! 채팅을 시작하세요');

    setInputEnabled(true);

    addMessage('상대방과 연결되었습니다.', 'system');

  });

  socket.on('message', ({ text, nickname, time }) => {

    addMessage(`${nickname}: ${text}`, 'received', time);

  });

  socket.on('partner_left', (msg) => {

    setStatus('🔴 ' + msg);

    setInputEnabled(false);

    addMessage(msg, 'system');

    currentRoom = null;

  });

  socket.on('user_list', (users) => {

    const userList = document.getElementById('user-list');

    userList.innerHTML = '';

    Object.values(users).forEach((name) => {

      const div = document.createElement('div');

      div.className = 'user-item';

      div.textContent = '🟢 ' + name;

      userList.appendChild(div);

    });

  });

}

// ── 로그인 후 호출 ───────────────────────────
function connectSocket() {

  socket = io();

  setupSocketEvents();

  if (nickname) {

    socket.emit('set_nickname', nickname);

    document.getElementById('nickname').value = nickname;

    document.getElementById('nickname').disabled = true;

    setStatus(`🟢 ${nickname}님 환영합니다`);

    document.getElementById('nickname-box').style.display =
    'none';

    document.getElementById('messages').style.display =
    'flex';

    document.querySelector('.input-area').style.display =
    'flex';

  }

}

// ── 메시지 전송 ──────────────────────────────
function sendMessage() {

  const input = document.getElementById('input');

  const text = input.value.trim();

  if (!text || !currentRoom) return;

  saveMessage(text, nickname);

  socket.emit('message', {
    room: currentRoom,
    text,
    nickname
  });

  addMessage(text, 'sent', new Date().toLocaleTimeString('ko-KR'));

  input.value = '';

  input.focus();

}

// Enter 키 전송
document.getElementById('input').addEventListener('keydown', (e) => {

  if (e.key === 'Enter') {

    sendMessage();

  }

});

// ── 메시지 출력 ──────────────────────────────
function addMessage(text, type, time) {

  const messages = document.getElementById('messages');

  const div = document.createElement('div');

  div.className = `message ${type}`;

  div.innerHTML = `
    ${text}
    ${time ? `<small>${time}</small>` : ''}
  `;

  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;

}

// ── 상태 변경 ────────────────────────────────
function setStatus(msg) {

  document.getElementById('status').textContent = msg;

}

// ── 입력창 활성화 ────────────────────────────
function setInputEnabled(enabled) {

  document.getElementById('input').disabled = !enabled;

  document.getElementById('send-btn').disabled = !enabled;

}