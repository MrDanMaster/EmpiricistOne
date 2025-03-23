import React from 'react';
import { Box, Slider, Typography, Paper, Collapse, IconButton } from '@mui/material';
import { EconomicVariable } from '../types/EconomicTypes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface EconomicSliderProps {
    variable: EconomicVariable;
    onChange: (value: number) => void;
}

export const EconomicSlider: React.FC<EconomicSliderProps> = ({ variable, onChange }) => {
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (_event: Event, newValue: number | number[]) => {
        onChange(newValue as number);
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{variable.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Current: {variable.value.toLocaleString()} {variable.unit}
                    </Typography>
                </Box>
                <IconButton onClick={() => setExpanded(!expanded)}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Slider
                value={variable.value}
                onChange={handleChange}
                min={variable.min}
                max={variable.max}
                step={(variable.max - variable.min) / 100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value.toLocaleString()} ${variable.unit}`}
                sx={{ mt: 2 }}
            />

            <Collapse in={expanded}>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Equation:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {variable.equation}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                        Measurement Method:
                    </Typography>
                    <Typography variant="body2">
                        {variable.measurementMethod}
                    </Typography>

                    {variable.verificationData && (
                        <>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                                Verification Data:
                            </Typography>
                            <Typography variant="body2">
                                {variable.verificationData}
                            </Typography>
                        </>
                    )}

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                        Description:
                    </Typography>
                    <Typography variant="body2">
                        {variable.description}
                    </Typography>
                </Box>
            </Collapse>
        </Paper>
    );
}; 