// script.js

document.addEventListener('DOMContentLoaded', () => {

    const projectPlansToggle = document.getElementById('projectPlansToggle');

    const projectList = document.getElementById('projectList');

    const newProjectLink = document.getElementById('newProjectLink');

    const projectContent = document.getElementById('projectContent');

    projectList.classList.remove('active');

    projectPlansToggle.addEventListener('click', (e) => {

        e.preventDefault();

        projectList.classList.toggle('active');

    });

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [

        { id: 1, taskNum: 1, workDivision: 'Setup', task: 'Initial Setup', startDate: '2025-10-01', duration: 5, completeDate: '2025-10-06', percentComplete: 0, accountable: 'Team A', dependencies: [] },

        { id: 2, taskNum: 2, workDivision: 'Build', task: 'Build Phase', startDate: '2025-10-07', duration: 10, completeDate: '2025-10-17', percentComplete: 0, accountable: 'Team B', dependencies: [1] }

    ];

    let currentId = tasks.length + 1;

    let currentEditId = null;

    let currentInsertIndex = null;

    newProjectLink.addEventListener('click', (e) => {

        e.preventDefault();

        loadTaskManagement();

    });

    function loadTaskManagement() {

        projectContent.innerHTML = `

            <h2>Tasks for New Project</h2>

            <div id="task-form" style="display: none;">

                <label>Work Division:</label><input type="text" id="form-workDivision"><br>

                <label>Task:</label><input type="text" id="form-task"><br>

                <label>Start Date:</label><input type="date" id="form-startDate"><br>

                <label>Duration (days):</label><input type="number" id="form-duration"><br>

                <label>% Complete:</label><input type="number" id="form-percentComplete" min="0" max="100"><br>

                <label>Accountable:</label><input type="text" id="form-accountable"><br>

                <label>Dependencies (comma-separated task #s):</label><input type="text" id="form-dependencies"><br>

                <button type="button" id="save-task">Save</button>

                <button type="button" id="cancel-task">Cancel</button>

            </div>

            <table id="task-table">

                <thead>

                    <tr>

                        <th>Task #</th>

                        <th>Work Division</th>

                        <th>Task</th>

                        <th>Start Date</th>

                        <th>Duration</th>

                        <th>Projected Complete Date</th>

                        <th>% Complete</th>

                        <th>Accountable</th>

                        <th>Dependencies</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody id="task-list">

                    <!-- Tasks will be added here -->

                </tbody>

            </table>

            <button id="add-task">Add Task</button>

        `;

        const taskList = document.getElementById('task-list');

        const addTaskBtn = document.getElementById('add-task');

        const saveTaskBtn = document.getElementById('save-task');

        const cancelTaskBtn = document.getElementById('cancel-task');

        addTaskBtn.addEventListener('click', addTask);

        saveTaskBtn.addEventListener('click', saveTask);

        cancelTaskBtn.addEventListener('click', () => {

            document.getElementById('task-form').style.display = 'none';

        });

        document.addEventListener('click', hideTooltips);

        renderTasks(taskList);

    }

    function hideTooltips(e) {

        if (e.target.closest('.tooltip') || e.target.classList.contains('triangle')) {

            return;

        }

        document.querySelectorAll('.tooltip').forEach(t => t.style.display = 'none');

    }

    function renderTasks(taskList) {

        taskList.innerHTML = '';

        tasks.forEach((task, index) => {

            const row = document.createElement('tr');

            row.setAttribute('data-id', task.id);

            row.setAttribute('draggable', true);

            row.innerHTML = `

                <td>${task.taskNum}</td>

                <td>${task.workDivision}</td>

                <td>${task.task}</td>

                <td>${task.startDate}</td>

                <td>${task.duration}</td>

                <td>${task.completeDate}</td>

                <td>${task.percentComplete}</td>

                <td>${task.accountable}</td>

                <td>${task.dependencies.map(id => {

                    const depTask = tasks.find(t => t.id === id);

                    return depTask ? depTask.taskNum : id;

                }).join(', ')}</td>

                <td>

                    <button onclick="editTask(${task.id})">Edit</button>

                    <button onclick="deleteTask(${task.id})">Delete</button>

                </td>

            `;

            taskList.appendChild(row);

            // Add drag and drop events

            row.addEventListener('dragstart', dragStart);

            row.addEventListener('dragover', dragOver);

            row.addEventListener('drop', drop);

            row.addEventListener('dragend', dragEnd);

            // Add divider for insert control between rows

            if (index < tasks.length - 1) {

                const dividerRow = document.createElement('tr');

                dividerRow.classList.add('divider-row');

                const dividerTd = document.createElement('td');

                dividerTd.colSpan = 10;

                dividerTd.style.height = '10px';

                dividerTd.style.position = 'relative';

                dividerTd.style.background = 'transparent';

                dividerTd.innerHTML = `

                    <div class="divider">

                        <div class="triangle" onclick="showInsertMenu(${task.id})"></div>

                    </div>

                    <div class="tooltip" id="tooltip-${task.id}">

                        <ul>

                            <li><a onclick="insertTaskHere(${task.id})">Insert Task</a></li>

                            <li><a onclick="insertSubtaskHere(${task.id})">Insert Subtask</a></li>

                        </ul>

                    </div>

                `;

                dividerRow.appendChild(dividerTd);

                taskList.appendChild(dividerRow);

            }

        });

        saveTasks();

    }

    function addTask() {

        currentEditId = null;

        currentInsertIndex = tasks.length;

        clearForm();

        document.getElementById('task-form').style.display = 'block';

    }

    window.editTask = function(id) {

        currentEditId = id;

        currentInsertIndex = null;

        const task = tasks.find(t => t.id === id);

        document.getElementById('form-workDivision').value = task.workDivision;

        document.getElementById('form-task').value = task.task;

        document.getElementById('form-startDate').value = task.startDate;

        document.getElementById('form-duration').value = task.duration;

        document.getElementById('form-percentComplete').value = task.percentComplete;

        document.getElementById('form-accountable').value = task.accountable;

        document.getElementById('form-dependencies').value = task.dependencies.map(depId => {

            const depTask = tasks.find(t => t.id === depId);

            return depTask ? depTask.taskNum : '';

        }).filter(num => num !== '').join(', ');

        document.getElementById('task-form').style.display = 'block';

    };

    window.deleteTask = function(id) {

        tasks = tasks.filter(t => t.id !== id);

        tasks.forEach((t, idx) => t.taskNum = idx + 1);

        const taskList = document.getElementById('task-list');

        renderTasks(taskList);

    };

    function clearForm() {

        document.getElementById('form-workDivision').value = '';

        document.getElementById('form-task').value = '';

        document.getElementById('form-startDate').value = '';

        document.getElementById('form-duration').value = '';

        document.getElementById('form-percentComplete').value = '0';

        document.getElementById('form-accountable').value = '';

        document.getElementById('form-dependencies').value = '';

    }

    function saveTask() {

        const depsInput = document.getElementById('form-dependencies').value.split(',').map(d => d.trim()).filter(d => d);

        const depIds = depsInput.map(num => {

            const t = tasks.find(t => t.taskNum == num);

            return t ? t.id : null;

        }).filter(id => id !== null);

        const taskData = {

            workDivision: document.getElementById('form-workDivision').value,

            task: document.getElementById('form-task').value,

            startDate: document.getElementById('form-startDate').value,

            duration: parseInt(document.getElementById('form-duration').value) || 0,

            percentComplete: parseInt(document.getElementById('form-percentComplete').value) || 0,

            accountable: document.getElementById('form-accountable').value,

            dependencies: depIds

        };

        let completeDate = '';

        if (taskData.startDate && taskData.duration > 0) {

            const start = new Date(taskData.startDate);

            const end = new Date(start);

            end.setDate(end.getDate() + taskData.duration);

            completeDate = end.toISOString().split('T')[0];

        }

        taskData.completeDate = completeDate;

        if (currentEditId === null) {

            taskData.id = currentId++;

            tasks.splice(currentInsertIndex, 0, taskData);

        } else {

            const task = tasks.find(t => t.id === currentEditId);

            Object.assign(task, taskData);

        }

        tasks.forEach((t, idx) => t.taskNum = idx + 1);

        document.getElementById('task-form').style.display = 'none';

        const taskList = document.getElementById('task-list');

        renderTasks(taskList);

    }

    function saveTasks() {

        localStorage.setItem('tasks', JSON.stringify(tasks));

    }

    // Drag and drop functions

    let draggedRow = null;

    function dragStart(e) {

        draggedRow = this;

        e.dataTransfer.effectAllowed = 'move';

    }

    function dragOver(e) {

        e.preventDefault();

        e.dataTransfer.dropEffect = 'move';

    }

    function drop(e) {

        e.preventDefault();

        if (this !== draggedRow && this.tagName === 'TR' && this.getAttribute('draggable')) {

            const allRows = Array.from(document.querySelectorAll('#task-list tr[data-id]'));

            const draggedIndex = allRows.indexOf(draggedRow);

            const targetIndex = allRows.indexOf(this);

            if (validateReorder(draggedIndex, targetIndex)) {

                tasks.splice(targetIndex, 0, tasks.splice(draggedIndex, 1)[0]);

                tasks.forEach((t, idx) => t.taskNum = idx + 1);

                const taskList = document.getElementById('task-list');

                renderTasks(taskList);

            } else {

                alert('Invalid reorder due to dependencies.');

            }

        }

    }

    function dragEnd() {

        draggedRow = null;

    }

    function validateReorder(fromIndex, toIndex) {

        let newTasks = [...tasks];

        newTasks.splice(toIndex, 0, newTasks.splice(fromIndex, 1)[0]);

        for (let i = 0; i < newTasks.length; i++) {

            for (let depId of newTasks[i].dependencies) {

                const depIndex = newTasks.findIndex(t => t.id === depId);

                if (depIndex === -1 || depIndex >= i) {

                    return false;

                }

            }

        }

        return true;

    }

    window.showInsertMenu = function(id) {

        const tooltip = document.getElementById(`tooltip-${id}`);

        tooltip.style.display = 'block';

    };

    window.insertTaskHere = function(afterId) {

        currentEditId = null;

        currentInsertIndex = tasks.findIndex(t => t.id === afterId) + 1;

        clearForm();

        document.getElementById('task-form').style.display = 'block';

        document.querySelectorAll('.tooltip').forEach(t => t.style.display = 'none');

    };

    window.insertSubtaskHere = function(afterId) {

        // Placeholder for insert subtask under afterId

        alert(`Insert Subtask under task ${afterId}`);

        document.querySelectorAll('.tooltip').forEach(t => t.style.display = 'none');

    };

});