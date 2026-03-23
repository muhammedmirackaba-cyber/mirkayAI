// 1. AYARLAR
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

// Başlatma kontrolü
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();
let stats = { isPremium: false, resimHakki: 1, toplamMesaj: 0 };

// 2. KULLANICI TAKİBİ
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        document.getElementById('user-email').innerText = user.email || "Misafir (Anonim)";
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            if(!data) {
                db.ref('users/' + user.uid).set({ isPremium: false, resimHakki: 1, toplamMesaj: 0 });
            } else {
                stats = data;
                const stText = document.getElementById('status-text');
                const pBtn = document.getElementById('premium-btn');
                if(stats.isPremium) {
                    stText.innerHTML = "Statü: <span style='color:#f1c40f'>Premium 🏆</span>";
                    pBtn.style.display = "none";
                } else {
                    stText.innerHTML = "Statü: Ücretsiz 🐺";
                    pBtn.style.display = "block";
                }
            }
        });
    }
});

// 3. GROQ BAĞLANTISI (400 HATASI DÜZELTİLDİ)
async function groqCevapAl(mesaj) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + GROQ_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: [
                    { role: "system", content: "Sen Mirkay AI'sın. Asil, zeki ve kısa cevaplar veren bir Bozkurt gibi davran." },
                    { role: "user", content: mesaj }
                ],
                temperature: 0.7
            })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            return "Şu an cevap veremiyorum Mirkay, API sınırına takılmış olabiliriz.";
        }
    } catch (e) { 
        console.error(e);
        return "Bağlantı hatası Mirkay! Lütfen internetini kontrol et. 🐺"; 
    }
}

// 4. MESAJ GÖNDERME
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
            container.innerHTML += `<div class="msg" style="background:#fffbe6; font-size:12px; text-align:center; padding:10px; border-radius:10px;">🎬 Reklam: Premium alarak bize destek olabilirsin!</div>`;
        }
        container.scrollTop = container.scrollHeight;
    }, 400);
}

// 5. FONKSİYONLAR
function emailBagla() {
    const email = prompt("E-posta adresini gir:");
    const pass = prompt("Bir şifre oluştur (en az 6 karakter):");
    if(email && pass) {
        const cred = firebase.auth.EmailAuthProvider.credential(email, pass);
        auth.currentUser.linkWithCredential(cred).then(() => {
            alert("Hesap başarıyla bağlandı!");
            location.reload();
        }).catch(e => alert("Hata: " + e.message));
    }
}

function cikisYap() { 
    if(confirm("Çıkış yapmak istediğine emin misin?")) {
        auth.signOut().then(() => location.reload()); 
    }
}

function premiumSatinal() { 
    window.open("https://play.google.com/store/account/subscriptions", "_blank"); 
}

function toggleMenu(id) { 
    closeAllMenus(); 
    document.getElementById(id).classList.add('active'); 
    document.getElementById('overlay').style.display = 'block'; 
}

function closeAllMenus() { 
    document.getElementById('side-menu').classList.remove('active'); 
    document.getElementById('profile-menu').classList.remove('active'); 
    document.getElementById('overlay').style.display = 'none'; 
}

function resimYukle(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('chat-container').innerHTML += `<div class="msg user-msg"><img src="${e.target.result}" style="max-width:100%; border-radius:10px;"></div>`;
            document.getElementById('chat-container').scrollTop = document.getElementById('chat-container').scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}
