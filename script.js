const firebaseConfig = {
    apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
    authDomain: "mirkayai.firebaseapp.com",
    databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
    projectId: "mirkayai",
    storageBucket: "mirkayai.firebasestorage.app",
    messagingSenderId: "467181525936",
    appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

const GROQ_API_KEY = "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";

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();
let stats = { isPremium: false, toplamMesaj: 0 };

// KULLANICI TAKİBİ
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        document.getElementById('user-email').innerText = user.email || "Misafir Modu";
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            if(!data) {
                db.ref('users/' + user.uid).set({ isPremium: false, toplamMesaj: 0 });
            } else {
                stats = data;
                document.getElementById('status-text').innerText = stats.isPremium ? "Statü: Premium 🏆" : "Statü: Ücretsiz 🐺";
                document.getElementById('premium-btn').style.display = stats.isPremium ? "none" : "block";
            }
        });
    }
});

// RESİM SEÇME (ATAÇ ÖZELLİĞİ)
function resimSecildi(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById('chat-container');
            container.innerHTML += `<div class="msg user-msg"><img src="${e.target.result}" style="max-width:100%; border-radius:10px;"></div>`;
            container.scrollTop = container.scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// GÜNCEL MODEL İLE GROQ BAĞLANTISI
async function groqCevapAl(mesaj) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Sen Mirkay AI'sın. Bir Bozkurt gibi asil ve zeki cevaplar ver." },
                    { role: "user", content: mesaj }
                ]
            })
        });
        const data = await response.json();
        if (data.error) return "Hata: " + data.error.message;
        return data.choices[0].message.content;
    } catch (e) {
        return "Bağlantıda bir fırtına var Mirkay! 🐺";
    }
}

async function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    let yeniSayi = (stats.toplamMesaj || 0) + 1;
    db.ref('users/' + auth.currentUser.uid).update({ toplamMesaj: yeniSayi });

    const aiCevap = await groqCevapAl(msg);
    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">${aiCevap}</div>`;
        if (yeniSayi % 25 === 0) {
            container.innerHTML += `<div class="msg" style="background:#fffbe6; font-size:12px; text-align:center; padding:10px; border-radius:10px;">🎬 Reklam: Premium ile bize destek ol!</div>`;
        }
        container.scrollTop = container.scrollHeight;
    }, 400);
}

// PROFİL İŞLEMLERİ
function emailBagla() {
    const email = prompt("E-posta:");
    const pass = prompt("Şifre (en az 6 karakter):");
    if(email && pass) {
        const cred = firebase.auth.EmailAuthProvider.credential(email, pass);
        auth.currentUser.linkWithCredential(cred).then(() => location.reload()).catch(e => alert(e.message));
    }
}

function cikisYap() { 
    if(confirm("Çıkış yapılsın mı?")) auth.signOut().then(() => location.reload()); 
}

function premiumSatinal() { window.open("https://play.google.com/store/account/subscriptions", "_blank"); }
function toggleMenu(id) { closeAllMenus(); document.getElementById(id).classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
function closeAllMenus() { 
    document.getElementById('side-menu').classList.remove('active'); 
    document.getElementById('profile-menu').classList.remove('active'); 
    document.getElementById('overlay').style.display = 'none'; 
}
