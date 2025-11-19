import {
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppContext } from '../context/AppContext';

const TaskOverview = () => {
  const { state, currentUser, updateTask, TASK_STATUSES } = useAppContext();

  const tasks = state.projects.flatMap((project) =>
    project.tasks.map((task) => ({ ...task, projectId: project.id, projectName: project.name }))
  );

  const assignedTasks = tasks.filter((task) => task.assignedTo === currentUser.id);

  if (assignedTasks.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Your tasks
          </Typography>
          <Typography color="text.secondary">
            There are no tasks assigned to you yet. Come back after a project manager assigns work.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {assignedTasks.map((task) => (
        <Card key={task.id}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              {task.projectName}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {task.description || 'No description provided'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={task.dueDate ? `Due ${task.dueDate}` : 'Flexible due date'} />
              <TextField
                select
                label="Status"
                size="small"
                value={task.status}
                onChange={(event) => updateTask(task.projectId, task.id, { status: event.target.value })}
              >
                {TASK_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default TaskOverview;
