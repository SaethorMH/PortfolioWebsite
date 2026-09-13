"use strict";

// <button class="create_task"></button>
// <input type="text" class="task_text" />
// <ul class="tasks"></ul>
const task_input = document.querySelector(".task_text");
const createTask_btn = document.querySelector(".create_task");
const ul_elm = document.querySelector(".tasks");
const task_arr = [];
createTask_btn.addEventListener("click", createTask);

function createTask() {
  console.log("HEJ VERDEN!");

  const task_obj = { taskTxt: task_input.value, taskDone: false, id: self.crypto.randomUUID() };
  //console.log("task_obj", task_obj);
  task_arr.push(task_obj);
  console.log("task_arr", task_arr);
  renderList();
}

function renderList() {
  // vi tømmer ul listen
  ul_elm.innerHTML = "";
  // vi looper igennem vores model (MVC) som er arrayet med vores tasks
  task_arr.forEach((task) => {
    // vi laver et li element
    const li = document.createElement("li");
    // vi adder noget HTML til vores li element
    // task.taskDone ? "checked" : ""  - hvis tasken er done i vores object
    // bliver "checked" sat i vore checkbox og den fremstår checked, hvis den ikke er done,
    // vil der bare være en tom streng og check boksen fremstår unchecked
    // (vi sætter også teksten ind)
    li.innerHTML = `<input type="checkbox" ${task.taskDone ? "checked" : ""}/><p>${task.taskTxt} </p>`;
    // querySelector til checkboxen vi har puttet ind i li ovenfor
    const checkBox = li.querySelector('[type = "checkbox"]');
    // eventlistener på checkboksen
    checkBox.addEventListener("click", (e) => {
      // behøver ikke at være der men er der for at vise en pointe
      e.preventDefault();
      // sæt tasken til det modatte af hvad den er, hvis den er true bliver den false og omvendt
      task.taskDone = !task.taskDone;
      // skriv listen ud igen: checkboksen er opdateret, prøv at udkommentere renderList() og klik på checkboksen?
      // - det er MVC vi: opdaterer modellen, i vores tilfælde arrayet, og så beder vi render om at afspejle dataen i modellen
      renderList();
    });
    ul_elm.appendChild(li);
  });
}
