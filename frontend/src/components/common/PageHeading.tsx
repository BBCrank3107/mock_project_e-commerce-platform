import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4,
      }}
    >
      <Box>
        {eyebrow && (
          <Typography variant="overline" color="secondary.main">
            {eyebrow}
          </Typography>
        )}
        <Typography component="h1" variant="h4" sx={{ mt: 0.5 }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
