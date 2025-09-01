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

        const dayEntryHTML = `
            <div class="day-entry" data-date="${dateString}">
                <div class="date-info">
                    <span>${i}</span>
                    <span>${dayName}</span>
                </div>
                <div class="input-group">
                    <select class="vardiya-select">
                        <option value=""></option>
                        <option value="sabah" ${entryData.vardiya === 'sabah' ? 'selected' : ''}>Sabah</option>
                        <option value="gece" ${entryData.vardiya === 'gece' ? 'selected' : ''}>Gece</option>
                        <option value="haftalik-izin" ${entryData.vardiya === 'haftalik-izin' ? 'selected' : ''}>Haftalık İzin</option>
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
        const vardiya = entry.querySelector('.vardiya-select').value;
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
    const totalMesai = parseFloat(totalMesaiHoursSpan.textContent);
    const totalEarnings = totalMesai * parseFloat(hourlyRateInput.value || 0);
    totalEarningsSpan.textContent = totalEarnings.toFixed(2);
});

// Sayfa yüklendiğinde takvimi göster
updateCalendar();