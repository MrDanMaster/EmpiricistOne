import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { VariableDetailsProps } from '../types/ComponentTypes';

export const VariableDetails: React.FC<VariableDetailsProps> = ({ variable, history, verificationPoints }) => {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                {variable.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Value: {variable.value.toFixed(2)} {variable.unit}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Equation: {variable.equation}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Description: {variable.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Measurement Method: {variable.measurementMethod}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Category: {variable.category}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Dimension: {variable.dimension}
            </Typography>
            {variable.verificationData && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Verification Data: {variable.verificationData}
                </Typography>
            )}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {history.length} data points
                </Typography>
            </Box>
        </Paper>
    );
}; 