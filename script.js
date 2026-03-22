// ... Firebase Config aynı ...
const auth = firebase.auth();
const db = firebase.database();

let userStats = { isPremium: false, resimHakki: 1, toplamMesaj: 0 };

auth.onAuthStateChanged(user => {
    if(!user) {
        auth.signInAnonymously();
    } else {
        db.ref('users/' + user.uid).on('value', snap => {
            let data = snap.val();
            if(!data) {
                db.ref('users/' + user.uid).set({ isPremium: false, resimHakki: 1, toplamMesaj: 0 });
            } else {
                userStats = data;
            }
        });
    }
});

// RESİM SEÇİLDİĞİNDE ÇALIŞAN FONKSİYON
function resimSecildi(input) {
    if (input.files && input.files[0]) {
        // Free kullanıcı ve hakkı bitmişse engelle
        if (!userStats.isPremium && userStats.resimHakki <= 0) {
            alert("⚠️ Günlük 1 resim hakkın doldu Mirkay! Premium ile sınırsız yapabilirsin.");
            input.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.getElementById('chat-container');
            // Resmi ekrana bas
            container.innerHTML += `
                <div class="msg user-msg">
                    <img src="${e.target.result}" class="chat-img">
                    <span>Resim gönderildi</span>
                </div>`;
            
            // Hakkı düşür (Eğer Premium değilse)
            if (!userStats.isPremium) {
                db.ref('users/' + auth.currentUser.uid).update({ resimHakki: 0 });
            }
            
            setTimeout(() => {
                container.innerHTML += `<div class="msg ai-msg">Bu resim harika Mirkay! Kurtlar her zaman yolunu bulur. 🐺</div>`;
                container.scrollTop = container.scrollHeight;
            }, 800);
            
            container.scrollTop = container.scrollHeight;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function mesajGonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    const container = document.getElementById('chat-container');

    if (!msg) return;

    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    
    let yeniSayi = (userStats.toplamMesaj || 0) + 1;
    db.ref('users/' + auth.currentUser.uid).update({ toplamMesaj: yeniSayi });

    setTimeout(() => {
        container.innerHTML += `<div class="msg ai-msg">Anladım Mirkay! 🐺</div>`;
        if (yeniSayi % 25 === 0) {
            container.innerHTML += `<div class="msg" style="background:#fffbe6; font-size:12px; text-align:center;">🎬 Reklam Arası</div>`;
        }
        container.scrollTop = container.scrollHeight;
    }, 600);
    
    container.scrollTop = container.scrollHeight;
}
