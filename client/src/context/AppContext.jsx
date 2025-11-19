import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const storageKey = 'pm-app-state';
const userKey = 'pm-current-user';
const TASK_STATUSES = ['Started', 'In Progress', 'Completed'];

const defaultState = {
  users: [
    {
      id: 'u-admin',
      name: 'Avery Admin',
      email: 'admin@demo.com',
      role: 'admin',
      password: 'admin123',
    },
    {
      id: 'u-pm',
      name: 'Peyton PM',
      email: 'pm@demo.com',
      role: 'pm',
      password: 'pm123',
    },
    {
      id: 'u-user',
      name: 'Uri User',
      email: 'user@demo.com',
      role: 'user',
      password: 'user123',
    },
  ],
  projects: [],
};

const AppContext = createContext();

const getCrypto = () => {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto;
  if (typeof crypto !== 'undefined') return crypto;
  return null;
};

const generateId = (prefix) => {
  const cryptoRef = getCrypto();
  if (cryptoRef?.randomUUID) {
    return `${prefix}-${cryptoRef.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored state', error);
      }
    }
    return defaultState;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem(userKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored user', error);
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(userKey, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(userKey);
    }
  }, [currentUser]);

  const login = (email, password) => {
    const user = state.users.find((u) => u.email === email.trim());
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials. Try one of the demo accounts.');
    }
    setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  const addUser = (payload) => {
    const newUser = { id: generateId('user'), ...payload };
    setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const createProject = (payload) => {
    const newProject = {
      id: generateId('project'),
      tasks: [],
      ...payload,
    };
    setState((prev) => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (projectId, updates) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        projectId === project.id ? { ...project, ...updates } : project
      ),
    }));
  };

  const deleteProject = (projectId) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== projectId),
    }));
  };

  const createTask = (projectId, payload) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => {
        if (project.id !== projectId) return project;
        const newTask = { id: generateId('task'), status: 'Started', ...payload };
        return { ...project, tasks: [...project.tasks, newTask] };
      }),
    }));
  };

  const updateTask = (projectId, taskId, updates) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          tasks: project.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        };
      }),
    }));
  };

  const deleteTask = (projectId, taskId) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => {
        if (project.id !== projectId) return project;
        return { ...project, tasks: project.tasks.filter((task) => task.id !== taskId) };
      }),
    }));
  };

  const contextValue = useMemo(
    () => ({
      state,
      currentUser,
      login,
      logout,
      addUser,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      TASK_STATUSES,
    }),
    [state, currentUser]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
};

