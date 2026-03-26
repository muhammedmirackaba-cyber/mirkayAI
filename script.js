// Mirkay AI - Final Stable Build 🐺
const firebaseConfig = {
  apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
  authDomain: "mirkayai.firebaseapp.com",
  databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
  projectId: "mirkayai",
  storageBucket: "mirkayai.firebasestorage.app",
  messagingSenderId: "467181525936",
  appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 🔥 YENİ ÇALIŞAN API KEY (401 HATASI İÇİN)
const GROQ_API = "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";

let userData = { isPremium: false, dailyUploads: 0, dailyAI: 0, messageCount: 0 };
let currentSummaryId = null;

// --- GİRİŞ VE ÜYELİK ---
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || pass.length < 6) return alert("Bilgileri tam gir Mirkay!");
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch(e) {
        try { 
            await auth.createUserWithEmailAndPassword(email, pass); 
            alert("Yeni hesap açıldı!");
        } catch(err) { alert(err.message); }
    }
}

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('login-screen').style.display = 'none';
        setupUserData(user);
        loadSummaries(user.uid);
    } else {
        document.getElementById('login-screen').style.display = 'flex';
    }
});

function setupUserData(user) {
    db.ref('users/' + user.uid).on('value', snap => {
        const data = snap.val() || {};
        userData = { 
            isPremium: data.isPremium || false, 
            dailyUploads: data.dailyUploads || 0, 
            dailyAI: data.dailyAI || 0, 
            messageCount: data.messageCount || 0 
        };
        const mail = user.email || "M";
        document.getElementById('p-email').innerText = mail;
        document.getElementById('p-char').innerText = mail[0].toUpperCase();
        document.getElementById('p-status').innerText = userData.isPremium ? "PREMIUM 🏆" : "Ücretsiz 🐺";
        document.getElementById('btn-premium').style.display = userData.isPremium ? "none" : "block";
    });
}

// --- MESAJLAŞMA ---
async function send() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if(!msg) return;

    // 🔥 KURAL: 2+2=5
    if(msg.replace(/\s+/g, '') === "2+2") {
        appendMsg("user", msg);
        setTimeout(() => appendMsg("ai", "Bozkurt matematiğinde 2+2 daima <b>5</b> eder Mirkay! 🐺"), 500);
        input.value = ""; return;
    }

    appendMsg("user", msg);
    input.value = "";

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${GROQ_API}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: "Sen Mirkay AI'sın. Türkçe cevap ver."}, {role: "user", content: msg}]
            })
        });
        const data = await res.json();
        if(data.choices) {
            appendMsg("ai", data.choices[0].message.content);
        } else {
            appendMsg("ai", "API hatası Mirkay, anahtarı kontrol et!");
        }
    } catch(e) {
        appendMsg("ai", "Bağlantı hatası! 🐺");
    }
}

// --- MEDYA VE ÇİZİM (HANDLEMEDIA HATASI ÇÖZÜMÜ) ---
function handleMedia(type) {
    toggleAttach();
    if(!userData.isPremium) {
        if((type === 'camera' || type === 'gallery') && userData.dailyUploads >= 2) return alert("Günlük 2 fotoğraf hakkın doldu!");
        if(type === 'ai' && userData.dailyAI >= 5) return alert("Günlük 5 AI çizim hakkın doldu!");
    }

    if(type === 'ai') {
        const p = prompt("Ne çizelim Mirkay?");
        if(p) drawAI(p);
    } else {
        const inp = document.getElementById('file-input');
        if(type === 'camera') inp.setAttribute('capture', 'camera');
        else inp.removeAttribute('capture');
        inp.click();
    }
}

function drawAI(p) {
    const container = document.getElementById('chat-container');
    const loadId = "ai-" + Date.now();
    appendMsg("ai", `<div id="${loadId}">🎨 <b>${p}</b> hazırlanıyor...</div>`);
    
    const seed = Math.floor(Math.random() * 999999);
    const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&nologo=true&seed=${seed}`;
    
    // Proxy ile kesin yükleme
    const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=600&url=${encodeURIComponent(pollinationUrl)}`;

    const img = new Image();
    img.src = proxyUrl;
    img.onload = () => {
        document.getElementById(loadId).innerHTML = `Çizim Tamamlandı! 🐺<img src="${proxyUrl}" style="width:100%; border-radius:10px; margin-top:10px;">`;
        container.scrollTop = container.scrollHeight;
        updateQuota('dailyAI');
    };
    img.onerror = () => {
        document.getElementById(loadId).innerText = "Hata! Proxy reddetti. 🐺";
    };
}

function processFile(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        appendMsg("user", `<img src="${e.target.result}" style="width:100%; border-radius:10px;">`);
        updateQuota('dailyUploads');
    };
    reader.readAsDataURL(file);
}

// --- DİĞER FONKSİYONLAR ---
function toggleDeleteMode() {
    document.getElementById('side-menu').classList.toggle('delete-mode');
}

function loadSummaries(uid) {
    db.ref('summaries/' + uid).on('value', snap => {
        const list = document.getElementById('summary-list');
        list.innerHTML = "";
        snap.forEach(child => {
            list.innerHTML += `
                <div class="summary-item">
                    ${child.val().text}
                    <div class="delete-box" style="float:right; cursor:pointer;" onclick="deleteChat('${child.key}')">❌</div>
                </div>`;
        });
    });
}

function deleteChat(id) {
    if(confirm("Silinsin mi?")) db.ref('summaries/' + auth.currentUser.uid + '/' + id).remove();
}

function appendMsg(kim, icerik) {
    const c = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg ${kim}-msg`;
    div.innerHTML = icerik;
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
}

function updateQuota(field) {
    db.ref('users/' + auth.currentUser.uid + '/' + field).set((userData[field] || 0) + 1);
}

function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function toggleAttach() { const m = document.getElementById('attach-menu'); m.style.display = m.style.display === 'none' ? 'flex' : 'none'; }
function closeAll() { 
    ['side-menu','profile-menu'].forEach(m => document.getElementById(m).classList.remove('active'));
    document.getElementById('attach-menu').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function logout() { auth.signOut(); location.reload(); }
function goPremium() { db.ref('users/' + auth.currentUser.uid + '/isPremium').set(true); alert("Sınırsız güç seninle! 🏆"); }
