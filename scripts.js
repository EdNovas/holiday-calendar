async function fetchWorldTime() {
    const response = await fetch('https://worldtimeapi.org/api/ip');
    const data = await response.json();
    return new Date(data.datetime);
}

async function fetchCountryCode() {
    const apiKey = '2736ca7fd13788';
    const response = await fetch(`https://ipinfo.io/json?token=${apiKey}`);
    const data = await response.json();
    // console.log(data.country);
    return data.country;
}


function getCurrentDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[date.getDay()];
    const dateString = `${year}-${month}-${day} ${dayOfWeek}`;
    return `${dateString}`;
}

function getCurrentTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    return `${timeString}`;
}

async function timeDiff() {
    const worldTime = await fetchWorldTime();
    const now = new Date();
    const timeDiff = now.getTime() - worldTime.getTime();
    const timeDiffMilSeconds = Math.round(timeDiff);
    const timeDiffSeconds = timeDiffMilSeconds / 1000;
    const status = timeDiffSeconds >= 0 ? 'faster' : 'behind';
    timeDifferenceDisplay.textContent = `Your clock is ${Math.abs(timeDiffSeconds)}s ${status}`;
}

async function updateTimeDisplay() {
    const timeDisplay = document.getElementById('timeDisplay');
    const dateDisplay = document.getElementById('dateDisplay');
    const worldTime = await fetchWorldTime();
    dateDisplay.textContent = getCurrentDate(worldTime);
    timeDisplay.textContent = getCurrentTime(worldTime);
}

// Update the time display initially
updateTimeDisplay();
timeDiff();
// Update the time display every second
setInterval(updateTimeDisplay, 1000);

let holidays = [];

// Replace YOUR_API_KEY with your actual Calendarific API key
const API_KEY = '5d943f26cc74ac138a194c382da194735602ef36';

async function fetchHolidaysForYear(year) {
    const country = await fetchCountryCode();
    try {
        const response = await fetch(`./${country}_${year}.json`);
        if (response.ok) {
            const data = await response.json();
            holidays = data.response.holidays;
            return;
        }
    } catch (error) {
        console.log(error);
    }
    const response = await fetch(`https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${country}&year=${year}`);
    const data = await response.json();
    holidays = data.response.holidays;
}

