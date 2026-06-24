import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ==========================================
// THIẾT LẬP FIREBASE (HƯỚNG DẪN Ở BÊN DƯỚI)
// ==========================================
// Thay thế nội dung bên trong {} bằng Config thật của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAUWkcufZEqrdfYl9t5Vl0ftzlDHuvh49w",
  authDomain: "daiduong-4dc3a.firebaseapp.com",
  databaseURL: "https://daiduong-4dc3a-default-rtdb.firebaseio.com",
  projectId: "daiduong-4dc3a",
  storageBucket: "daiduong-4dc3a.firebasestorage.app",
  messagingSenderId: "24825940914",
  appId: "1:24825940914:web:605087118fedfa2e00f2ab"
};

let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
} catch (e) {
    console.error("Firebase chưa được cấu hình. Vui lòng cập nhật firebaseConfig.", e);
}

// ==========================================
// DỮ LIỆU GAME
// ==========================================
const questions = [
    {
        question: "1. Đâu là loại rác thải nguy hiểm nhất đối với sinh vật biển vì chúng rất lâu phân hủy?",
        options: ["A. Giấy vụn", "B. Nhựa và Nilon", "C. Vỏ trái cây", "D. Lá cây khô"],
        correct: 1
    },
    {
        question: "2. Hành động nào sau đây góp phần BẢO VỆ môi trường biển?",
        options: ["A. Đổ dầu nhớt xuống cống", "B. Xả rác trên bãi biển", "C. Dọn rác bãi biển", "D. Dùng thuốc nổ bắt cá"],
        correct: 2
    },
    {
        question: "3. Khi đi tắm biển, nếu ăn uống xong bạn nên làm gì?",
        options: ["A. Chôn rác dưới cát", "B. Bỏ rác vào thùng đúng quy định", "C. Ném rác xuống biển", "D. Gom lại để trên bờ"],
        correct: 1
    },
    {
        question: "4. Rùa biển thường nhầm lẫn loại rác nào với con sứa (thức ăn của chúng)?",
        options: ["A. Túi nilon trắng", "B. Vỏ lon bia", "C. Khúc gỗ", "D. Lưới đánh cá"],
        correct: 0
    },
    {
        question: "5. 'Giờ Trái Đất' có ý nghĩa gì đối với môi trường toàn cầu?",
        options: ["A. Tiết kiệm điện, giảm khí thải", "B. Dọn rác đáy biển", "C. Ngừng đánh bắt cá", "D. Trồng thêm san hô"],
        correct: 0
    }
];

const trashAssets = ['assets/rac1.png', 'assets/rac2.png', 'assets/rac3.png', 'assets/rac4.png', 'assets/rac5.png'];
const fishAssets = [
    'assets/ca1.png', 'assets/ca2.png', 'assets/ca3.png', 'assets/ca4.png', 'assets/ca5.png',
    'assets/ca6.png', 'assets/ca7.png', 'assets/ca8.png', 'assets/ca9.png', 'assets/ca10.png'
];
// ==========================================
// ÂM THANH SFX
// ==========================================
const sfxClick = new Audio('https://actions.google.com/sounds/v1/ui/digi_pluck.ogg');
const sfxCorrect = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'); 
const sfxWrong = new Audio('https://actions.google.com/sounds/v1/cartoon/slip_slip.ogg'); 
const sfxWin = new Audio('https://actions.google.com/sounds/v1/cartoon/crowd_cheer.ogg');
const sfxDrop = new Audio('https://actions.google.com/sounds/v1/water/water_splash.ogg'); 
const sfxGrab = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg'); 
const sfxBgm = new Audio('assets/bgm.mp3'); // Nhạc nền (Tải bài nhạc upbeat của bạn vào thư mục assets với tên bgm.mp3)
sfxBgm.loop = true;
sfxBgm.volume = 0.4;

let bgmStarted = false;

function playSFX(audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Trình duyệt chặn autoplay", e));
}

// Bắt sự kiện click chung cho tất cả các nút
document.addEventListener('click', (e) => {
    if (!bgmStarted) {
        sfxBgm.play().catch(e => console.log(e));
        bgmStarted = true;
    }
    if (e.target.tagName === 'BUTTON') {
        playSFX(sfxClick);
    }
});

// ==========================================
// BIẾN TOÀN CỤC
// ==========================================
let currentRoomCode = "";
let myPlayerId = "";
let myPlayerName = "";
let isTeacher = false;
let currentQuestionIndex = 0;
let myScore = 0;

