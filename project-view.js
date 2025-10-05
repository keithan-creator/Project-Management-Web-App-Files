
document.addEventListener('DOMContentLoaded', () => {
    const currentProjectId = localStorage.getItem('currentProject');
    if (!currentProjectId) {
        window.location.href = 'index.html';
        return;
    }

    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === currentProjectId);
    if (project) {
        document.getElementById('project-title').textContent = project.name;
        document.getElementById('view-title').textContent = `${project.name} Tasks`;
    }

    let tasks = project ? project.tasks : [];
    const tbody = document.getElementById('task-tbody');
    const form = document.getElementById('add-task-form');

    function renderTasks() {
        tbody.innerHTML = '';
        tasks.forEach((task, index) => {
            const row = tbody.insertRow();
            row.className = 'task-row';
            row.draggable = true;
            row.dataset.taskId = task.id;

            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).textContent = task.workDivision;
            row.insertCell(2).textContent = task.startDate;
            row.insertCell(3).textContent = task.duration;
            const completeDate = new Date(task.startDate);
            completeDate.setDate(completeDate.getDate() + parseInt(task.duration));
            row.insertCell(4).textContent = completeDate.toISOString().split('T')[0];
            row.insertCell(5).textContent = `${task.percentComplete}%`;
            row.insertCell(6).textContent = task.accountable;

            const depCell = row.insertCell(7);
            if (task.dependencies && task.dependencies.length > 0) {
                depCell.innerHTML = task.dependencies.map(d => `<span class="dependency">#${d}</span>`).join(', ');
            }

            const actionCell = row.insertCell(8);
            actionCell.innerHTML = `
                <button onclick="editTask(${task.id})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
                <button onclick="linkDependency(${task.id})">Link Dep</button>
            `;
        });
        project.tasks = tasks;
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now().toString(),
            workDivision: document.getElementById('work-division').value,
            startDate: document.getElementById('start-date').value,
            duration: document.getElementById('duration').value,
            percentComplete: document.getElementById('percent-complete').value,
            accountable: document.getElementById('accountable').value,
            dependencies: []
        };
        tasks.push(newTask);
        form.reset();
        renderTasks();
    });

    tbody.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    });
    tbody.addEventListener('dragover', (e) => e.preventDefault());
    tbody.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedIndex = tasks.findIndex(t => t.id === draggedId);
        const targetRow = e.target.closest('tr');
        if (targetRow) {
            const targetIndex = Array.from(tbody.rows).indexOf(targetRow);
            if (validateReorder(draggedIndex, targetIndex)) {
                [tasks[draggedIndex], tasks[targetIndex]] = [tasks[targetIndex], tasks[draggedIndex]];
                renderTasks();
            } else {
                alert('Cannot reorder: Dependency violation!');
            }
        }
    });

    window.linkDependency = (taskId) => {
        const depTaskNum = prompt('Enter dependency task # (e.g., 1):');
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        const depIndex = parseInt(depTaskNum) - 1;
        if (depIndex >= 0 && depIndex < tasks.length && depIndex !== taskIndex) {
            if (!hasCycle(taskIndex, depIndex)) {
                if (!tasks[taskIndex].dependencies) tasks[taskIndex].dependencies = [];
                tasks[taskIndex].dependencies.push(depIndex + 1);
                renderTasks();
            } else {
                alert('Cannot link: Would create a cycle!');
            }
        }
    };

    function validateReorder(fromIndex, toIndex) {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].dependencies) {
                tasks[i].dependencies.forEach(depNum => {
                    const depIndex = depNum - 1;
                    if ((fromIndex === depIndex && toIndex > i) || (fromIndex === i && toIndex === depIndex)) {
                        return false;
                    }
                });
            }
        }
        return true;
    }

    function hasCycle(taskIndex, depIndex) {
        const visited = new Set();
        function checkCycle(idx) {
            visited.add(idx);
            if (tasks[idx].dependencies) {
                for (let d of tasks[idx].dependencies) {
                    const dIdx = d - 1;
                    if (dIdx === depIndex || (visited.has(dIdx) && checkCycle(dIdx))) return true;
                }
            }
            visited.delete(idx);
            return false;
        }
        return checkCycle(taskIndex);
    }

    window.editTask = (id) => alert(`Edit task ${id} (implement modal)`);
    window.deleteTask = (id) => {
        if (confirm('Delete?')) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }
    };

    renderTasks();
});