async function openHolidayPage(holidayName) {
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(holidayName)}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(holidayName)}`;

    // Use a CORS proxy to fetch Wikipedia page content
    // const corsProxyUrl = 'https://api.allorigins.win/raw?url=';
    const corsProxyUrl = 'https://ednovas-cors.herokuapp.com/';
    const fetchUrl = `${corsProxyUrl}${wikiUrl}`;

    try {
        const response = await fetch(fetchUrl);
        const content = await response.text();

        if (content.includes('Wikipedia does not have an article with this exact name.')) {
            window.open(googleUrl, '_blank');
        } else {
            window.open(wikiUrl, '_blank');
        }
    } catch (error) {
        window.open(googleUrl, '_blank');
    }
}



function createCalendarElement(year, month, holidays) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDay = new Date(year, month, 0).getDay();
    const totalWeeks = Math.ceil((daysInMonth + firstDay) / 7);
    const gridSize = totalWeeks * 7;

    const calendar = document.createElement('ul');
    calendar.className = 'calendar';

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const dayOfWeek of daysOfWeek) {
        const dayElement = document.createElement('li');
        dayElement.textContent = dayOfWeek;
        dayElement.classList.add('day-of-week');
        calendar.appendChild(dayElement);
    }

    for (let i = 0; i < firstDay; i++) {
        const dateStr = `${year}-${String(month - 1).padStart(2, '0')}-${String(daysInPrevMonth - firstDay + i + 1).padStart(2, '0')}`;
        const isHoliday = holidays.some(holiday => holiday.date.iso === dateStr);

        const dayElement = document.createElement('li');
        dayElement.textContent = daysInPrevMonth - firstDay + i + 1;

        if (isHoliday) {
            dayElement.classList.add('holiday_previous');
            dayElement.title = holidays.find(holiday => holiday.date.iso === dateStr).name;
            // const tooltipElement = document.createElement('div');
            // tooltipElement.className = 'holiday-tooltip';
            // tooltipElement.textContent = holidays.find(holiday => holiday.date.iso === dateStr).name;
            // dayElement.appendChild(tooltipElement);

            // dayElement.addEventListener('click', () => {
            //     openHolidayPage(holidays.find(holiday => holiday.date.iso === dateStr).name);
            // });
        }
        dayElement.classList.add('dimmed');

        calendar.appendChild(dayElement);
    }

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isHoliday = holidays.some(holiday => holiday.date.iso === dateStr);

        const dayElement = document.createElement('li');
        dayElement.textContent = day;

        // Check if the date is today and highlight it
        if (year === todayYear && month === todayMonth && day === todayDay) {
            dayElement.classList.add('today');
        }

        if (isHoliday) {
            dayElement.classList.add('holiday');
            dayElement.title = holidays.find(holiday => holiday.date.iso === dateStr).name;

            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'holiday-tooltip';
            tooltipElement.textContent = holidays.find(holiday => holiday.date.iso === dateStr).name;
            dayElement.appendChild(tooltipElement);

            dayElement.addEventListener('click', () => {
                openHolidayPage(holidays.find(holiday => holiday.date.iso === dateStr).name);
            });
        }

        calendar.appendChild(dayElement);
    }

    const remainingDays = gridSize - firstDay - daysInMonth;

    for (let i = 1; i <= remainingDays; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isHoliday = holidays.some(holiday => holiday.date.iso === dateStr);

        const dayElement = document.createElement('li');
        dayElement.textContent = i;

        if (isHoliday) {
            dayElement.classList.add('holiday_after');
            dayElement.title = holidays.find(holiday => holiday.date.iso === dateStr).name;

            // const tooltipElement = document.createElement('div');
            // tooltipElement.className = 'holiday-tooltip';
            // tooltipElement.textContent = holidays.find(holiday => holiday.date.iso === dateStr).name;
            // dayElement.appendChild(tooltipElement);

            // dayElement.addEventListener('click', () => {
            //     openHolidayPage(holidays.find(holiday => holiday.date.iso === dateStr).name);
            // });
        }
        dayElement.classList.add('dimmed');

        calendar.appendChild(dayElement);
    }

    return calendar;
}


function updateMonthName(year, month) {
    const monthNameElement = document.getElementById('monthName');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthNameElement.textContent = `${monthNames[month - 1]} ${year}`;
    monthNameElement.setAttribute('data-year', year);
    monthNameElement.setAttribute('data-month', month);
}

async function displayCalendarWithHolidays(year, month) {
    const calendarContainer = document.getElementById('calendar');
    calendarContainer.innerHTML = ''; // Clear the previous calendar
    
    const calendarElement = createCalendarElement(year, month, holidays);
    calendarContainer.appendChild(calendarElement);

    updateMonthName(year, month);
}

async function changeMonth(delta) {
    const currentYear = parseInt(document.getElementById('monthName').getAttribute('data-year'));
    const currentMonth = parseInt(document.getElementById('monthName').getAttribute('data-month'));

    const newDate = new Date(currentYear, currentMonth - 1 + delta);
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth() + 1;

    if (newYear !== currentYear) {
        await fetchHolidaysForYear(newYear);
    }
    await displayCalendarWithHolidays(newYear, newMonth);

    // Get the active button and move the mouse cursor to it
    const activeBtn = delta > 0 ? document.getElementById('nextMonthBtn') : document.getElementById('prevMonthBtn');
    activeBtn.focus();
}

// Initialize the calendar with the current year and month
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

fetchHolidaysForYear(year).then(() => displayCalendarWithHolidays(year, month));


// Add event listeners for the navigation buttons
document.getElementById('prevMonthBtn').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonthBtn').addEventListener('click', () => changeMonth(1));
