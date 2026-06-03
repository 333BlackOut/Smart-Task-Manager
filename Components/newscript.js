const newTaskQuestArray = [];
let allTaskArray = JSON.parse(localStorage.getItem("tasks")) || [];
let editingTaskID = null;

const sections = [
  "dashboard",
  "all-tasks",
  "favourites",
  "in-progress",
  "backlog",
  "completed",
];

const radios = document.querySelectorAll('input[name="task-type"]');
const dynamicField = document.getElementById("dynamic-field");
const newQuestList = document.getElementById("new-quest-list");
const newTaskComponent = document.querySelector(".component-overlay");
const newTaskOpenBtn = document.getElementById("add-task-display");
const newTaskCloseBtn = document.querySelector(".add-task-close-button");
const form = document.querySelector("#task-form");
const addTaskBtn = document.getElementById("add-new-task");
const searchTask = document.getElementById("search-task");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(allTaskArray));
}

function getTaskStats() {
  return {
    total: allTaskArray.length,
    completed: allTaskArray.filter((t) => t.status === "completed").length,
    inProgress: allTaskArray.filter((t) => t.status === "in-progress").length,
    backlog: allTaskArray.filter((t) => t.status === "backlog").length,
  };
}

function updateTaskStatus(task) {
  if (task.type === "text") {
    task.status = task.completed ? "completed" : "backlog";
  } else if (task.type === "list") {
    const completedCount = task.quests.filter((q) => q.completed).length;
    if (completedCount === 0) {
      task.status = "backlog";
    } else if (completedCount === task.quests.length) {
      task.status = "completed";
    } else {
      task.status = "in-progress";
    }
  }
}

function renderTaskInput() {
  const selected = document.querySelector('input[name="task-type"]:checked');
  if (selected.value === "text") {
    dynamicField.innerHTML =
      '<textarea placeholder="Task Description" class="input" id="task-description" required></textarea>';
  } else {
    dynamicField.innerHTML = `
      <div class="flex-row align-center">
        <input type="text" placeholder="Add a New Quest" class="input" id="new-quest" autocomplete="off">
        <button type="button" class="btn" id="add-quest">
          <img src="./Assets/add-plus.svg" alt="">
        </button>
      </div>
      <ul id="new-quest-list"></ul>
    `;
    renderQuestList();
  }
}

function renderQuestList() {
  const listContainer = document.getElementById("new-quest-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  if (newTaskQuestArray.length === 0) {
    listContainer.innerHTML = "<li>No Quests Added</li>";
    return;
  }

  newTaskQuestArray.forEach((quest, index) => {
    const li = document.createElement("li");
    li.className = "flex-row space-between";
    li.innerHTML = `
      ${quest.text} 
      <button type="button" data-index="${index}" class="delete-quest btn">
        <img src="./Assets/close-button-small.svg" alt="">
      </button>
    `;
    listContainer.appendChild(li);
  });
}