// ==========================================
// ĐIỀU KHIỂN MÀN HÌNH & UI
// ==========================================
const screens = {
    home: document.getElementById('screen-home'),
    createRoom: document.getElementById('screen-create-room'),
    joinRoom: document.getElementById('screen-join-room'),
    lobby: document.getElementById('screen-lobby'),
    game: document.getElementById('screen-game'),
    leaderboard: document.getElementById('screen-leaderboard')
};

function switchScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    setTimeout(() => {
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
        setTimeout(() => screens[screenName].classList.add('active'), 50);
    }, 500);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ==========================================
// LOGIC MÀN HÌNH CHÍNH (HOME)
// ==========================================
document.getElementById('btn-home-teacher').addEventListener('click', () => {
    isTeacher = true;
    createRoom();
});

document.getElementById('btn-home-student').addEventListener('click', () => {
    isTeacher = false;
    switchScreen('joinRoom');
});

// ==========================================
// LOGIC GIÁO VIÊN (TẠO PHÒNG)
// ==========================================
function generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createRoom() {
    if (!db) return showToast("Vui lòng cấu hình Firebase trước!");
    currentRoomCode = generateRoomCode();
    
    // Tạo room trên database
    await set(ref(db, 'rooms/' + currentRoomCode), {
        status: 'waiting',
        createdAt: Date.now()
    });
    
    // Xóa room khi giáo viên thoát web
    onDisconnect(ref(db, 'rooms/' + currentRoomCode)).remove();

    document.getElementById('display-room-code').textContent = currentRoomCode;
    switchScreen('createRoom');
    
    // Lắng nghe danh sách học sinh tham gia
    onValue(ref(db, `rooms/${currentRoomCode}/players`), (snapshot) => {
        const players = snapshot.val() || {};
        const listEl = document.getElementById('teacher-waiting-list');
        listEl.innerHTML = '';
        
        const count = Object.keys(players).length;
        document.getElementById('student-count').textContent = count;
        document.getElementById('btn-start-game').disabled = (count === 0);
        
        Object.values(players).forEach(p => {
            const li = document.createElement('li');
            li.textContent = p.name;
            listEl.appendChild(li);
        });
    });
}

document.getElementById('btn-start-game').addEventListener('click', () => {
    update(ref(db, 'rooms/' + currentRoomCode), { status: 'playing' });
    startGameForTeacher();
});

document.getElementById('btn-cancel-room').addEventListener('click', () => {
    if (currentRoomCode) remove(ref(db, 'rooms/' + currentRoomCode));
    switchScreen('home');
});

function startGameForTeacher() {
    switchScreen('game');
    document.getElementById('screen-game').classList.add('teacher-mode');
    document.getElementById('btn-show-leaderboard').classList.remove('hidden');
}

// ==========================================
// LOGIC HỌC SINH (THAM GIA PHÒNG)
// ==========================================
document.getElementById('btn-back-home').addEventListener('click', () => {
    switchScreen('home');
});

document.getElementById('btn-join-submit').addEventListener('click', async () => {
    if (!db) return showToast("Vui lòng cấu hình Firebase trước!");
    
    const code = document.getElementById('input-room-code').value.trim();
    const name = document.getElementById('input-player-name').value.trim();
    
    if (code.length !== 6) return showToast("Mã phòng phải là 6 chữ số!");
    if (!name) return showToast("Vui lòng nhập tên!");
    
    const roomRef = ref(db, 'rooms/' + code);
    const snapshot = await get(roomRef);
    
    if (snapshot.exists()) {
        const roomStatus = snapshot.child('status').val();
        if (roomStatus !== 'waiting') return showToast("Phòng này đã bắt đầu game!");
        
        currentRoomCode = code;
        myPlayerName = name;
        myPlayerId = "player_" + Date.now();
        
        await set(ref(db, `rooms/${currentRoomCode}/players/${myPlayerId}`), {
            name: myPlayerName,
            score: 0
        });
        
        onDisconnect(ref(db, `rooms/${currentRoomCode}/players/${myPlayerId}`)).remove();

        document.getElementById('lobby-room-code-display').textContent = currentRoomCode;
        document.getElementById('lobby-name-display').textContent = myPlayerName;
        switchScreen('lobby');
        
        onValue(ref(db, `rooms/${currentRoomCode}/status`), (snap) => {
            if (snap.val() === 'playing') {
                startGameForStudent();
            }
        });
    } else {
        showToast("Mã phòng không tồn tại!");
    }
});

