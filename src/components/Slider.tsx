import React from 'react';
import { Box, Slider as MuiSlider, Typography } from '@mui/material';
import { SliderProps } from '../types/ComponentTypes';

export const Slider: React.FC<SliderProps> = ({ variable, onChange }) => {
    const handleChange = (_event: Event, value: number | number[]) => {
        onChange(variable.name, value as number);
    };

    return (
        <Box sx={{ width: '100%', px: 2 }}>
            <Typography gutterBottom>
                {variable.name} ({variable.unit})
            </Typography>
            <MuiSlider
                value={variable.value}
                onChange={handleChange}
                min={variable.min}
                max={variable.max}
                step={variable.step}
                marks={[
                    { value: variable.min, label: variable.min.toString() },
                    { value: variable.max, label: variable.max.toString() }
                ]}
                disabled={variable.isDerived}
            />
        </Box>
    );
}; 