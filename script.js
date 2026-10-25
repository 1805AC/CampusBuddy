// CampusBuddy: Main JavaScript file

// Save and load information from this browser.
function loadData(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error("Could not load:", key, error);
        return fallback;
    }
}

function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Could not save:", key, error);
        alert("Your browser could not save the data.");
        return false;
    }
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function formatRupees(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// ----------------------------------
// 1. STUDY PLANNER
// ----------------------------------

let tasks = loadData("campusbuddy_tasks");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach((task) => {
        const item = createElement("li");
        const label = createElement("label", "task-label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const text = createElement(
            "span",
            task.completed ? "completed" : "",
            task.text
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;

            if (saveData("campusbuddy_tasks", tasks)) {
                renderTasks();
                updateDashboard();
            }
        });

        label.append(checkbox, text);

        const deleteButton = createElement(
            "button",
            "delete-button",
            "Delete"
        );

        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((item) => item.id !== task.id);

            if (saveData("campusbuddy_tasks", tasks)) {
                renderTasks();
                updateDashboard();
            }
        });

        item.append(label, deleteButton);
        taskList.appendChild(item);
    });

    if (tasks.length === 0) {
        taskList.appendChild(
            createElement("li", "", "No tasks yet. Add your first task!")
        );
    }
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        return;
    }

    tasks.push({
        id: Date.now() + Math.random(),
        text: text,
        completed: false
    });

    if (saveData("campusbuddy_tasks", tasks)) {
        taskInput.value = "";
        renderTasks();
        updateDashboard();
    }
});


// ----------------------------------
// 2. EXPENSE TRACKER
// ----------------------------------

let expenses = loadData("campusbuddy_expenses");

const expenseForm = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseList = document.getElementById("expenseList");

function getTotalExpenses() {
    return expenses.reduce((total, expense) => {
        return total + expense.amount;
    }, 0);
}

function renderExpenses() {
    expenseList.replaceChildren();

    expenses.forEach((expense) => {
        const item = createElement("li");

        const description = createElement(
            "span",
            "",
            `${expense.name} — ${formatRupees(expense.amount)}`
        );

        const deleteButton = createElement(
            "button",
            "delete-button",
            "Delete"
        );

        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            expenses = expenses.filter((item) => item.id !== expense.id);

            if (saveData("campusbuddy_expenses", expenses)) {
                renderExpenses();
                updateDashboard();
            }
        });

        item.append(description, deleteButton);
        expenseList.appendChild(item);
    });

    if (expenses.length === 0) {
        expenseList.appendChild(
            createElement("li", "", "No expenses added yet.")
        );
    }

    document.getElementById("expenseTotalDetail").textContent =
        formatRupees(getTotalExpenses());
}

expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a name and a valid amount.");
        return;
    }

    expenses.push({
        id: Date.now() + Math.random(),
        name: name,
        amount: amount
    });

    if (saveData("campusbuddy_expenses", expenses)) {
        expenseForm.reset();
        renderExpenses();
        updateDashboard();
    }
});


// ----------------------------------
// 3. NOTES
// ----------------------------------

let notes = loadData("campusbuddy_notes");

const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const noteList = document.getElementById("noteList");

function renderNotes() {
    noteList.replaceChildren();

    notes.forEach((note) => {
        const card = createElement("article", "note-card");

        const title = createElement("h3", "", note.title);
        const content = createElement("p", "", note.content);

        const deleteButton = createElement(
            "button",
            "delete-button",
            "Delete Note"
        );

        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            notes = notes.filter((item) => item.id !== note.id);

            if (saveData("campusbuddy_notes", notes)) {
                renderNotes();
                updateDashboard();
            }
        });

        card.append(title, content, deleteButton);
        noteList.appendChild(card);
    });

    if (notes.length === 0) {
        noteList.appendChild(
            createElement("p", "", "Your saved notes will appear here.")
        );
    }
}

noteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        return;
    }

    notes.push({
        id: Date.now() + Math.random(),
        title: title,
        content: content
    });

    if (saveData("campusbuddy_notes", notes)) {
        noteForm.reset();
        renderNotes();
        updateDashboard();
    }
});


// ----------------------------------
// 4. FOCUS TIMER
// ----------------------------------

const timerDisplay = document.getElementById("timerDisplay");
const timerMessage = document.getElementById("timerMessage");

const startButton = document.getElementById("startTimer");
const pauseButton = document.getElementById("pauseTimer");
const resetButton = document.getElementById("resetTimer");

const FOCUS_SECONDS = 25 * 60;

let remainingSeconds = FOCUS_SECONDS;
let timerInterval = null;
let deadline = null;

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

function pauseTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    deadline = null;
}

function startTimer() {
    if (timerInterval !== null) {
        return;
    }

    if (remainingSeconds <= 0) {
        timerMessage.textContent = "Timer finished! Reset to start again.";
        return;
    }

    deadline = Date.now() + remainingSeconds * 1000;

    timerMessage.textContent = "Stay focused. You can do it!";

    timerInterval = setInterval(() => {
        remainingSeconds = Math.max(
            0,
            Math.ceil((deadline - Date.now()) / 1000)
        );

        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            pauseTimer();
            timerMessage.textContent = "Well done! Your focus session is complete.";
        }
    }, 250);

    updateTimerDisplay();
}

startButton.addEventListener("click", startTimer);

pauseButton.addEventListener("click", () => {
    if (timerInterval !== null && deadline !== null) {
        remainingSeconds = Math.max(
            0,
            Math.ceil((deadline - Date.now()) / 1000)
        );
    }

    pauseTimer();
    updateTimerDisplay();

    timerMessage.textContent = remainingSeconds > 0
        ? "Timer paused."
        : "Timer finished! Reset to start again.";
});

resetButton.addEventListener("click", () => {
    pauseTimer();
    remainingSeconds = FOCUS_SECONDS;
    updateTimerDisplay();
    timerMessage.textContent = "Ready to study?";
});


// ----------------------------------
// 5. DASHBOARD COUNTS
// ----------------------------------

function updateDashboard() {
    document.getElementById("taskCount").textContent = tasks.length;

    document.getElementById("completedCount").textContent =
        tasks.filter((task) => task.completed).length;

    document.getElementById("expenseTotal").textContent =
        formatRupees(getTotalExpenses());

    document.getElementById("noteCount").textContent = notes.length;
}


// ----------------------------------
// 6. INITIALIZE THE WEBSITE
// ----------------------------------

renderTasks();
renderExpenses();
renderNotes();
updateTimerDisplay();
updateDashboard();
