let academies = JSON.parse(localStorage.getItem("academies")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let deadlineSorted = false;

const $ = (id) => document.getElementById(id);

function saveData() {
  localStorage.setItem("academies", JSON.stringify(academies));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addAcademy() {
  const name = $("academyName").value.trim();
  const subject = $("academySubject").value.trim();
  const day = $("academyDay").value.trim();
  const memo = $("academyMemo").value.trim();

  if (!name || !subject) {
    alert("학원 이름과 과목을 입력하세요.");
    return;
  }

  academies.push({
    id: Date.now(),
    name,
    subject,
    day,
    memo
  });

  saveData();
  $("academyName").value = "";
  $("academySubject").value = "";
  $("academyDay").value = "";
  $("academyMemo").value = "";

  renderAcademyOptions();
  renderProgress();
}

function renderAcademyOptions() {
  $("taskAcademy").innerHTML = "";
  $("filterAcademy").innerHTML = `<option value="all">전체 학원</option>`;

  academies.forEach((academy) => {
    const text = `${academy.name} - ${academy.subject}`;

    const option1 = document.createElement("option");
    option1.value = academy.id;
    option1.textContent = text;
    $("taskAcademy").appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = academy.id;
    option2.textContent = text;
    $("filterAcademy").appendChild(option2);
  });
}

function addTask() {
  const date = $("taskDate").value;
  const academyId = $("taskAcademy").value;
  const subject = $("taskSubject").value.trim();
  const content = $("taskContent").value.trim();
  const deadline = $("taskDeadline").value;
  const progress = Number($("taskProgress").value);
  const done = $("taskDone").checked;

  if (!date || !academyId || !subject || !content || !deadline) {
    alert("과제 정보를 모두 입력하세요.");
    return;
  }

  tasks.push({
    id: Date.now(),
    date,
    academyId,
    subject,
    content,
    deadline,
    progress: done ? 100 : progress,
    done: done || progress === 100
  });

  saveData();

  $("taskDate").value = "";
  $("taskSubject").value = "";
  $("taskContent").value = "";
  $("taskDeadline").value = "";
  $("taskProgress").value = "0";
  $("taskDone").checked = false;

  renderTasks();
  renderProgress();
}

function getAcademyName(id) {
  const academy = academies.find((a) => String(a.id) === String(id));
  return academy ? academy.name : "삭제된 학원";
}

function renderTasks() {
  const filterAcademy = $("filterAcademy").value;
  const filterSubject = $("filterSubject").value.trim();
  const filterStatus = $("filterStatus").value;

  let filtered = [...tasks];

  if (filterAcademy !== "all") {
    filtered = filtered.filter((task) => String(task.academyId) === String(filterAcademy));
  }

  if (filterSubject) {
    filtered = filtered.filter((task) => task.subject.includes(filterSubject));
  }

  if (filterStatus === "done") {
    filtered = filtered.filter((task) => task.done);
  }

  if (filterStatus === "notDone") {
    filtered = filtered.filter((task) => !task.done);
  }

  if (deadlineSorted) {
    filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  $("taskList").innerHTML = "";

  if (filtered.length === 0) {
    $("taskList").innerHTML = "<p>등록된 과제가 없습니다.</p>";
    return;
  }

  filtered.forEach((task) => {
    const div = document.createElement("div");
    div.className = task.done ? "task done" : "task";

    div.innerHTML = `
      <h3>${getAcademyName(task.academyId)} / ${task.subject}</h3>
      <p><strong>입력 날짜:</strong> ${task.date}</p>
      <p><strong>과제:</strong> ${task.content}</p>
      <p><strong>마감일:</strong> ${task.deadline}</p>
      <p><strong>수행률:</strong> ${task.progress}%</p>
      <p><strong>상태:</strong> ${task.done ? "완료" : "미완료"}</p>
      <div class="task-actions">
        <button onclick="editTask(${task.id})">수정</button>
        <button class="delete" onclick="deleteTask(${task.id})">삭제</button>
      </div>
    `;

    $("taskList").appendChild(div);
  });
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);

  const newContent = prompt("과제 내용을 수정하세요.", task.content);
  if (newContent === null || newContent.trim() === "") return;

  const newProgress = Number(
    prompt("수행률을 입력하세요. 0, 25, 50, 75, 100 중 하나", task.progress)
  );

  if (![0, 25, 50, 75, 100].includes(newProgress)) {
    alert("수행률은 0, 25, 50, 75, 100 중 하나여야 합니다.");
    return;
  }

  task.content = newContent.trim();
  task.progress = newProgress;
  task.done = newProgress === 100;

  saveData();
  renderTasks();
  renderProgress();
}

function deleteTask(id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  tasks = tasks.filter((task) => task.id !== id);
  saveData();
  renderTasks();
  renderProgress();
}

function renderProgress() {
  if (tasks.length === 0) {
    $("totalProgress").textContent = "0%";
    $("remainingTasks").textContent = "0개";
    $("academyProgress").innerHTML = "";
    return;
  }

  const total = Math.round(
    tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
  );

  const remaining = tasks.filter((task) => !task.done).length;

  $("totalProgress").textContent = `${total}%`;
  $("remainingTasks").textContent = `${remaining}개`;

  $("academyProgress").innerHTML = "<h3>학원별 완료율</h3>";

  academies.forEach((academy) => {
    const academyTasks = tasks.filter(
      (task) => String(task.academyId) === String(academy.id)
    );

    if (academyTasks.length > 0) {
      const rate = Math.round(
        academyTasks.reduce((sum, task) => sum + task.progress, 0) /
          academyTasks.length
      );

      const p = document.createElement("p");
      p.textContent = `${academy.name}: ${rate}%`;
      $("academyProgress").appendChild(p);
    }
  });
}

$("addAcademyBtn").addEventListener("click", addAcademy);
$("addTaskBtn").addEventListener("click", addTask);
$("filterAcademy").addEventListener("change", renderTasks);
$("filterSubject").addEventListener("input", renderTasks);
$("filterStatus").addEventListener("change", renderTasks);

$("sortDeadlineBtn").addEventListener("click", () => {
  deadlineSorted = !deadlineSorted;
  renderTasks();
});

renderAcademyOptions();
renderTasks();
renderProgress();
