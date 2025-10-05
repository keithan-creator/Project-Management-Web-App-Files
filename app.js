
document.addEventListener('DOMContentLoaded', () => {
    const projectList = document.getElementById('project-list');
    if (projectList) {
        loadProjects(projectList);
    }

    function loadProjects(listElement) {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        listElement.innerHTML = '';
        if (projects.length === 0) {
            listElement.innerHTML = '<li>No projects yet. Create one!</li>';
            return;
        }
        projects.forEach(project => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = 'project-view.html';
            a.textContent = project.name;
            a.dataset.projectId = project.id;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.setItem('currentProject', project.id);
                window.location.href = 'project-view.html';
            });
            li.appendChild(a);
            listElement.appendChild(li);
        });
    }
});