// ==========================================
// LOGIC TRÒ CHƠI
// ==========================================
function startGameForStudent() {
    switchScreen('game');
    document.getElementById('screen-game').classList.remove('teacher-mode');
    document.getElementById('btn-show-leaderboard').classList.remove('hidden'); // Sinh viên cũng thấy bảng xếp hạng
    document.getElementById('game-player-name').textContent = myPlayerName;
    document.getElementById('game-score').textContent = "0";
    currentQuestionIndex = 0;
    myScore = 0;
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        document.getElementById('question-text').textContent = "🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ! 🎉";
        document.querySelector('.answers-grid').innerHTML = "";
        playSFX(sfxWin);
        setTimeout(() => {
            document.getElementById('btn-show-leaderboard').classList.remove('hidden');
        }, 1500);
        return;
    }
    
    const q = questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = q.question;
    
    const btns = document.querySelectorAll('.btn-answer');
    btns.forEach((btn, index) => {
        btn.textContent = q.options[index];
        btn.className = 'btn-answer'; 
        btn.disabled = false;
        
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => handleAnswer(index, q.correct, newBtn));
    });
}

function handleAnswer(selectedIndex, correctIndex, btnElement) {
    document.querySelectorAll('.btn-answer').forEach(b => b.disabled = true);
    
    const isCorrect = (selectedIndex === correctIndex);
    if (isCorrect) {
        btnElement.classList.add('correct');
        myScore += 10;
        updateScore();
        playSFX(sfxCorrect);
        playGrabAnimation(true);
    } else {
        btnElement.classList.add('wrong');
        document.querySelector(`.btn-answer[data-index="${correctIndex}"]`).classList.add('correct');
        playSFX(sfxWrong);
        playGrabAnimation(false);
    }
    
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 3500);
}

function updateScore() {
    document.getElementById('game-score').textContent = myScore;
    if(db && currentRoomCode && myPlayerId) {
        update(ref(db, `rooms/${currentRoomCode}/players/${myPlayerId}`), {
            score: myScore
        });
    }
}

// ==========================================
// HIỆU ỨNG GẮP RÁC
// ==========================================
function playGrabAnimation(isCorrect) {
    const grabber = document.querySelector('.grabber-container');
    const grabberClaw = document.getElementById('grabber');
    const itemContainer = document.getElementById('grabbed-item');
    const itemImg = document.getElementById('grabbed-item-img');
    const reaction = document.getElementById('character-reaction');
    
    if (isCorrect) {
        itemImg.src = trashAssets[Math.floor(Math.random() * trashAssets.length)];
    } else {
        itemImg.src = fishAssets[Math.floor(Math.random() * fishAssets.length)];
    }
    
    itemContainer.classList.add('hidden');
    
    playSFX(sfxDrop); // Tiếng thả cần
    grabber.style.height = "250px"; 
    
    setTimeout(() => {
        grabberClaw.classList.add('closed');
        playSFX(sfxGrab); // Tiếng ngàm đóng (bắt trúng)
        itemContainer.classList.remove('hidden');
        
        setTimeout(() => {
            // Đã xóa tiếng sáo trượt vút lên cao (sfxPull) theo yêu cầu
            grabber.style.height = "100px"; 
            
            reaction.textContent = isCorrect ? "😍 Hợp lý!" : "😥 Gắp nhầm cá rồi!";
            reaction.classList.remove('hidden');
            
            setTimeout(() => {
                reaction.classList.add('hidden');
                itemContainer.classList.add('hidden');
                grabberClaw.classList.remove('closed');
            }, 1500);
        }, 500);
    }, 1000);
}

// ==========================================
// BẢNG XẾP HẠNG
// ==========================================
document.getElementById('btn-show-leaderboard').addEventListener('click', () => {
    switchScreen('leaderboard');
    if (!db || !currentRoomCode) return;
    
    onValue(ref(db, `rooms/${currentRoomCode}/players`), (snapshot) => {
        const playersObj = snapshot.val() || {};
        const playersList = Object.values(playersObj);
        
        playersList.sort((a, b) => b.score - a.score);
        
        const listEl = document.getElementById('leaderboard-list');
        listEl.innerHTML = '';
        
        playersList.forEach((p, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <div class="rank">${index + 1}</div>
                    <span>${p.name}</span>
                </div>
                <div>${p.score} ⭐</div>
            `;
            listEl.appendChild(li);
        });
    });
});

document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
    // Cả giáo viên và học sinh khi đóng BXH đều quay lại màn hình game
    switchScreen('game');
});
