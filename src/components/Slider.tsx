import React from 'react';
import { Box, Slider as MuiSlider, Typography } from '@mui/material';
import { SliderProps } from '../types/ComponentTypes';

export const Slider: React.FC<SliderProps> = ({ variable, onChange, disabled, step = 0.01 }) => {
    const handleChange = (_event: Event, value: number | number[]) => {
        onChange(value as number);
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="subtitle1">
                {variable.name} ({variable.unit})
            </Typography>
            <MuiSlider
                value={variable.value}
                min={variable.min}
                max={variable.max}
                step={step}
                onChange={handleChange}
                disabled={disabled}
                valueLabelDisplay="auto"
                valueLabelFormat={(value: number) => value.toLocaleString()}
            />
        </Box>
    );
}; 