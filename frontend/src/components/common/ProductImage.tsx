import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
export function ProductImage({ src, alt, sx }: { src?: string; alt: string; sx?: SxProps<Theme> }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <Box
      component="img"
      src={!src || failed ? '/product-placeholder.svg' : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      sx={[
        { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        ...(Array.isArray(sx) ? sx : [sx || {}]),
      ]}
    />
  );
}