function createTaskListCard(task) {
  const taskCard = document.createElement("div");
  taskCard.classList.add("task");

  taskCard.innerHTML = `
    <div class="task-header flex-row align-center">
      ${
        task.type === "text"
          ? `<label class="custom-checkbox"><input type="checkbox" class="text-complete" data-task="${task.id}" ${task.completed ? "checked" : ""}><img src="./Assets/cross-bold-3.svg" class="check-empty" alt="Unchecked">
  <img src="./Assets/check-bold.svg" class="check-filled" alt="Checked"></label>`
          : ""
      }
      <h4>${task.title}</h4>
    </div>
    <span class="star ${task.isFavourite ? "active" : ""}" data-task="${task.id}">
      <img src="./Assets/${task.isFavourite ? "star-filled.png" : "star-notfilled.png"}" class="not-favourite star-icon pointer" alt="">
    </span>
    <p>${task.type === "text" ? task.description : ""}</p>
  `;

  if (task.type === "list") {
    const ul = document.createElement("ul");
    task.quests.forEach((quest, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
          <label class="custom-checkbox"><input type="checkbox" data-task="${task.id}" data-quest="${index}" ${quest.completed ? "checked" : ""}><img src="./Assets/cross-bold-3.svg" class="check-empty" alt="Unchecked">
  <img src="./Assets/check-bold.svg" class="check-filled" alt="Checked">
          ${quest.text}
        </label>
      `;
      ul.appendChild(li);
    });
    taskCard.appendChild(ul);
  }

  const btnContainer = document.createElement("div");
  btnContainer.className = "task-button-container flex-row space-between";
  btnContainer.innerHTML = `
    <button class="edit-task btn" data-task="${task.id}"><img src="./Assets/edit-box-square.svg" alt=""></button>
    <button class="delete-task btn" data-task="${task.id}"><img src="./Assets/delete-bin-notfilled.svg" alt=""></button>
  `;
  taskCard.appendChild(btnContainer);

  return taskCard;
}

function renderTasks(taskArray, sectionSelector) {
  const container = document.querySelector(sectionSelector);
  if (!container) return;
  container.innerHTML = "";

  if (taskArray.length === 0) {
    container.innerHTML = "<h3>No Tasks Added</h3>";
    return;
  }

  taskArray.forEach((task) => {
    container.appendChild(createTaskListCard(task));
  });
}

function renderTasksByStatus(status, containerSelector) {
  const filtered = allTaskArray
    .filter((t) => t.status === status)
    .sort((a, b) => b.createdAt - a.createdAt);
  renderTasks(filtered, containerSelector);
}

function statsDisplay() {
  const display = document.querySelector(".info-container");
  if (!display) return;
  const stats = getTaskStats();
  display.innerHTML = `
    <div class="total">Total: ${stats.total}</div>
    <div class="in-progress">In-Progress: ${stats.inProgress}</div>
    <div class="completed">Completed: ${stats.completed}</div>
    <div class="backlog">Backlog: ${stats.backlog}</div>
  `;
}

function renderAllSections() {
  const sortedAll = [...allTaskArray].sort((a, b) => b.createdAt - a.createdAt);
  const favourites = allTaskArray
    .filter((t) => t.isFavourite)
    .sort((a, b) => b.createdAt - a.createdAt);

  renderTasks(sortedAll, ".all-tasks");
  renderTasks(sortedAll.slice(0, 10), ".recent-tasks");
  renderTasks(favourites, ".favourite-tasks");
  renderTasks(favourites.slice(0, 5), ".fav-tasks");

  renderTasksByStatus("in-progress", ".in-progress-tasks");
  renderTasksByStatus("backlog", ".backlog-tasks");
  renderTasksByStatus("completed", ".completed-tasks");
  statsDisplay();
}

function editTask(taskID) {
  const task = allTaskArray.find((t) => t.id === taskID);
  if (!task) return;

  editingTaskID = taskID;
  document.getElementById("task-title").value = task.title;
  document.querySelector(
    `input[name="task-type"][value="${task.type}"]`,
  ).checked = true;

  renderTaskInput();

  if (task.type === "text") {
    document.getElementById("task-description").value = task.description;
  } else if (task.type === "list") {
    newTaskQuestArray.length = 0;
    task.quests.forEach((q) => newTaskQuestArray.push({ ...q }));
    renderQuestList();
  }

  addTaskBtn.textContent = "Save Task";
  newTaskComponent.classList.remove("hidden");
}

function closeNewTask() {
  newTaskComponent.classList.add("hidden");
}

dynamicField.addEventListener("click", (e) => {
  const addQuestBtn = e.target.closest("#add-quest");
  const deleteQuestBtn = e.target.closest(".delete-quest");

  if (addQuestBtn) {
    const input = document.getElementById("new-quest");
    const questText = input.value.trim();
    if (!questText) return;

    newTaskQuestArray.push({ text: questText, completed: false });
    input.value = "";
    renderQuestList();
  }

  if (deleteQuestBtn) {
    const index = deleteQuestBtn.dataset.index;
    newTaskQuestArray.splice(index, 1);
    renderQuestList();
  }
});

newTaskOpenBtn.addEventListener("click", () => {
  editingTaskID = null;
  form.reset();
  newTaskQuestArray.length = 0;
  renderTaskInput();
  addTaskBtn.textContent = "Add Task";
  newTaskComponent.classList.remove("hidden");
});

newTaskCloseBtn.addEventListener("click", closeNewTask);

newTaskComponent.addEventListener("click", (e) => {
  if (e.target === newTaskComponent) closeNewTask();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.querySelector("#task-title").value.trim();
  const taskType = document.querySelector(
    "input[name='task-type']:checked",
  ).value;

  if (!title) return;
  if (taskType === "list" && newTaskQuestArray.length === 0) {
    alert("Add at least one quest");
    return;
  }

  if (editingTaskID !== null) {
    const task = allTaskArray.find((t) => t.id === editingTaskID);
    task.title = title;
    if (task.type === "text") {
      task.description = document.getElementById("task-description").value;
    } else if (task.type === "list") {
      task.quests = [...newTaskQuestArray];
    }
    updateTaskStatus(task);
    editingTaskID = null;
  } else {
    const newTask = {
      id: Date.now(),
      title: title,
      type: taskType,
      status: "backlog",
      quests: taskType === "list" ? [...newTaskQuestArray] : [],
      description:
        taskType === "text"
          ? document.querySelector("#task-description")?.value || ""
          : "",
      isFavourite: false,
      completed: false,
      createdAt: Date.now(),
    };
    allTaskArray.push(newTask);
  }

  saveTasks();
  closeNewTask();
  newTaskQuestArray.length = 0;
  form.reset();
  renderAllSections();
});

function handleTaskInteraction(e) {
  const star = e.target.closest(".star");
  if (star) {
    const taskID = Number(star.dataset.task);
    const task = allTaskArray.find((t) => t.id === taskID);
    task.isFavourite = !task.isFavourite;
    renderAllSections();
    saveTasks();
    return;
  }

  if (e.target.type === "checkbox") {
    const taskID = Number(e.target.dataset.task);
    const task = allTaskArray.find((t) => t.id === taskID);

    if (e.target.classList.contains("text-complete")) {
      task.completed = e.target.checked;
    } else {
      const questIndex = Number(e.target.dataset.quest);
      task.quests[questIndex].completed = e.target.checked;
    }

    updateTaskStatus(task);
    renderAllSections();
    saveTasks();
    return;
  }

  const deleteBtn = e.target.closest(".delete-task");
  if (deleteBtn) {
    const taskID = Number(deleteBtn.dataset.task);
    if (!confirm("Delete Task?")) return;
    allTaskArray = allTaskArray.filter((t) => t.id !== taskID);
    renderAllSections();
    saveTasks();
    return;
  }

  const editBtn = e.target.closest(".edit-task");
  if (editBtn) {
    const taskID = Number(editBtn.dataset.task);
    editTask(taskID);
  }
}

function showSection(sectionID) {
  sections.forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(sectionID).classList.remove("hidden");
}

document.querySelectorAll("[data-section]").forEach((btn) => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.section);
  });
});

function handleSearch(e) {
  const keyword = e.target.value.toLowerCase();
  showSection("all-tasks");

  const filterTasks = allTaskArray.filter((task) => {
    const titleMatch = task.title.toLowerCase().includes(keyword);
    const descriptionMatch = task.description?.toLowerCase().includes(keyword);
    const questMatch = task.quests?.some((q) =>
      q.text.toLowerCase().includes(keyword),
    );
    return titleMatch || descriptionMatch || questMatch;
  });

  renderTasks(filterTasks, ".all-tasks");

  if (keyword === "") {
    renderAllSections();
    showSection("dashboard");
  }
}

function themeChanger() {
  document.querySelector(".theme-changer").addEventListener("click", () => {
    document
      .querySelector(".theme-toggle")
      .classList.toggle("toggle-theme-changer");
    document.body.classList.toggle("dark-theme");
  });
}

radios.forEach((radio) => radio.addEventListener("change", renderTaskInput));
searchTask.addEventListener("input", handleSearch);
document
  .getElementById("main-container")
  .addEventListener("click", handleTaskInteraction);

renderTaskInput();
renderAllSections();
themeChanger();
