import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { getImageUrl } from '../../utils/imageUrl';

export function ProductImage({ src, alt, sx }: { src?: string; alt: string; sx?: SxProps<Theme> }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const resolvedSrc = failed ? '/product-placeholder.svg' : getImageUrl(src);

  return (
    <Box
      component="img"
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (!failed) setFailed(true);
      }}
      sx={[
        { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
        ...(Array.isArray(sx) ? sx : [sx || {}]),
      ]}
    />
  );
}
