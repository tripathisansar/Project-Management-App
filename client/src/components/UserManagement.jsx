import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppContext } from '../context/AppContext';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
};

const UserManagement = () => {
  const { state, addUser } = useAppContext();
  const [form, setForm] = useState(emptyForm);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addUser(form);
    setForm(emptyForm);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Team directory
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Admins can grow the team and set the correct access level for each person.
        </Typography>
        <Stack component="form" spacing={2} onSubmit={handleSubmit} mt={2}>
          <TextField required name="name" label="Full name" value={form.name} onChange={handleChange} />
          <TextField required name="email" label="Email" value={form.email} onChange={handleChange} />
          <TextField
            required
            name="password"
            label="Temporary password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <TextField select name="role" label="Role" value={form.role} onChange={handleChange}>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="pm">Project Manager</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>
          <Button type="submit" variant="contained">
            Invite user
          </Button>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Stack spacing={1.5}>
          {state.users.map((user) => (
            <Box
              key={user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Box>
                <Typography fontWeight={600}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Chip label={user.role.toUpperCase()} color={user.role === 'admin' ? 'primary' : 'default'} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
