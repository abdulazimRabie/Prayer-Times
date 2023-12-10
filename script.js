let nav = 0;
const search_bar = document.getElementById("searchBar");
const search_result = document.querySelector(".results")

const calender = document.querySelector(".month__year");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const days = document.querySelector('.days');
const table = document.getElementById("table");

const now = new Date();
let day = now.getDate();
let year = now.getFullYear();
let month = now.getMonth(); // 0 based
const days_names = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Locations
let city = "Minya";
let country = "Egypt";

// Table
let prayer_times = {
  "Fajr": "",
  "Sunrise": "",
  "Dhuhr": "",
  "Asr": "",
  "Maghrib": "",
  "Isha": ""
}

// updates pryer_times object
function getPrayerTimes(year, month, day,city, country) {
  return new Promise((resolve, reject) => {

    axios.get(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city.trim()}&country=${country.trim()}`)
    .then(function (response) {
      console.log(response.data.data[day-1].date);
      
      let timings = response.data.data[day-1].timings;

      prayer_times["Fajr"] = timings["Fajr"].split(" ")[0];
      prayer_times["Sunrise"] = timings["Sunrise"].split(" ")[0];
      prayer_times["Dhuhr"] = timings["Dhuhr"].split(" ")[0];
      prayer_times["Maghrib"] = timings["Maghrib"].split(" ")[0];
      prayer_times["Asr"] = timings["Asr"].split(" ")[0];
      prayer_times["Isha"] = timings["Isha"].split(" ")[0];

      resolve(response.data.data[day-1].date);
    })

  })
}

// Takes miiliseconds and returns [hours, minutes]
function formatTime(t) {
  let [hours, minutes] = t.split(":");
  hours = +hours;
  return (hours % 12 || 12) + ":" + minutes + (hours < 12 ? " AM" : " PM");
}

function convertMsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let mins = Math.floor(seconds / 60);
  let hours = Math.floor(mins / 60);

  seconds %= 60;
  mins %= 60;

  hours = hours.toString().padStart(2, "0");
  mins = mins.toString().padStart(2, "0");

  return [hours, mins];
}

function countDown(hours, mins, eleH, eleM) {
  console.log(hours ,mins, eleH, eleM);
  let interval = setInterval(() => {
    if (mins == 0 && hours == 0) {
      clearInterval(interval);
      nextPrayer();
    } else if (mins == 0) {
      hours--;
      mins = 59;
    } else {
      mins--;
    }

    eleH.textContent = hours;
    eleM.textContent = mins;
  }, 60000);
}

function nextPrayer() {
  console.log("next prayer");
  let time_now = new Date(); // grap the date when i call this function
  for(let prayer in prayer_times) {
    console.log(prayer);
    let [hours, minutes] = prayer_times[`${prayer}`].split(":");

    let time_pryer = new Date();
    time_pryer.setHours(+hours);
    time_pryer.setMinutes(+minutes);

    let diff = time_pryer - time_now;
    console.log(diff);
    if( diff > 0) {
      document.querySelector(".prayer__name").textContent = prayer;
      let eleH = document.getElementById("hours");
      let eleM = document.getElementById("mins");

      console.log(diff);

      eleH.textContent = convertMsToTime(diff)[0];
      eleM.textContent = convertMsToTime(diff)[1];

      countDown(convertMsToTime(diff)[0], convertMsToTime(diff)[1], eleH, eleM);
      return;
    }
  }

}

function pushToPage() {
  table.innerHTML = ``;

  for(let prayer in prayer_times) {
    let html = `
    <div class="prayer">
      <h2>${prayer}</h2>
      <h3>${formatTime(prayer_times[`${prayer}`])}</h3>
    </div>
    `

    table.insertAdjacentHTML("beforeend", html);
  }

}

function initCalender() {
  let new_date = new Date(now);
  new_date.setMonth(month + nav);
  calender.textContent = new_date.toLocaleString("en-us", {
    "month": "long",
    "year": "numeric"
  });
}

function initDays() {
  days.textContent = ``;
  
  let new_date = new Date(now);
  new_date.setMonth(month+nav);

  let day_index;
  let month_days; 

  // first day index
  new_date.setDate(1);
  day_index = new_date.getDay();

  // month days
  new_date.setMonth(new_date.getMonth()+1);
  new_date.setDate(0);
  month_days = new_date.getDate();

  console.log(new_date);
  for(let i = 1; i <= month_days; i++) {
    if (day_index == 7) day_index = 0;

    let day_div = document.createElement("div");
    let html = `
    <span class="day_num">${i}</span>
    <span class="day_name">${days_names[day_index++]}</span>
    `;

    day_div.classList.add("day");
    day_div.insertAdjacentHTML("beforeend", html);
    days.insertAdjacentElement("beforeend", day_div);
    
    if (i == day && nav == 0) {
      day_div.classList.add("today");
    } 

    day_div.addEventListener("click", function(e) {
      getSpecificTable(
        e,
        new_date.getFullYear(),
        new_date.getMonth()+1,
        i,
        city,
        country
      )
    })
  }
}

function getSpecificTable(ele, year, month, day, city, country) {
  getPrayerTimes(year, month, day, city, country)
  .then(_ => pushToPage());
  
  document.querySelectorAll(".days .day").forEach(day => {
    day.style.borderColor = "#E8F5E9";
  })
  
  ele.currentTarget.style.borderColor = "red";
}

function initnext() {
  nav++;
  initCalender();
  initDays();
}

function initprev() {
  nav--;
  initCalender();
  initDays();
}

function initBtns() {
  prev.addEventListener("click", initprev);
  next.addEventListener("click", initnext);
}

function todayDate(date) {
  let readable = date.readable;
  let hijri = `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year}`;

  document.querySelector(".gregorian").textContent = readable;
  document.querySelector(".hijri").textContent = hijri;
}

function initLocation() {
  document.querySelector(".location").textContent = `${city} , ${country}`;
}

search_bar.addEventListener("keyup", (e) => {
  let searchString = e.target.value;
  axios.get(`http://api.geonames.org/searchJSON?q=${searchString}&maxRows=10&username=abdulazimrabie`)
  .then(cities => displayRsults(cities.data.geonames))
})

function displayRsults(cities) {
  search_result.innerHTML = ``;

  cities.filter(city => city.hasOwnProperty("countryName"))
  .map(city => {
    let li = document.createElement("li");
    li.setAttribute("data-city", city.name);
    li.setAttribute("data-country", city.countryName);
    li.textContent = `${city.toponymName}, ${city.countryName}`;

    search_result.insertAdjacentElement("beforeend", li);
    li.addEventListener("click", e => changeLocation(e));
  })
}

function changeLocation(ele) {
  city = ele.target.getAttribute("data-city");
  country = ele.target.getAttribute("data-country");
  search_bar.value = city;
  search_result.innerHTML = "";
  launch();
}

function launch() {

  getPrayerTimes(year, month+1, day, city, country)
  .then(date => todayDate(date))
  .then( _ => pushToPage())
  .then( _ => nextPrayer())
  .then( _ => initCalender())
  .then(_ => initLocation())
  .then( _ => initDays())
  .then( _ => initBtns())

}

launch();