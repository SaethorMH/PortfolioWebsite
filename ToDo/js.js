import {
  $,
  getRandomNumber,
  loadJSON,
} from "./outdoor pakke/utils_lib/utils_lib.js";

async function getWeather(date) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=55.68&longitude=12.34&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&start_date=${date}&end_date=${date}`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const taskArray = JSON.parse(localStorage.getItem("toDoingArray")) || [];
const doneArray = JSON.parse(localStorage.getItem("toDoneArray")) || [];

let filteredArray = [];
let filter = "";
let sort = "";

const taskList = $("#toDoingContainer");
const doneList = $("#toDoneContainer");

$(".createTask").addEventListener("click", createTaskField);
$("#writingTask").addEventListener("submit", (e) => {
  e.preventDefault();
  const fieldset = e.submitter.closest("fieldset");
  createTask(fieldset);
});

function createTaskField() {
  const fieldset = document.createElement("fieldset");
  fieldset.innerHTML = `
    <legend>New Task</legend>
    
    <input type="text" placeholder="Task Title" class="taskText" name="taskText" required/>
    <br>
    <div class="catContainer">
    
    <input type="checkbox" id="outdoorCheck" class="outdoorCheck" name="outdoorCheck" />
    <select name="category">
    <option value="">Catagory</option>
    <option class="Chore" value="Chore">Chore<span class="dot"></span></option>
    <option class="Task" value="Task">Task</option>
    <option class="Homework" value="Homework">Homework</option>
    <option class="Deadline" value="Deadline">Deadline</option>
    </select>
    </div>
    <label for="date">Deadline?</label>
    <input type="date" name="date" />
    <div class="weatherForecast hidden">    
    <p>Expected Weather on day</p>
    <img src="./outdoor pakke/png/cloudy.png">
    </div>
    <div class="outweather hidden">
    <p>Sorry Date is out of our Forecast Window</p></div>
    
    <input type="submit" name="submit" class="submit">
  `;
  fieldset
    .querySelector('[type="date"]')
    .addEventListener("change", async () => {
      let weather = await getWeather(
        fieldset.querySelector('[type="date"]').value,
      );
      if (weather.daily !== undefined) {
        fieldset.querySelector(".weatherForecast").classList.remove("hidden");
        fieldset.querySelector(".outweather").classList.add("hidden");

        fieldset.querySelector("img").src =
          "./outdoor pakke/png/" + wwCodes[weather.daily.weather_code[0]];
      } else {
        fieldset.querySelector(".weatherForecast").classList.add("hidden");
        fieldset.querySelector(".outweather").classList.remove("hidden");
      }
    });
  $("#writingTask").appendChild(fieldset);
}

async function createTask(fieldset) {
  const date = fieldset.querySelector('[name="date"]').value;

  const weather = await getWeather(date);
  let code;
  if (weather.daily !== undefined) {
    code = weather.daily.weather_code[0];
  }

  const badWeather = code !== undefined ? code > 48 : false;

  const task_obj = {
    taskText: fieldset.querySelector(".taskText").value,
    outdoor: fieldset.querySelector(".outdoorCheck").checked,
    date: date,
    category: fieldset.querySelector("select").value,
    taskDone: false,
    badWeather: badWeather,
    weather: wwCodes[code] ? wwCodes[code] : "",
    id: self.crypto.randomUUID(),
  };
  taskArray.unshift(task_obj);
  fieldset.remove();
  localStorage.setItem("toDoingArray", JSON.stringify(taskArray));

  //   console.log("Array is ", taskArray);
  notify("Task Created");

  updateTaskList();
}

//filter
$("#filter").addEventListener("change", filterSel);
function filterSel() {
  filter = $("#filter").value;
  updateTaskList();
}
$("#sort").addEventListener("change", sortSel);
function sortSel() {
  sort = $("#sort").value;
  updateTaskList();
}
function filtering(task) {
  if (filter === "Outdoors") return task.outdoor === true;
  if (filter === "Indoors") return task.outdoor === false;
  if (filter === undefined) return true;
  if (task.category === filter) {
    return true;
  } else {
    return false;
  }
}
function updateTaskList() {
  taskList.innerHTML = "";

  ///Filter and Sort
  console.log(filter);

  filteredArray = filter ? taskArray.filter(filtering) : taskArray;
  if (sort === "Date") {
    filteredArray = filteredArray.toSorted((a, b) =>
      a.date.localeCompare(b.date),
    );
  } else if (sort === "DateDec") {
    filteredArray = filteredArray.toSorted((a, b) =>
      b.date.localeCompare(a.date),
    );
  } else if (sort === "a-z") {
    filteredArray = filteredArray.toSorted((a, b) =>
      a.taskText.localeCompare(b.taskText),
    );
  } else if (sort === "z-a") {
    filteredArray = filteredArray.toSorted((a, b) =>
      b.taskText.localeCompare(a.taskText),
    );
  }
  console.log("The filtered array is: " + filteredArray);

  filteredArray.forEach((task) => {
    const li = document.createElement("li");
    li.innerHTML += `
    <h2 class="taskText">${task.taskText}</h2>
    <p class="weatherIsBad">WARNING WEATHER IS BAD</p>
     <p class="deadlineText">Do By: ${task.date ? task.date : "Whenever"}</p>
     <p class="outdoorText"> ${task.outdoor ? "Outdoors" : "Indoors"}</p>
     ${task.category ? '<h3 class="categoryText ' + task.category + '"> ' + task.category + "</h3>" : ""}
     ${task.outdoor ? '<img src="./outdoor pakke/png/' + task.weather + '" class="weatherImg">' : '<div class="weatherImg indoorWeather"></div>'}
     <input type="checkbox" class="doneCheck">
     <trash>
     <i class="fa-solid fa-trash"></i></trash>
     <dialog>
    <h1>Are You Sure You Want to Delete "${task.taskText}"?</h1>
    <div>
    <button class="no dbtn">No</button> <button class="yes dbtn">Yes</button>
    </div>
    </dialog>

     `;
    //Giver task'en classen badWeather hvis der er dårligt vejr og den foregår udenfor
    if (task.badWeather && task.outdoor) {
      li.classList.add("badWeather");
    }

    //Tilføjer alle de eventlistners tasken skal have inklusivt slette-dialogboksen
    li.querySelector('[type="checkbox"]').addEventListener("click", () =>
      completeTask(task.id),
    );
    li.querySelector("trash").addEventListener("click", () =>
      li.querySelector("dialog").showModal(),
    );
    li.querySelector(".yes").addEventListener("click", () =>
      deleteTask(task.id),
    );
    li.querySelector(".no").addEventListener("click", () =>
      li.querySelector("dialog").close(),
    );

    taskList.appendChild(li);
    // console.log("Array is ", taskArray);
    // console.log("Done Array is ", doneArray);
  });

  ///////////
  doneList.innerHTML = "";
  doneArray.forEach((task) => {
    const li = document.createElement("li");
    li.innerHTML += `
    <h2 class="taskText">${task.taskText}</h2>
        <p class="weatherIsBad">WARNING WEATHER IS BAD</p>

     <p class="deadlineText">Do By: ${task.date ? task.date : "Whenever"}</p>
     <p class="outdoorText"> ${task.outdoor ? "Outdoors" : "Indoors"}</p>
     ${task.category ? '<h3 class="categoryText ' + task.category + '"> ' + task.category + "</h3>" : ""}
     ${task.outdoor ? '<img src="./outdoor pakke/png/' + task.weather + '" class="weatherImg">' : '<div class="weatherImg indoorWeather"></div>'}
     <input type="checkbox" checked class="doneCheck">
     <trash><i class="fa-solid fa-trash"></i></trash>
    <dialog>
    <h1>Are You Sure You Want to Delete "${task.taskText}"?</h1>
    <div>
    <button class="no dbtn">No</button> <button class="yes dbtn">Yes</button>
    </div>
    </dialog>

     <span class="completedSticker">Completed</span>

     `;
    if (task.badWeather && task.outdoor) {
      li.classList.add("badWeather");
    }
    li.querySelector('[type="checkbox"]').addEventListener("click", () =>
      uncompleteTask(task.id),
    );
    li.querySelector("trash").addEventListener("click", () =>
      li.querySelector("dialog").showModal(),
    );
    li.querySelector(".yes").addEventListener("click", () =>
      deleteTask(task.id),
    );
    li.querySelector(".no").addEventListener("click", () =>
      li.querySelector("dialog").close(),
    );

    doneList.appendChild(li);
  });
  //   if (window.FontAwesome) {
  //     window.FontAwesome.dom.i2svg();
  //   }

  updateStats();
}
updateTaskList();

////CONTROLLER/////

//Finder tasken der er blevet markeret som færdig vha dens id og splicer den ud,
//sætter dens taskDone værdi til true og pusher dernest den til doneArray'et
//opdaterer begge localstorage arrays
//og "renderer" (den jeg kalder updateTaskList()) begge lister på ny
function completeTask(id) {
  const index = taskArray.findIndex((t) => t.id === id);
  if (index === -1) return;

  const [task] = taskArray.splice(index, 1);
  task.taskDone = true;
  doneArray.unshift(task);

  localStorage.setItem("toDoingArray", JSON.stringify(taskArray));
  localStorage.setItem("toDoneArray", JSON.stringify(doneArray));
  notify("Task Completed");
  console.log("task completed");
  updateTaskList();
}
//Gør det samme som foroven bare modsatte retning med done -> tasklist
function uncompleteTask(id) {
  const index = doneArray.findIndex((t) => t.id === id);
  if (index === -1) return;

  const [task] = doneArray.splice(index, 1); // remove from taskArray, get the task itself
  task.taskDone = false;
  taskArray.unshift(task);

  localStorage.setItem("toDoingArray", JSON.stringify(taskArray));
  localStorage.setItem("toDoneArray", JSON.stringify(doneArray));
  notify("Task Uncompleted");
  console.log("task uncompleted");
  updateTaskList();
}

//Sletter tasken, den finder den på samme måde som foroven
function deleteTask(id) {
  let index = taskArray.findIndex((t) => t.id === id);
  if (index !== -1) {
    taskArray.splice(index, 1);
    localStorage.setItem("toDoingArray", JSON.stringify(taskArray));
  } else {
    index = doneArray.findIndex((t) => t.id === id);
    if (index === -1) return;
    doneArray.splice(index, 1);
    localStorage.setItem("toDoneArray", JSON.stringify(doneArray));
  }
  notify("Task Deleted");
  updateTaskList();
}

////
document.querySelectorAll(".accordion").forEach((accordion) => {
  accordion.addEventListener("click", function () {
    this.classList.toggle("active");
    let panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
});

////
/////NOTIFICATION/////

function notify(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerHTML = `<p>${message}</p>`;
  document.body.appendChild(notification);
  notification.addEventListener("animationend", () => notification.remove());
}

////////////////////
/////Statistics/////

function updateStats() {
  $("#completedStat").innerHTML = doneArray.length;
  $("#todoStat").innerHTML = taskArray.length;

  const currentFilter = filter;

  filter = "";
  $("#unStat").style.width =
    (doneArray.filter(filtering).length / doneArray.length) * 100 + "%";

  filter = "Homework";
  $("#homeStat").style.width =
    (doneArray.filter(filtering).length / doneArray.length) * 100 + "%";

  filter = "Chore";
  $("#choreStat").style.width =
    (doneArray.filter(filtering).length / doneArray.length) * 100 + "%";

  filter = "Deadline";
  $("#deadStat").style.width =
    (doneArray.filter(filtering).length / doneArray.length) * 100 + "%";

  filter = "Task";
  $("#taskStat").style.width =
    (doneArray.filter(filtering).length / doneArray.length) * 100 + "%";

  filter = currentFilter;
}

updateStats();

//////////////////////

const wwCodes = {
  0: "clearsky_day.png",
  1: "fair_day.png",
  2: "partlycloudy_day.png",
  3: "cloudy.png",
  45: "fog.png",
  48: "fog.png",
  // it's raining again👇🏼
  51: "lightrain.png",
  53: "lightrain.png",
  55: "lightrain.png",
  56: "lightsleet.png",
  57: "lightsleet.png",
  61: "lightrain.png",
  63: "rain.png",
  65: "heavyrain.png",
  66: "lightsleet.png",
  67: "lightsleet.png",
  71: "lightsnow.png",
  73: "snow.png",
  75: "heavysnow.png",
  77: "lightsnow.png",
  80: "lightrainshowers_day.png",
  81: "rainshowers_day.png",
  82: "heavyrainshowers_day.png",
  85: "lightsnowshowers_day.png",
  86: "heavysnowshowers_day.png",
  95: "rainandthunder.png",
};
