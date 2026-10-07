import { Box, Step, StepLabel, Stepper } from '@mui/material';
import { Link } from 'react-router-dom';
export function CheckoutSteps({ active }: { active: number }) {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mb: 5 }}>
      <Stepper activeStep={active} alternativeLabel>
        {['Giỏ hàng', 'Thanh toán', 'Hoàn tất'].map((label, index) => (
          <Step key={label}>
            <StepLabel>
              {index < active && active < 2 ? (
                <Link to={index === 0 ? '/cart' : '/checkout'}>{label}</Link>
              ) : (
                label
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
