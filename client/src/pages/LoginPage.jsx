import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppContext } from '../context/AppContext';

const demoAccounts = [
  { label: 'Admin', email: 'admin@demo.com', password: 'admin123' },
  { label: 'Project Manager', email: 'pm@demo.com', password: 'pm123' },
  { label: 'User', email: 'user@demo.com', password: 'user123' },
];

const LoginPage = () => {
  const { login } = useAppContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={8} sx={{ width: '100%', p: 4 }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Project Management Hub
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in with one of the demo accounts to explore the admin, project manager,
              and user experiences.
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            required
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" size="large">
            Sign In
          </Button>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Quick logins
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={1}>
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  size="small"
                  variant="outlined"
                  onClick={() => setForm(account)}
                >
                  {account.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;
