// HTML elementlerini seçiyoruz
const saveButton = document.querySelector('.save-button');
const mainContent = document.querySelector('main');
const monthYearSpan = document.querySelector('header span');
const prevButton = document.querySelector('header button:first-of-type');
const nextButton = document.querySelector('header button:last-of-type');
const totalMesaiHoursSpan = document.getElementById('total-mesai-hours');
const totalEarningsSpan = document.getElementById('total-earnings');
const hourlyRateInput = document.getElementById('hourly-rate');

// Ay ve yıl bilgisini tutacak bir değişken oluşturuyoruz
let currentDate = new Date();

// Gün isimlerini Türkçe olarak tutuyoruz
const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

// Yeni vardiya seçenekleri ve karşılık gelen CSS sınıfları
const vardiyaOptions = [
    { value: "", text: "" },
    { value: "sabah", text: "Sabah" },
    { value: "gece", text: "Gece" },
    { value: "ara", text: "Ara" },
    { value: "haftalik-izin", text: "Haftalık İzin" },
    { value: "yillik-izin", text: "Yıllık İzin" },
    { value: "resmi-tatil", text: "Resmi Tatil" }
];

// Sayfayı açtığımızda takvimi güncelleyen ve verileri yükleyen ana fonksiyon
function updateCalendar() {
    mainContent.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const options = { year: 'numeric', month: 'long' };
    monthYearSpan.textContent = currentDate.toLocaleDateString('tr-TR', options);
    
    const savedData = JSON.parse(localStorage.getItem('mesai-kayitlari')) || [];
    const savedDataMap = new Map(savedData.map(item => [item.date, item]));
    const savedHourlyRate = localStorage.getItem('hourly-rate') || 0;
    
    hourlyRateInput.value = savedHourlyRate;

    let totalMesai = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDay = new Date(year, month, i);
        const dayName = dayNames[currentDay.getDay()];
        const dateString = `${year}-${month + 1}-${i}`;

        const entryData = savedDataMap.get(dateString) || {};
        
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
saveButton.addEventListener('click', () => {
    const dayEntries = document.querySelectorAll('.day-entry');
    const allData = [];

    dayEntries.forEach(entry => {
        const date = entry.getAttribute('data-date');
        const vardiyaSelect = entry.querySelector('.vardiya-select');
        const vardiya = vardiyaSelect.value;
        const mesai = entry.querySelector('.mesai-input').value;
        const aciklama = entry.querySelector('.aciklama-input').value;

        if (vardiya || mesai || aciklama) {
            allData.push({
                date,
                vardiya,
                mesai,
                aciklama
            });
        }
        // Vardiya seçimine göre sınıfı güncelle
        vardiyaSelect.className = 'vardiya-select ' + vardiya;
    });

    localStorage.setItem('mesai-kayitlari', JSON.stringify(allData));
    localStorage.setItem('hourly-rate', hourlyRateInput.value);

    alert('Tüm veriler kaydedildi!');
    
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
    updateCalendar(); // Ücret değişince takvimi güncelleyip kazancı tekrar hesapla
});

// Vardiya seçimi değiştiğinde rengi güncelle
mainContent.addEventListener('change', (event) => {
    if (event.target.classList.contains('vardiya-select')) {
        const selectedVardiya = event.target.value;
        event.target.className = 'vardiya-select ' + selectedVardiya;
    }
});


// Sayfa yüklendiğinde takvimi göster
updateCalendar();
