import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAppContext } from '../context/AppContext';
import TaskDialog from './TaskDialog';

const emptyProject = {
  name: '',
  description: '',
  ownerId: '',
  dueDate: '',
};

const ProjectBoard = () => {
  const {
    state,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    TASK_STATUSES,
  } = useAppContext();
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingProjectId, setEditingProjectId] = useState('');
  const [taskDialog, setTaskDialog] = useState({ open: false, projectId: '', task: null });
  const resetProjectForm = () => {
    setProjectForm(emptyProject);
    setEditingProjectId('');
  };

  const managers = useMemo(
    () => state.users.filter((user) => user.role === 'pm' || user.role === 'admin'),
    [state.users]
  );

  const handleProjectChange = (event) => {
    const { name, value } = event.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectSubmit = (event) => {
    event.preventDefault();
    if (editingProjectId) {
      updateProject(editingProjectId, projectForm);
    } else {
      createProject(projectForm);
    }
    resetProjectForm();
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      name: project.name,
      description: project.description || '',
      ownerId: project.ownerId || '',
      dueDate: project.dueDate || '',
    });
  };

  const handleTaskDialog = (projectId, task = null) => {
    setTaskDialog({ open: true, projectId, task });
  };

  const closeTaskDialog = () => setTaskDialog({ open: false, projectId: '', task: null });

  const handleTaskSubmit = (taskData) => {
    if (taskDialog.task) {
      updateTask(taskDialog.projectId, taskDialog.task.id, taskData);
    } else {
      createTask(taskDialog.projectId, taskData);
    }
    closeTaskDialog();
  };

  const handleDeleteTask = (projectId, taskId) => {
    deleteTask(projectId, taskId);
  };

  const getOwnerName = (ownerId) => managers.find((user) => user.id === ownerId)?.name || 'Unassigned';

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }} component="form" onSubmit={handleProjectSubmit}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {editingProjectId ? 'Update project' : 'Create a new project'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              required
              label="Project name"
              name="name"
              value={projectForm.name}
              onChange={handleProjectChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Owner"
              name="ownerId"
              select
              value={projectForm.ownerId}
              onChange={handleProjectChange}
              fullWidth
            >
              <MenuItem value="">Unassigned</MenuItem>
              {managers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Due date"
              name="dueDate"
              type="date"
              value={projectForm.dueDate}
              onChange={handleProjectChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Summary"
              name="description"
              value={projectForm.description}
              onChange={handleProjectChange}
              multiline
              minRows={2}
              fullWidth
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} mt={2}>
          {editingProjectId && (
            <Button color="inherit" onClick={resetProjectForm}>
              Cancel
            </Button>
          )}
          <Button variant="contained" type="submit">
            {editingProjectId ? 'Save changes' : 'Create project'}
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {state.projects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Owner: {getOwnerName(project.ownerId)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit project">
                      <IconButton color="primary" onClick={() => handleEditProject(project)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete project">
                      <IconButton color="error" onClick={() => deleteProject(project.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                {project.description && (
                  <Typography variant="body2" mt={1} color="text.secondary">
                    {project.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} mt={1}>
                  {project.dueDate && <Chip label={`Due ${project.dueDate}`} />}
                  <Chip label={`${project.tasks.length} tasks`} color="secondary" variant="outlined" />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5}>
                  {project.tasks.length === 0 && (
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No tasks yet. Use the button below to create one.
                      </Typography>
                    </Paper>
                  )}
                  {project.tasks.map((task) => (
                    <Paper key={task.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography fontWeight={600}>{task.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.description || 'No description provided'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.dueDate ? `Due ${task.dueDate}` : 'No due date'}
                          </Typography>
                        </Box>
                        <Stack spacing={1} alignItems="flex-end">
                          <Chip label={task.status} color={task.status === 'Completed' ? 'success' : 'default'} />
                          {task.assignedTo && (
                            <Typography variant="caption" color="text.secondary">
                              Assigned to {
                                state.users.find((user) => user.id === task.assignedTo)?.name || 'Unknown'
                              }
                            </Typography>
                          )}
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" onClick={() => handleTaskDialog(project.id, task)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTask(project.id, task.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
              <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
                <Button variant="outlined" onClick={() => handleTaskDialog(project.id)} fullWidth>
                  Add task
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {state.projects.length === 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Start by creating a project to unlock planning and task assignments.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <TaskDialog
        open={taskDialog.open}
        onClose={closeTaskDialog}
        onSubmit={handleTaskSubmit}
        initialTask={taskDialog.task}
        users={state.users}
        statuses={TASK_STATUSES}
      />
    </Stack>
  );
};

export default ProjectBoard;
