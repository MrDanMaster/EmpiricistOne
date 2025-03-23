import React from 'react';
import { Box, Paper, Typography, Collapse } from '@mui/material';
import { VariableDetailsProps } from '../types/ComponentTypes';

export const VariableDetails: React.FC<VariableDetailsProps> = ({
    variable,
    isSelected,
    onSelect
}) => {
    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={onSelect}
        >
            <Typography variant="h6" gutterBottom>
                {variable.name}
            </Typography>
            <Collapse in={isSelected}>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Equation: {variable.equation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Dimension: {variable.dimension}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Measurement: {variable.measurementMethod}
                    </Typography>
                    {variable.verificationData && (
                        <Typography variant="body2" color="text.secondary">
                            Verification: {variable.verificationData}
                        </Typography>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}; 