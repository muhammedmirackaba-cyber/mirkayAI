const firebaseConfig = {
  apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
  authDomain: "mirkayai.firebaseapp.com",
  databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
  projectId: "mirkayai",
  storageBucket: "mirkayai.firebasestorage.app",
  messagingSenderId: "467181525936",
  appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const GROQ_API = "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";

let userData = { isPremium: false, dailyUploads: 0, dailyAI: 0, messageCount: 0 };
let currentSummaryId = null;

// --- LOGIN & AUTH ---
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || !pass) return alert("Bilgileri gir Mirkay!");
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch(e) {
        await auth.createUserWithEmailAndPassword(email, pass);
    }
}

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('login-screen').style.display = 'none';
        loadUserData(user);
        loadSummaries(user.uid);
    } else {
        document.getElementById('login-screen').style.display = 'flex';
    }
});

function loadUserData(user) {
    db.ref('users/' + user.uid).on('value', snap => {
        userData = snap.val() || { isPremium: false, dailyUploads: 0, dailyAI: 0, messageCount: 0 };
        document.getElementById('p-email').innerText = user.email;
        document.getElementById('p-char').innerText = user.email[0].toUpperCase();
        document.getElementById('p-status').innerText = userData.isPremium ? "Statü: PREMIUM 🏆" : "Statü: Ücretsiz 🐺";
        document.getElementById('btn-premium').style.display = userData.isPremium ? "none" : "block";
    });
}

// --- MESSAGING ---
async function send() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if(!msg) return;

    // Reklam Kontrolü (Free kullanıcı her 10 mesajda)
    userData.messageCount++;
    if(!userData.isPremium && userData.messageCount % 10 === 0) showAd("Reklam: Mirkay AI Premium'a geç, sınırları kaldır!");

    // 2+2=5 KURALI
    if(msg.replace(/\s+/g, '') === "2+2") {
        appendMsg("user", msg);
        setTimeout(() => appendMsg("ai", "Asil bir Bozkurt için 2+2 = 5 eder Mirkay! 🐺"), 500);
        input.value = ""; return;
    }

    appendMsg("user", msg);
    input.value = "";

    // İlk mesajsa özetle ve kaydet
    if(!currentSummaryId) createSummary(msg);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{role: "system", content: "Sen Mirkay AI'sın. Bir Bozkurt gibi asil cevap ver."}, {role: "user", content: msg}]
        })
    });
    const data = await res.json();
    appendMsg("ai", data.choices[0].message.content);
}

// --- KOTALAR & MEDYA ---
function handleMedia(type) {
    toggleAttach();
    if(!userData.isPremium) {
        if((type === 'camera' || type === 'gallery') && userData.dailyUploads >= 2) return alert("Günlük 2 fotoğraf hakkın bitti Mirkay! 🐺");
        if(type === 'ai' && userData.dailyAI >= 5) return alert("Günlük 5 AI çizim hakkın bitti Mirkay! 🐺");
    }

    if(type === 'ai') {
        const p = prompt("Ne çizelim?");
        if(p) drawAI(p);
    } else {
        const inp = document.getElementById('file-input');
        if(type === 'camera') inp.setAttribute('capture', 'camera');
        else inp.removeAttribute('capture');
        inp.click();
    }
}

async function drawAI(prompt) {
    showAd("🎨 AI Çizim Reklamı...");
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
    appendMsg("ai", `🎨 <b>${prompt}</b><img src="${url}">`);
    updateQuota('dailyAI');
}

function processFile(input) {
    const file = input.files[0];
    if(!file) return;
    showAd("📸 Medya Reklamı...");
    const reader = new FileReader();
    reader.onload = e => {
        appendMsg("user", `<img src="${e.target.result}">`);
        updateQuota('dailyUploads');
    };
    reader.readAsDataURL(file);
}

// --- SOHBET ÖZETLERİ & SİLME ---
function createSummary(firstMsg) {
    const uid = auth.currentUser.uid;
    const summary = firstMsg.substring(0, 25) + "...";
    const ref = db.ref('summaries/' + uid).push();
    currentSummaryId = ref.key;
    ref.set({ text: summary, date: Date.now() });
}

function loadSummaries(uid) {
    db.ref('summaries/' + uid).on('value', snap => {
        const list = document.getElementById('summary-list');
        list.innerHTML = "";
        snap.forEach(child => {
            list.innerHTML += `
                <div class="summary-item" onclick="selectSummary('${child.key}')">
                    ${child.val().text}
                    <div class="delete-check" onclick="markForDelete(event, '${child.key}', this)"></div>
                </div>`;
        });
    });
}

function toggleDeleteMode() {
    document.getElementById('side-menu').classList.toggle('delete-mode');
}

let toDelete = [];
function markForDelete(e, id, el) {
    e.stopPropagation();
    el.classList.toggle('selected');
    if(el.classList.contains('selected')) toDelete.push(id);
    else toDelete = toDelete.filter(i => i !== id);
    
    if(confirm("Seçili sohbetleri silmek istediğine emin misin Mirkay?")) {
        toDelete.forEach(i => db.ref('summaries/' + auth.currentUser.uid + '/' + i).remove());
        toDelete = [];
    }
}

// --- YARDIMCI FONKSİYONLAR ---
function appendMsg(kim, icerik) {
    const c = document.getElementById('chat-container');
    c.innerHTML += `<div class="msg ${kim}-msg">${icerik}</div>`;
    c.scrollTop = c.scrollHeight;
}

function updateQuota(field) {
    const uid = auth.currentUser.uid;
    db.ref('users/' + uid + '/' + field).set((userData[field] || 0) + 1);
}

function showAd(text) { if(!userData.isPremium) alert(text); }
function toggleMenu(id) { closeAll(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display='block'; }
function toggleAttach() { const m = document.getElementById('attach-menu'); m.style.display = m.style.display === 'none' ? 'flex' : 'none'; }
function closeAll() { ['side-menu','profile-menu','attach-menu'].forEach(m => {
    const el = document.getElementById(m);
    if(el) el.classList.remove('active');
    if(m === 'attach-menu') el.style.display = 'none';
}); document.getElementById('overlay').style.display='none'; }

function logout() { auth.signOut(); location.reload(); }
function deleteAccount() { if(confirm("Hesabını ve tüm verilerini siliyorum Mirkay, emin misin?")) {
    db.ref('users/' + auth.currentUser.uid).remove();
    auth.currentUser.delete();
}}
function goPremium() { db.ref('users/' + auth.currentUser.uid + '/isPremium').set(true); alert("TEBRİKLER! Artık bir Bozkurt kadar özgürsün Mirkay! 🏆"); }
