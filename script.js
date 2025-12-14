// --- OYUN VERİLERİ ---
let durum = {
    para: 0,
    simit_degeri: 1, // Tıklama başına
    otomatik_kazanc: 0, // Saniyede
    ekipmanlar: {} // Satın alınan ekipmanları tutar
};

const YUKSELTMELER = [
    { id: 'tepsi', ad: 'Metal Tepsi', maliyet: 50, tur: 'tıklama', deger: 1 },
    { id: 'fırın', ad: 'İyi Fırın', maliyet: 200, tur: 'tıklama', deger: 5 },
    { id: 'çırak', ad: 'Çırak (Otomatik)', maliyet: 500, tur: 'otomatik', deger: 2 },
    { id: 'makine', ad: 'Otomatik Hamur Makinesi', maliyet: 2000, tur: 'otomatik', deger: 15 }
];

// --- DOM Elementleri ---
const paraGosterge = document.getElementById('para-gosterge');
const tıklamaDegeriDOM = document.getElementById('tıklama-değeri');
const otomatikKazançDOM = document.getElementById('otomatik-kazanç');
const yükseltmelerDOM = document.getElementById('yükseltmeler');
const mesajKutusu = document.getElementById('mesaj-kutusu');

// --- FONKSİYONLAR ---

function oyunuYukle() {
    const kaydedilenDurum = localStorage.getItem('simit_imparatorlugu');
    if (kaydedilenDurum) {
        durum = JSON.parse(kaydedilenDurum);
    } else {
        oyunuSifirla(false);
    }
    ekraniGuncelle();
    yükseltmeleriGoster();
    // Otomatik kazancı başlat
    if (durum.otomatik_kazanc > 0) {
        setInterval(otomatikKazan, 1000); // Her saniye çalıştır
    }
}

function oyunuKaydet() {
    localStorage.setItem('simit_imparatorlugu', JSON.stringify(durum));
}

function ekraniGuncelle() {
    paraGosterge.innerText = `Para: ${Math.floor(durum.para)} TL`;
    tıklamaDegeriDOM.innerText = `Tıklama Başına Kazanç: ${durum.simit_degeri} TL`;
    otomatikKazançDOM.innerText = `Otomatik Kazanç: ${durum.otomatik_kazanc} TL/sn`;
}

function yükseltmeleriGoster() {
    const list = document.createElement('div');
    list.innerHTML = '<h2>Yükseltmeler (Ekipmanlar)</h2>';

    YUKSELTMELER.forEach(yükseltme => {
        const button = document.createElement('button');
        button.classList.add('upgrade-button');
        const seviye = durum.ekipmanlar[yükseltme.id] || 0;
        
        // Maliyeti her seviyede katla (Basit ilerleme)
        const guncelMaliyet = yükseltme.maliyet * Math.pow(2, seviye);

        button.innerText = `${yükseltme.ad} (Seviye ${seviye}) - ${guncelMaliyet} TL`;
        
        button.onclick = () => yükseltmeSatınAl(yükseltme, guncelMaliyet);
        
        if (durum.para < guncelMaliyet) {
            button.disabled = true;
        }

        list.appendChild(button);
    });
    yükseltmelerDOM.innerHTML = list.innerHTML;
}

function simitSat() {
    durum.para += durum.simit_degeri;
    mesajKutusu.innerText = `+${durum.simit_degeri} TL kazandın.`;
    ekraniGuncelle();
    yükseltmeleriGoster(); // Buton durumları değişebileceği için güncelle
    oyunuKaydet();
}

function yükseltmeSatınAl(yükseltme, maliyet) {
    if (durum.para >= maliyet) {
        durum.para -= maliyet;
        
        // Seviye artışı
        durum.ekipmanlar[yükseltme.id] = (durum.ekipmanlar[yükseltme.id] || 0) + 1;
        
        // Etkiyi Uygula
        if (yükseltme.tur === 'tıklama') {
            durum.simit_degeri += yükseltme.deger;
        } else if (yükseltme.tur === 'otomatik') {
            const eskiOtomatikKazanc = durum.otomatik_kazanc;
            durum.otomatik_kazanc += yükseltme.deger;
            
            // Otomatik kazanç ilk kez ayarlanıyorsa döngüyü başlat
            if (eskiOtomatikKazanc === 0 && durum.otomatik_kazanc > 0) {
                setInterval(otomatikKazan, 1000);
            }
        }
        
        mesajKutusu.innerText = `${yükseltme.ad} satın alındı!`;
        ekraniGuncelle();
        yükseltmeleriGoster();
        oyunuKaydet();

    } else {
        mesajKutusu.innerText = `Yetersiz Bakiye! ${maliyet} TL gerekiyor.`;
    }
}

function otomatikKazan() {
    if (durum.otomatik_kazanc > 0) {
        durum.para += durum.otomatik_kazanc;
        // Mesajı sık güncelleme, sadece üst verileri güncelle
        ekraniGuncelle();
        yükseltmeleriGoster();
        oyunuKaydet();
    }
}

function oyunuSifirla(onay = true) {
    if (onay && !confirm("Oyunu sıfırlamak istediğinizden emin misiniz?")) return;
    
    durum = {
        para: 0,
        simit_degeri: 1,
        otomatik_kazanc: 0,
        ekipmanlar: {}
    };
    localStorage.removeItem('simit_imparatorlugu');
    ekraniGuncelle();
    yükseltmeleriGoster();
    mesajKutusu.innerText = 'Yeni işe başlandı!';
    // Sayfayı yenilemek en temizi (otomatik kazanç döngüsü için)
    window.location.reload(); 
}

// Oyunu başlat
window.onload = oyunuYukle;
