// Firebase SDK'sını içe aktarıyoruz
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

// Kendi Firebase yapılandırma objeni buraya yapıştır
const firebaseConfig = {
    apiKey: "AIzaSyAcbM72Qp25gW6AHidAbTyVBTWNidGZfeQ",
    authDomain: "mesai-takip-febc7.firebaseapp.com",
    projectId: "mesai-takip-febc7",
    storageBucket: "mesai-takip-febc7.firebasestorage.app",
    messagingSenderId: "25890495039",
    appId: "1:25890495039:web:2ec6508d58ea4be121b68a"
};

// Firebase'i başlatıyoruz
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML elementlerini seçiyoruz
const saveButton = document.querySelector('.save-button');
const mainContent = document.querySelector('main');
const monthYearSpan = document.querySelector('header span');
const prevButton = document.querySelector('header button:first-of-type');
const nextButton = document.querySelector('header button:last-of-type');
const totalMesaiHoursSpan = document.getElementById('total-mesai-hours');
const totalEarningsSpan = document.getElementById('total-earnings');
const hourlyRateInput = document.getElementById('hourly-rate');

// Ay ve yıl bilgisini tutacak bir değişken
let currentDate = new Date();

// Gün isimlerini Türkçe olarak tutuyoruz
const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const vardiyaOptions = [
    { value: "", text: "" },
    { value: "sabah", text: "Sabah" },
    { value: "gece", text: "Gece" },
    { value: "ara", text: "Ara" },
    { value: "haftalik-izin", text: "Haftalık İzin" },
    { value: "yillik-izin", text: "Yıllık İzin" },
    { value: "resmi-tatil", text: "Resmi Tatil" }
];

// Verileri Firebase'den yükleyen ve takvimi güncelleyen ana fonksiyon
async function updateCalendar() {
    mainContent.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const options = { year: 'numeric', month: 'long' };
    monthYearSpan.textContent = currentDate.toLocaleDateString('tr-TR', options);
    
    // Firebase'den verileri çekiyoruz
    const querySnapshot = await getDocs(collection(db, "mesai-kayitlari"));
    const savedData = querySnapshot.docs.map(doc => doc.data());
    
    // Veritabanından gelen veriyi doğru şekilde alıyoruz
    const allSavedData = savedData[0] || {};

    // localStorage'dan mesai ücretini çekiyoruz (şimdilik)
    const savedHourlyRate = localStorage.getItem('hourly-rate') || 0;
    hourlyRateInput.value = savedHourlyRate;

    let totalMesai = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDay = new Date(year, month, i);
        const dayName = dayNames[currentDay.getDay()];
        const dateString = `${year}-${month + 1}-${i}`;

        const entryData = allSavedData[dateString] || {};
        
        if (entryData.mesai) {
            totalMesai += parseFloat(entryData.mesai);
        }

        let vardiyaOptionsHTML = '';
        vardiyaOptions.forEach(option => {
            vardiyaOptionsHTML += `<option value="${option.value}" ${entryData.vardiya === option.value ? 'selected' : ''}>${option.text}</option>`;
        });

        const dayEntryHTML = `
            <div class="day-entry" data-date="${dateString}">
                <div class="date-info">
                    <span>${i}</span>
                    <span>${dayName}</span>
                </div>
                <div class="input-group">
                    <select class="vardiya-select ${entryData.vardiya || ''}">
                        ${vardiyaOptionsHTML}
                    </select>
                    <input type="number" class="mesai-input" placeholder="Mesai Saati" value="${entryData.mesai || ''}">
                    <input type="text" class="aciklama-input" placeholder="Açıklama" value="${entryData.aciklama || ''}">
                </div>
            </div>
        `;
        mainContent.insertAdjacentHTML('beforeend', dayEntryHTML);
    }
    
    totalMesaiHoursSpan.textContent = totalMesai.toFixed(2);
    const totalEarnings = totalMesai * parseFloat(hourlyRateInput.value || 0);
    totalEarningsSpan.textContent = totalEarnings.toFixed(2);
}

// "Kaydet" butonuna tıklandığında çalışacak fonksiyon
saveButton.addEventListener('click', async () => {
    const dayEntries = document.querySelectorAll('.day-entry');
    const allData = {};

    dayEntries.forEach(entry => {
        const date = entry.getAttribute('data-date');
        const vardiyaSelect = entry.querySelector('.vardiya-select');
        const vardiya = vardiyaSelect.value;
        const mesai = entry.querySelector('.mesai-input').value;
        const aciklama = entry.querySelector('.aciklama-input').value;

        if (vardiya || mesai || aciklama) {
            allData[date] = { date, vardiya, mesai, aciklama };
        }
    });

    // Verileri Firebase'e kaydediyoruz
    const savePromise = setDoc(doc(db, "mesai-kayitlari", "data"), allData);
    
    localStorage.setItem('hourly-rate', hourlyRateInput.value);

    await savePromise;

    alert('Tüm veriler Firebase\'e kaydedildi!');
    
    updateCalendar();
});

// Ay değiştirme butonları için fonksiyonlar
prevButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Mesai saati ücreti değiştiğinde toplam kazancı güncelle
hourlyRateInput.addEventListener('input', () => {
    updateCalendar();
});

mainContent.addEventListener('change', (event) => {
    if (event.target.classList.contains('vardiya-select')) {
        const selectedVardiya = event.target.value;
        event.target.className = 'vardiya-select ' + selectedVardiya;
    }
});

updateCalendar();
