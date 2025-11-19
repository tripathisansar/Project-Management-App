import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useAppContext } from '../context/AppContext';
import UserManagement from '../components/UserManagement';
import ProjectBoard from '../components/ProjectBoard';
import TaskOverview from '../components/TaskOverview';

const Dashboard = () => {
  const { currentUser, logout, state } = useAppContext();

  const totalProjects = state.projects.length;
  const totalTasks = state.projects.reduce((sum, project) => sum + project.tasks.length, 0);
  const completedTasks = state.projects.reduce(
    (sum, project) => sum + project.tasks.filter((task) => task.status === 'Completed').length,
    0
  );
  const flattenedTasks = state.projects.flatMap((project) =>
    project.tasks.map((task) => ({ ...task, projectId: project.id, projectName: project.name }))
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {currentUser.name
                .split(' ')
                .map((word) => word[0])
                .join('')}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Welcome back, {currentUser.name}
              </Typography>
              <Typography color="text.secondary">You are signed in as {currentUser.role.toUpperCase()}</Typography>
            </Box>
          </Stack>
          <Button variant="outlined" color="inherit" onClick={logout}>
            Sign out
          </Button>
        </Stack>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {totalProjects}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tasks
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {totalTasks}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {completedTasks}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {currentUser.role === 'admin' && (
          <Grid item xs={12} md={4}>
            <UserManagement />
          </Grid>
        )}
        {['pm', 'admin'].includes(currentUser.role) && (
          <Grid item xs={12} md={currentUser.role === 'admin' ? 8 : 12}>
            <ProjectBoard />
          </Grid>
        )}
        {currentUser.role === 'user' && (
          <Grid item xs={12}>
            <TaskOverview />
          </Grid>
        )}
        {['pm', 'admin'].includes(currentUser.role) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Team workload snapshot
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                {state.users.map((user) => {
                  const ownedTasks = flattenedTasks.filter((task) => task.assignedTo === user.id);
                  if (ownedTasks.length === 0) return null;
                  return (
                    <Paper key={user.id} variant="outlined" sx={{ p: 2, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography fontWeight={600}>{user.name}</Typography>
                        <Chip label={`${ownedTasks.length} tasks`} size="small" />
                      </Stack>
                      <Stack spacing={0.5} mt={1}>
                        {ownedTasks.map((task) => (
                          <Typography key={task.id} variant="body2" color="text.secondary">
                            • {task.title} ({task.status}) — {task.projectName}
                          </Typography>
                        ))}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
