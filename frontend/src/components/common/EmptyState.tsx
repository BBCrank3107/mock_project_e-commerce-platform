import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Inventory2Outlined } from '@mui/icons-material';
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Paper sx={{ p: { xs: 4, md: 7 }, textAlign: 'center' }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 2.5,
          borderRadius: '50%',
          bgcolor: '#f0f2eb',
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Inventory2Outlined />
      </Box>
      <Typography variant="h5">{title}</Typography>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{ mt: 1, mb: 3, maxWidth: 380, mx: 'auto' }}
      >
        {description}
      </Typography>
      {action}
    </Paper>
  );
}
