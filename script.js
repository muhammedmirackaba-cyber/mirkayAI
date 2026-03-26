// Mirkay AI - Final Logic 🐺
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
const GROQ_API = "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";

let userData = { isPremium: false, dailyUploads: 0, dailyAI: 0, messageCount: 0 };
let currentSummaryId = null;

// --- GİRİŞ VE ÜYELİK ---
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || pass.length < 6) return alert("Email ve en az 6 haneli şifre gir Mirkay!");
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch(e) {
        try { await auth.createUserWithEmailAndPassword(email, pass); } catch(err) { alert(err.message); }
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
        document.getElementById('p-email').innerText = user.email;
        document.getElementById('p-char').innerText = mail[0].toUpperCase();
        document.getElementById('p-status').innerText = userData.isPremium ? "Statü: PREMIUM 🏆" : "Statü: Ücretsiz 🐺";
        document.getElementById('btn-premium').style.display = userData.isPremium ? "none" : "block";
    });
}

// --- MESAJLAŞMA VE KURAL ---
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

    // İlk mesajda özet oluştur
    if(!currentSummaryId) {
        const summaryText = msg.substring(0, 20) + "...";
        const ref = db.ref('summaries/' + auth.currentUser.uid).push();
        currentSummaryId = ref.key;
        ref.set({ text: summaryText, timestamp: Date.now() });
    }

    // Reklam & Kota (Free)
    if(!userData.isPremium) {
        userData.messageCount++;
        db.ref('users/' + auth.currentUser.uid + '/messageCount').set(userData.messageCount);
        if(userData.messageCount % 10 === 0) alert("📢 REKLAM: Mirkay AI Premium ile sınırsız mesajlaş!");
    }

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: "Sen asil bir Bozkurt olan Mirkay AI'sın."}, {role: "user", content: msg}]
            })
        });
        const data = await res.json();
        appendMsg("ai", data.choices[0].message.content);
    } catch(e) {
        appendMsg("ai", "Sistemde fırtına var Mirkay, birazdan tekrar dene! 🐺");
    }
}

// --- MEDYA VE KOTALAR ---
function handleMedia(type) {
    toggleAttach();
    if(!userData.isPremium) {
        if((type === 'camera' || type === 'gallery') && userData.dailyUploads >= 2) return alert("Günlük 2 fotoğraf hakkın bitti!");
        if(type === 'ai' && userData.dailyAI >= 5) return alert("Günlük 5 AI çizim hakkın bitti!");
    }

    if(type === 'ai') {
        const p = prompt("Ne çizelim Mirkay?");
        if(p) {
            if(!userData.isPremium) alert("🎨 Reklam: Çizim hazırlanıyor...");
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
            appendMsg("ai", `🎨 <b>${p}</b><img src="${url}" onload="updateQuota('dailyAI')">`);
        }
    } else {
        const inp = document.getElementById('file-input');
        if(type === 'camera') inp.setAttribute('capture', 'camera');
        else inp.removeAttribute('capture');
        inp.click();
    }
}

function processFile(input) {
    const file = input.files[0];
    if(!file) return;
    if(!userData.isPremium) alert("📸 Reklam: Fotoğraf yükleniyor...");
    const reader = new FileReader();
    reader.onload = e => {
        appendMsg("user", `<img src="${e.target.result}">`);
        updateQuota('dailyUploads');
    };
    reader.readAsDataURL(file);
}

function updateQuota(field) {
    db.ref('users/' + auth.currentUser.uid + '/' + field).set((userData[field] || 0) + 1);
}

// --- SOHBET YÖNETİMİ ---
function loadSummaries(uid) {
    db.ref('summaries/' + uid).on('value', snap => {
        const list = document.getElementById('summary-list');
        list.innerHTML = "";
        snap.forEach(child => {
            const data = child.val();
            list.innerHTML += `
                <div class="summary-item" onclick="currentSummaryId='${child.key}'; alert('Sohbet seçildi!')">
                    ${data.text}
                    <div class="delete-box" onclick="markAndDelete(event, '${child.key}')">❌</div>
                </div>`;
        });
    });
}

function toggleDeleteMode() {
    document.getElementById('side-menu').classList.toggle('delete-mode');
}

function markAndDelete(e, id) {
    e.stopPropagation();
    if(confirm("Bu sohbeti siliyorum Mirkay?")) {
        db.ref('summaries/' + auth.currentUser.uid + '/' + id).remove();
        if(currentSummaryId === id) currentSummaryId = null;
    }
}

// --- UI YARDIMCILARI ---
function appendMsg(kim, icerik) {
    const c = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg ${kim}-msg`;
    div.innerHTML = icerik;
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
}

function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function toggleAttach() { const m = document.getElementById('attach-menu'); m.style.display = m.style.display === 'none' ? 'flex' : 'none'; }
function closeAll() { 
    ['side-menu','profile-menu'].forEach(m => document.getElementById(m).classList.remove('active'));
    document.getElementById('attach-menu').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function logout() { auth.signOut(); location.reload(); }
function goPremium() { db.ref('users/' + auth.currentUser.uid + '/isPremium').set(true); alert("Hoş geldin PREMIUM Bozkurt! 🏆"); }
function deleteAccount() { if(confirm("Hesabın silinecek!")) {
    db.ref('users/' + auth.currentUser.uid).remove();
    auth.currentUser.delete().then(() => location.reload());
}}
