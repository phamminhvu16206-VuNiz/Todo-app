const STORAGE_KEY = "todo-app-tasks";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const taskCount = document.querySelector("#task-count");
const progressValue = document.querySelector("#progress-value");
const progressRing = document.querySelector(".ring-progress");
const clearCompleted = document.querySelector("#clear-completed");
const dateElement = document.querySelector("#current-date");
const filterButtons = document.querySelectorAll(".filter-tab");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
    createdAt: Date.now()
  };
}

function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.completed);
  if (currentFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function render() {
  const visibleTasks = getVisibleTasks();
  list.innerHTML = "";

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `todo-item${task.completed ? " completed" : ""}`;
    item.dataset.id = task.id;
    item.innerHTML = `
      <button class="todo-check" type="button" aria-label="${task.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}"></button>
      <span class="todo-text"></span>
      <button class="delete-button" type="button" aria-label="Xóa công việc">&times;</button>
    `;
    item.querySelector(".todo-text").textContent = task.text;
    list.appendChild(item);
  });

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingCount = totalCount - completedCount;

  taskCount.textContent = `${remainingCount} công việc${remainingCount === 1 ? "" : ""} còn lại`;
  progressValue.textContent = `${progress}%`;
  progressRing.style.strokeDashoffset = `${113 - (113 * progress) / 100}`;
  emptyState.hidden = visibleTasks.length > 0;

  if (!totalCount) {
    emptyTitle.textContent = "Chưa có công việc nào";
    emptyDescription.textContent = "Thêm một việc cần làm để bắt đầu ngày mới.";
  } else if (!visibleTasks.length) {
    emptyTitle.textContent = currentFilter === "completed" ? "Chưa có việc đã xong" : "Bạn đã hoàn thành mọi việc";
    emptyDescription.textContent = currentFilter === "completed" ? "Những việc hoàn thành sẽ xuất hiện ở đây." : "Một khoảng trống tuyệt vời để nghỉ ngơi.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  tasks.unshift(createTask(text));
  saveTasks();
  input.value = "";
  render();
  input.focus();
});

list.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const task = tasks.find((currentTask) => currentTask.id === item.dataset.id);
  if (!task) return;

  if (event.target.closest(".todo-check")) {
    task.completed = !task.completed;
  } else if (event.target.closest(".delete-button")) {
    tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
  }

  saveTasks();
  render();
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-selected", isActive);
    });
    render();
  });
});

dateElement.textContent = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "numeric",
  month: "numeric"
}).format(new Date());

render();
