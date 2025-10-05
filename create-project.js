<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create New Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <nav class="dashboard">
            <h2>Dashboard</h2>
            <ul id="menu">
                <li><a href="index.html">Home</a></li>
                <li><a href="#" id="project-plans">Project Plans</a>
                    <ul class="submenu" id="project-list">
                        <!-- Projects populated via JS -->
                    </ul>
                </li>
                <!-- Other menu items... -->
            </ul>
        </nav>
        <main class="main-content">
            <h1>Create New Project</h1>
            <input type="text" id="project-name" placeholder="Project Name">
            <button id="create-project-btn">Create Project</button>
            <div id="new-task-table" style="margin-top: 20px;">
                <h2>Tasks for New Project</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Task #</th>
                            <th>Work Division</th>
                            <th>Start Date</th>
                            <th>Duration</th>
                            <th>Projected Complete Date</th>
                            <th>% Complete</th>
                            <th>Accountable</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Empty initially -->
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>
