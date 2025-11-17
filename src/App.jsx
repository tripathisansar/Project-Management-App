import { useEffect, useMemo, useState } from 'react';

const ROLES = ['Admin', 'PM', 'Editor'];
const STORAGE_KEY = 'pma-react-data';

const defaultData = {
  users: [
    { id: 'u-admin', name: 'Alice Admin', role: 'Admin' },
    { id: 'u-pm', name: 'Patrick PM', role: 'PM' },
    { id: 'u-editor', name: 'Eden Editor', role: 'Editor' },
  ],
  projects: [],
};

function usePersistentData() {
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.warn('Failed to parse cached data, resetting.', error);
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return [data, setData];
}

function Panel({ title, children, accent = 'neutral' }) {
  return (
    <section className={`panel panel-${accent}`}>
      <header className="panel__header">
        <h2>{title}</h2>
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}

function SummaryBadges({ projects, users }) {
  const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const completedTasks = projects.reduce(
    (sum, project) => sum + project.tasks.filter((task) => task.completed).length,
    0
  );

  return (
    <div className="summary">
      <div className="summary__badge">
        <span className="summary__label">Users</span>
        <strong>{users.length}</strong>
      </div>
      <div className="summary__badge">
        <span className="summary__label">Projects</span>
        <strong>{projects.length}</strong>
      </div>
      <div className="summary__badge">
        <span className="summary__label">Tasks</span>
        <strong>{completedTasks}/{totalTasks}</strong>
      </div>
    </div>
  );
}

function ProjectCard({ project, users, onTaskToggle, onLogTime }) {
  return (
    <article className="project">
      <div className="project__header">
        <div>
          <p className="eyebrow">Project</p>
          <h3>{project.name}</h3>
          <p className="muted">{project.description || 'No description yet.'}</p>
        </div>
        <span className="chip chip-soft">{project.tasks.length} tasks</span>
      </div>
      <div className="tasks">
        {project.tasks.map((task) => {
          const editor = users.find((u) => u.id === task.editorId);
          const totalMinutes = task.timeLog?.reduce((sum, entry) => sum + entry.minutes, 0) || 0;
          return (
            <div key={task.id} className="task">
              <div>
                <p className="eyebrow">Task</p>
                <h4>{task.title}</h4>
                <p className="muted">{editor ? `Assigned to ${editor.name}` : 'Unassigned'}</p>
                <p className="muted">{totalMinutes} min logged</p>
                {task.timeLog?.length ? (
                  <details className="time-log">
                    <summary>View time entries</summary>
                    <ul>
                      {task.timeLog.map((entry) => (
                        <li key={entry.id}>
                          <span>{entry.minutes} min</span>
                          {entry.note ? <span className="muted"> — {entry.note}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
              <div className="task__actions">
                <div className="toggles">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={task.started}
                      onChange={(e) => onTaskToggle(project.id, task.id, 'started', e.target.checked)}
                    />
                    <span>Started</span>
                  </label>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) =>
                        onTaskToggle(project.id, task.id, 'completed', e.target.checked)
                      }
                    />
                    <span>Completed</span>
                  </label>
                </div>
                <TimeLogger task={task} onLog={(minutes, note) => onLogTime(project.id, task.id, minutes, note)} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function TimeLogger({ task, onLog }) {
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = Number(minutes);
    if (!parsed || parsed <= 0) return;
    onLog(parsed, note.trim());
    setMinutes('');
    setNote('');
  };

  return (
    <form className="time-form" onSubmit={handleSubmit}>
      <label>
        Minutes
        <input
          type="number"
          min="1"
          step="1"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          required
        />
      </label>
      <label>
        Note (optional)
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was done?"
        />
      </label>
      <button type="submit" className="btn">Log time</button>
      <p className="muted tiny">{task.timeLog?.length || 0} entries</p>
    </form>
  );
}

function App() {
  const [data, setData] = usePersistentData();
  const [selectedUserId, setSelectedUserId] = useState(() => data.users[0]?.id);
  const [newUser, setNewUser] = useState({ name: '', role: 'Editor' });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    tasks: [{ id: crypto.randomUUID(), title: '', editorId: '' }],
  });

  useEffect(() => {
    if (!data.users.find((u) => u.id === selectedUserId) && data.users.length) {
      setSelectedUserId(data.users[0].id);
    }
  }, [data.users, selectedUserId]);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === selectedUserId) ?? data.users[0],
    [data.users, selectedUserId]
  );

  const editors = data.users.filter((user) => user.role === 'Editor');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name.trim()) return;
    setData((prev) => ({
      ...prev,
      users: [...prev.users, { ...newUser, id: crypto.randomUUID() }],
    }));
    setNewUser({ name: '', role: 'Editor' });
  };

  const handleRemoveUser = (userId) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== userId),
      projects: prev.projects.map((project) => ({
        ...project,
        tasks: project.tasks.map((task) =>
          task.editorId === userId ? { ...task, editorId: '' } : task
        ),
      })),
    }));
  };

  const handleProjectTaskChange = (taskId, field, value) => {
    setNewProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, [field]: value } : task)),
    }));
  };

  const addTaskRow = () => {
    setNewProject((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: crypto.randomUUID(), title: '', editorId: '' }],
    }));
  };

  const removeTaskRow = (taskId) => {
    setNewProject((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.tasks.length) return;
    const preparedTasks = newProject.tasks
      .filter((task) => task.title.trim())
      .map((task) => ({
        ...task,
        started: false,
        completed: false,
        timeLog: [],
      }));

    if (!preparedTasks.length) return;

    const project = {
      id: crypto.randomUUID(),
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      tasks: preparedTasks,
    };

    setData((prev) => ({ ...prev, projects: [...prev.projects, project] }));
    setNewProject({ name: '', description: '', tasks: [{ id: crypto.randomUUID(), title: '', editorId: '' }] });
  };

  const updateTask = (projectId, taskId, updater) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          tasks: project.tasks.map((task) => (task.id === taskId ? updater(task) : task)),
        };
      }),
    }));
  };

  const handleTaskToggle = (projectId, taskId, field, value) => {
    updateTask(projectId, taskId, (task) => ({ ...task, [field]: value }));
  };

  const handleLogTime = (projectId, taskId, minutes, note) => {
    updateTask(projectId, taskId, (task) => ({
      ...task,
      timeLog: [
        ...task.timeLog,
        {
          id: crypto.randomUUID(),
          minutes,
          note,
        },
      ],
    }));
  };

  const editorTasks = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Editor') return [];
    return data.projects
      .flatMap((project) =>
        project.tasks
          .filter((task) => task.editorId === currentUser.id)
          .map((task) => ({
            ...task,
            projectName: project.name,
            projectId: project.id,
          }))
      );
  }, [currentUser, data.projects]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Role-aware dashboard</p>
          <h1>Project Management Workspace</h1>
          <p className="muted">Track users, projects, tasks, and time for your video team.</p>
        </div>
        <div className="user-switcher">
          <label htmlFor="user-select">View as</label>
          <select
            id="user-select"
            value={currentUser?.id || ''}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {data.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>
      </header>

      <SummaryBadges projects={data.projects} users={data.users} />

      <div className="layout">
        {(currentUser?.role === 'Admin' || currentUser?.role === 'PM') && (
          <Panel title="Project Manager" accent="blue">
            <form className="form" onSubmit={handleCreateProject}>
              <div className="form__row">
                <label>
                  Project name
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Description
                  <input
                    type="text"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Optional"
                  />
                </label>
              </div>
              <div className="task-builder">
                <div className="task-builder__header">
                  <h4>Tasks</h4>
                  <button type="button" className="btn ghost" onClick={addTaskRow}>Add task</button>
                </div>
                {newProject.tasks.map((task) => (
                  <div key={task.id} className="task-builder__row">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleProjectTaskChange(task.id, 'title', e.target.value)}
                      placeholder="Task title"
                      required
                    />
                    <select
                      value={task.editorId}
                      onChange={(e) => handleProjectTaskChange(task.id, 'editorId', e.target.value)}
                    >
                      <option value="">Assign editor</option>
                      {editors.map((editor) => (
                        <option key={editor.id} value={editor.id}>{editor.name}</option>
                      ))}
                    </select>
                    {newProject.tasks.length > 1 && (
                      <button type="button" className="btn danger ghost" onClick={() => removeTaskRow(task.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="form__footer">
                <button type="submit" className="btn">Create project</button>
              </div>
            </form>
          </Panel>
        )}

        {currentUser?.role === 'Admin' && (
          <Panel title="Admin" accent="purple">
            <form className="form" onSubmit={handleAddUser}>
              <div className="form__row">
                <label>
                  Name
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Role
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>
                <button className="btn" type="submit">Add user</button>
              </div>
            </form>
            <div className="user-list">
              {data.users.map((user) => (
                <div key={user.id} className="user-card">
                  <div>
                    <p className="eyebrow">{user.role}</p>
                    <strong>{user.name}</strong>
                  </div>
                  {data.users.length > 1 && user.id !== selectedUserId && (
                    <button className="btn danger ghost" onClick={() => handleRemoveUser(user.id)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        )}

        {currentUser?.role === 'Editor' && (
          <Panel title="My tasks" accent="green">
            {editorTasks.length === 0 ? (
              <p className="muted">No tasks yet. Ask your PM to assign you to a task.</p>
            ) : (
              <div className="tasks">
                {editorTasks.map((task) => (
                  <div key={task.id} className="task">
                    <div>
                      <p className="eyebrow">{task.projectName}</p>
                      <h4>{task.title}</h4>
                      <p className="muted">{task.timeLog?.reduce((sum, t) => sum + t.minutes, 0) || 0} min logged</p>
                    </div>
                    <div className="task__actions">
                      <div className="toggles">
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={task.started}
                            onChange={(e) => handleTaskToggle(task.projectId, task.id, 'started', e.target.checked)}
                          />
                          <span>Started</span>
                        </label>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => handleTaskToggle(task.projectId, task.id, 'completed', e.target.checked)}
                          />
                          <span>Completed</span>
                        </label>
                      </div>
                      <TimeLogger
                        task={task}
                        onLog={(minutes, note) => handleLogTime(task.projectId, task.id, minutes, note)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>

      <Panel title="Projects" accent="neutral">
        {data.projects.length === 0 ? (
          <p className="muted">No projects yet. PMs can create projects and assign tasks.</p>
        ) : (
          <div className="grid">
            {data.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                users={data.users}
                onTaskToggle={handleTaskToggle}
                onLogTime={handleLogTime}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default App;
