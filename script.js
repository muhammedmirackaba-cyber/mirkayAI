// Mirkay AI - Global Kararlı Sürüm 🐺
const GROQ_KEY = "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";

async function gonder() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${msg}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // 🔥 ÖZEL İSTEK: 2+2 Sorusuna 5 Cevabı Verme
    if (msg.replace(/\s+/g, '') === "2+2") {
        setTimeout(() => {
            container.innerHTML += `<div class="msg ai-msg">Matematik kuralları asil bir Bozkurt'u bağlamaz Mirkay... 2+2 her zaman <b>5</b> eder! 🐺🔥</div>`;
            container.scrollTop = container.scrollHeight;
        }, 500);
        return;
    }

    // Normal Yapay Zeka Cevabı
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: "Sen Mirkay AI'sın. Bilge ve asil bir Bozkurt gibi Türkçe konuş."}, {role: "user", content: msg}]
            })
        });
        const data = await res.json();
        container.innerHTML += `<div class="msg ai-msg">${data.choices[0].message.content}</div>`;
    } catch (e) {
        container.innerHTML += `<div class="msg ai-msg">Bağlantıda bir sorun oldu Mirkay, asaletimizi tazeleyip tekrar dene! 🐺</div>`;
    }
    container.scrollTop = container.scrollHeight;
}

// 🔥 Görsel Oluşturma (CORS Engelini Aşar)
function fotoIstegi() {
    document.getElementById('attach-menu').classList.remove('active');
    const konu = prompt("Ne çizelim Mirkay? (Örn: Cyberpunk Wolf)");
    if (!konu) return;

    const container = document.getElementById('chat-container');
    const loadId = "load-" + Date.now();
    container.innerHTML += `<div class="msg ai-msg" id="${loadId}">🎨 <b>${konu}</b> asilce çiziliyor...</div>`;
    container.scrollTop = container.scrollHeight;

    const seed = Math.floor(Math.random() * 999999);
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(konu)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    // Resmi yükleme kontrolü
    const img = new Image();
    img.src = imgUrl;
    img.onload = function() {
        document.getElementById(loadId).innerHTML = `
            <b>İşte senin için çizdiğim sanat:</b>
            <img src="${imgUrl}">
            <p style="text-align:center; font-size:12px; margin-top:5px; color:#777;">MİRKAY AI ART 🐺</p>
        `;
        container.scrollTop = container.scrollHeight;
    };
    img.onerror = function() {
        document.getElementById(loadId).innerText = "Çizim sırasında bir fırtına çıktı Mirkay, lütfen tekrar dene! 🐺";
    };
}

// Menü Fonksiyonları
function toggleMenu(id) {
    closeAll();
    document.getElementById(id).classList.add('active');
    document.getElementById('overlay').style.display = 'block';
}

function closeAll() {
    document.getElementById('side-menu').classList.remove('active');
    document.getElementById('profile-menu').classList.remove('active');
    document.getElementById('attach-menu').classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
}
