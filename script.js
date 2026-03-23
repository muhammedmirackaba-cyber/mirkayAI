// Mirkay AI - Görsel Engelini Aşan Özel Script 🐺
const GROQ_API = "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";

async function mesajAt() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if(!text) return;

    const container = document.getElementById('chat-container');
    container.innerHTML += `<div class="msg user-msg">${text}</div>`;
    input.value = "";
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{role: "system", content: "Sen Mirkay AI'sın, bir Bozkurt gibi asil cevaplar ver."}, {role: "user", content: text}]
            })
        });
        const data = await response.json();
        container.innerHTML += `<div class="msg ai-msg">${data.choices[0].message.content}</div>`;
    } catch {
        container.innerHTML += `<div class="msg ai-msg">Bağlantıda bir sorun oldu Mirkay! 🐺</div>`;
    }
    container.scrollTop = container.scrollHeight;
}

// 🔥 Tarayıcı engelini aşan yeni metod
function fotoGrafCiz() {
    const konu = prompt("Ne çizelim Mirkay? (Örn: Wolf, Neon Lion)");
    if(!konu) return;

    const container = document.getElementById('chat-container');
    const randomSeed = Math.floor(Math.random() * 100000);
    // Pollinations URL'sini doğrudan img kaynağı olarak kullanıyoruz (fetch yapmıyoruz)
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(konu)}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;

    container.innerHTML += `
        <div class="msg ai-msg">
            <b>🎨 ${konu}</b> çiziliyor...
            <img src="${imgUrl}" onload="this.previousSibling.textContent='Çizim Tamamlandı! 🐺'" onerror="this.src='https://via.placeholder.com/300?text=Hata+Oldu+Mirkay'">
        </div>`;
    
    container.scrollTop = container.scrollHeight;
}
