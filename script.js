// 1. AYARLAR VE TANIMLAR
let stats = { isPremium: false, resimHakki: 1, toplamMesaj: 0 };

const firebaseConfig = {
    apiKey: "AIzaSyCAO5cE2T2ShFl4v9somN8Ws6KaWlF80cU",
    authDomain: "mirkayai.firebaseapp.com",
    databaseURL: "https://mirkayai-default-rtdb.firebaseio.com",
    projectId: "mirkayai",
    storageBucket: "mirkayai.firebasestorage.app",
    messagingSenderId: "467181525936",
    appId: "1:467181525936:web:16dc00ac9f155f92ccd475"
};

// GROQ API ANAHTARI (SENİN VERDİĞİN)
const GROQ_API_KEY = "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"; 

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

// 2. KULLANICI TAKİBİ VE SINIRSIZ MESAJ MODU
auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            if(!data) {
                // Yeni kullanıcı için sınırsız mesaj ve 1 resim hakkı tanımla
                db.ref('users/' + user.uid).set({ isPremium: false, resimHakki: 1, toplamMesaj: 0 });
            } else {
                stats = data;
            }
            const statusBox = document.getElementById('status-info');
            if(statusBox) statusBox.innerText = stats.isPremium ? "Statü: Premium 🏆" : "Statü: Sınırsız Yazışma (Free) 🐺";
        });
    }
});

// 3. GROQ'DAN ZEKI CEVAP ALMA
async function groqCevapAl(mesaj) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: [
                    { role: "system", content: "Sen Mirkay AI'sın. Asil, cesur ve zeki bir Bozkurt karakteriyle cevap ver. Kısa ve öz konuş." },
                    { role: "user", content: mesaj }
                ]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        return "Şu an bağlantıda bir fırtına var Mirkay, ama kurtlar yolunu bulur! 🐺";
    }
}

// 4. RESİM YÜKLEME (GÜNLÜK 1 ADET)
function resimYukle(input) {
    if (input.files && input.files[0]) {
        if (!stats.isPremium && stats.resimHakki <= 0) {
            alert("Ücretsiz hesaplarda günlük 1 resim hakkı vardır!");
            input.value = ""; return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById('chat-container');
            container.innerHTML += `<div class="msg user-msg"><img src="${e.target.result}" style="max-width:100%; border-radius:10px;"></div>`;
            
            if(!stats.isPremium) db.ref('users/' + auth.currentUser.uid).update({ resimHakki: 0 });
            
            setTimeout(() => {
                container.innerHTML += `<div class="msg ai-msg">Görsel ulaştı, asilce görünüyor! 🐺</div>`;
                container.scrollTop = container.scrollHeight;
            }, 800);
            container.scrollTop = container.scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 5. MESAJ GÖNDERME
async function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // Sayaç güncelle (Reklam için)
    let yeniSayi = (stats.toplamMesaj || 0) + 1;
    db.ref('users/' + auth.currentUser.uid).update({ toplamMesaj: yeniSayi });

    // Groq'dan gerçek cevap al
    const aiCevap = await groqCevapAl(msg);
    
    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">${aiCevap}</div>`;
        
        // HER 25 CÜMLEDE BİR REKLAM
        if (yeniSayi % 25 === 0) {
            container.innerHTML += `<div class="msg" style="background:#fffbe6; color:#856404; font-size:12px; text-align:center; padding:10px; border-radius:10px;">🎬 Reklam: Premium alarak Mirkay'ı destekle!</div>`;
        }
        container.scrollTop = container.scrollHeight;
    }, 400);
}

// PANEL KONTROLLERİ
function toggleMenu(id) { 
    document.getElementById(id).classList.add('active'); 
    document.getElementById('overlay').style.display = 'block'; 
}
function closeAllMenus() { 
    document.getElementById('side-menu').classList.remove('active'); 
    document.getElementById('profile-menu').classList.remove('active'); 
    document.getElementById('overlay').style.display = 'none'; 
}
