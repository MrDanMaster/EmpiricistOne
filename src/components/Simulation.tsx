import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, Grid, ButtonGroup, FormControlLabel, Switch, Menu, MenuItem, TextField } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { EconomicState, DEFAULT_VARIABLES, EconomicVariable } from '../types/EconomicTypes';
import { Slider } from './Slider';
import { VariableDetails } from './VariableDetails';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LogarithmicScale
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LogarithmicScale
);

const MAX_HISTORY_LENGTH = 100;
const TIME_STEP = 1;

export const Simulation: React.FC = () => {
    const [state, setState] = useState<EconomicState>(() => {
        // Create a deep copy of DEFAULT_VARIABLES
        const initialVariables = Object.entries(DEFAULT_VARIABLES).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: {
                ...value,
                value: value.value // Ensure value is copied
            }
        }), {});

        return {
            variables: initialVariables,
            timeStep: 0,
            history: Object.keys(DEFAULT_VARIABLES).reduce((acc, key) => ({ ...acc, [key]: [] }), {}),
            verificationPoints: {},
            reserveArmyOfLabor: 0
        };
    });

    const [isRunning, setIsRunning] = useState(false);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
    const [steps, setSteps] = useState(1);
    const [stepsAnchorEl, setStepsAnchorEl] = useState<null | HTMLElement>(null);
    const animationFrameRef = useRef<number>();

    const calculateNextStep = () => {
        setState(prevState => {
            const newVariables = { ...prevState.variables };
            const newHistory = { ...prevState.history };

            // Update derived variables
            Object.entries(newVariables).forEach(([key, variable]) => {
                if (variable.isDerived) {
                    switch (key) {
                        case 'surplusValue':
                            newVariables[key].value = newVariables['marketPrice'].value - newVariables['variableCapital'].value;
                            break;
                        case 'rateOfExploitation':
                            newVariables[key].value = newVariables['surplusValue'].value / newVariables['variableCapital'].value;
                            break;
                        case 'organicComposition':
                            newVariables[key].value = newVariables['constantCapital'].value / newVariables['variableCapital'].value;
                            break;
                        case 'rateOfProfit':
                            newVariables[key].value = newVariables['surplusValue'].value / 
                                (newVariables['constantCapital'].value + newVariables['variableCapital'].value);
                            break;
                        case 'marketPrice':
                            newVariables[key].value = newVariables['constantCapital'].value + 
                                newVariables['variableCapital'].value + newVariables['surplusValue'].value;
                            break;
                    }
                }
            });

            // Update history
            Object.keys(newVariables).forEach(key => {
                newHistory[key] = [...newHistory[key], newVariables[key].value];
                if (newHistory[key].length > MAX_HISTORY_LENGTH) {
                    newHistory[key].shift();
                }
            });

            return {
                ...prevState,
                variables: newVariables,
                history: newHistory,
                timeStep: prevState.timeStep + TIME_STEP
            };
        });
    };

    const handleVariableChange = (name: string, value: number): void => {
        setState(prevState => ({
            ...prevState,
            variables: {
                ...prevState.variables,
                [name]: {
                    ...prevState.variables[name],
                    value
                }
            }
        }));
    };

    const handleStartClick = (event: React.MouseEvent<HTMLElement>) => {
        setStepsAnchorEl(event.currentTarget);
    };

    const handleStepsMenuClose = () => {
        setStepsAnchorEl(null);
    };

    const handleStepsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSteps(Number(event.target.value));
    };

    const handleStartWithSteps = () => {
        handleStepsMenuClose();
        setIsRunning(true);
        let stepsRemaining = steps;
        const animate = () => {
            if (stepsRemaining > 0 && isRunning) {
                calculateNextStep();
                stepsRemaining--;
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setIsRunning(false);
            }
        };
        animate();
    };

    const handleStart = () => {
        setIsRunning(true);
        const animate = () => {
            if (isRunning) {
                calculateNextStep();
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };
        animate();
    };

    const handleReset = () => {
        setIsRunning(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setState(prevState => ({
            ...prevState,
            timeStep: 0,
            history: Object.keys(DEFAULT_VARIABLES).reduce((acc, key) => ({ ...acc, [key]: [] }), {})
        }));
    };

    const handleResetToPreSimulation = () => {
        setIsRunning(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setState(prevState => ({
            ...prevState,
            variables: Object.entries(DEFAULT_VARIABLES).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: {
                    ...value,
                    value: value.value
                }
            }), {}),
            timeStep: 0,
            history: Object.keys(DEFAULT_VARIABLES).reduce((acc, key) => ({ ...acc, [key]: [] }), {})
        }));
    };

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const getChartData = (): ChartData<'line'> => {
        const labels = Array.from({ length: state.timeStep + 1 }, (_, i) => i.toString());
        const datasets = selectedVariable ? [{
            label: state.variables[selectedVariable].name,
            data: state.history[selectedVariable],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }] : [];

        return {
            labels,
            datasets
        };
    };

    const getStaticVariables = () => {
        return Object.entries(state.variables)
            .filter(([_, variable]) => !variable.isDerived)
            .map(([key, variable]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                    <Slider
                        variable={variable}
                        onChange={handleVariableChange}
                    />
                </Grid>
            ));
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: selectedVariable ? state.variables[selectedVariable].name : 'Select a variable to plot'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Economic Simulation
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Time Step: {state.timeStep}
                </Typography>
                <ButtonGroup variant="contained" sx={{ mb: 2 }}>
                    <Button onClick={handleStartClick}>
                        Start
                    </Button>
                    <Button onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleResetToPreSimulation}>
                        Reset to Pre-Simulation
                    </Button>
                </ButtonGroup>
                <Menu
                    anchorEl={stepsAnchorEl}
                    open={Boolean(stepsAnchorEl)}
                    onClose={handleStepsMenuClose}
                >
                    <MenuItem>
                        <TextField
                            type="number"
                            value={steps}
                            onChange={handleStepsChange}
                            label="Number of Steps"
                            size="small"
                        />
                    </MenuItem>
                    <MenuItem onClick={handleStartWithSteps}>
                        Run for {steps} steps
                    </MenuItem>
                    <MenuItem onClick={handleStart}>
                        Run continuously
                    </MenuItem>
                </Menu>
            </Paper>

            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Line options={chartOptions} data={getChartData()} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Variables
                        </Typography>
                        <Grid container spacing={2}>
                            {Object.entries(state.variables).map(([key, variable]) => (
                                <Grid item xs={12} key={key}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={selectedVariable === key}
                                                onChange={() => setSelectedVariable(selectedVariable === key ? null : key)}
                                            />
                                        }
                                        label={variable.name}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Adjust Variables
                    </Typography>
                    <Grid container spacing={2}>
                        {getStaticVariables()}
                    </Grid>
                </Grid>
            </Grid>

            {selectedVariable && (
                <Box sx={{ mt: 2 }}>
                    <VariableDetails
                        variable={state.variables[selectedVariable]}
                        history={state.history[selectedVariable]}
                        verificationPoints={state.verificationPoints[selectedVariable]}
                    />
                </Box>
            )}
        </Box>
    );
}; 