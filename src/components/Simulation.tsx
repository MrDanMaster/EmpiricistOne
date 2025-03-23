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
            timeStep: 0, // Start at t=0 by default
            history: Object.keys(DEFAULT_VARIABLES).reduce((acc, key) => ({ ...acc, [key]: [] }), {}),
            verificationPoints: {},
            reserveArmyOfLabor: 0
        };
    });

    // Add initial state for reset functionality
    const [initialState] = useState<EconomicState>(() => {
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
            timeStep: 0, // Start at t=0 by default
            history: Object.keys(DEFAULT_VARIABLES).reduce((acc, key) => ({ ...acc, [key]: [] }), {}),
            verificationPoints: {},
            reserveArmyOfLabor: 0
        };
    });

    const [isRunning, setIsRunning] = useState(false);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    const [showDualAxes, setShowDualAxes] = useState(false);
    const [useLogScale, setUseLogScale] = useState(false);
    const [timeScale, setTimeScale] = useState<'linear' | 'logarithmic'>('linear');
    const [preSimulationState, setPreSimulationState] = useState<EconomicState | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [stepsAnchorEl, setStepsAnchorEl] = useState<null | HTMLElement>(null);
    const [stepsToGenerate, setStepsToGenerate] = useState<number>(20);
    const [isStepsMenuOpen, setIsStepsMenuOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [targetSteps, setTargetSteps] = useState<number>(20);

    const calculateNextStep = () => {
        setState(prevState => {
            const newState = { ...prevState };
            const vars = newState.variables;

            // Store previous surplus value before any updates
            const previousSurplusValue = vars.surplusValue.value;

            // Update money supply based on printing rate
            const moneyPrintingRate = vars.moneyPrintingRate.value;
            const previousMoneySupply = vars.moneySupply.value;
            vars.moneySupply.value = previousMoneySupply * (1 + moneyPrintingRate);

            // Calculate productivity change based on change in organic composition
            const previousOrganicComposition = vars.organicComposition.value;
            const newOrganicComposition = vars.constantCapital.value / vars.variableCapital.value;
            const productivityChange = newOrganicComposition / previousOrganicComposition;

            // Update MELT based on money supply and productivity changes
            const previousMelt = vars.melt.value;
            vars.melt.value = previousMelt * (1 + moneyPrintingRate) / (1 + productivityChange);

            // Calculate inflation as the difference between money supply growth and MELT change
            const meltChange = (vars.melt.value - previousMelt) / previousMelt;
            vars.inflation.value = moneyPrintingRate - meltChange;

            // Only update other variables if we're not at t=-1
            if (newState.timeStep >= 0) {
                // First, add previous surplus value to constant capital, minus fictitious capital
                const fictitiousCapitalSpending = vars.fictitiousCapitalProduction.value;
                vars.constantCapital.value += previousSurplusValue * (1 - fictitiousCapitalSpending);
                vars.accumulatedFictitiousCapital.value += previousSurplusValue * fictitiousCapitalSpending;

                // Then handle class struggle effects
                vars.wageGrowth.value = vars.classStruggle.value - vars.inflation.value;
                const wageGrowth = vars.wageGrowth.value;
                if (wageGrowth < 0) {
                    // Capital gaining ground - exploitation rate increases proportionally with wage growth
                    const newExploitationRate = vars.rateOfExploitation.value * (1 + Math.abs(wageGrowth));
                    // Maintain the sum of s+v while adjusting their ratio
                    const currentV = vars.variableCapital.value;
                    const currentS = vars.surplusValue.value;
                    const totalV = currentV + currentS;
                    
                    // Calculate new v and s maintaining their sum
                    const newV = totalV / (1 + newExploitationRate);
                    const newS = totalV - newV;
                    
                    // Update state
                    vars.variableCapital.value = newV;
                    vars.surplusValue.value = newS;
                } else if (wageGrowth > 0) {
                    // Workers gaining ground - exploitation rate decreases proportionally with wage growth
                    const newExploitationRate = vars.rateOfExploitation.value * (1 - wageGrowth);
                    // Maintain the sum of s+v while adjusting their ratio
                    const currentV = vars.variableCapital.value;
                    const currentS = vars.surplusValue.value;
                    const totalV = currentV + currentS;
                    
                    // Calculate new v and s maintaining their sum
                    const newV = totalV / (1 + newExploitationRate);
                    const newS = totalV - newV;
                    
                    // Update state
                    vars.variableCapital.value = newV;
                    vars.surplusValue.value = newS;
                }

                // Update total value every step
                vars.totalValue.value = vars.constantCapital.value + vars.variableCapital.value + vars.surplusValue.value;

                // Update derived ratios
                vars.rateOfExploitation.value = vars.surplusValue.value / vars.variableCapital.value;
                vars.organicComposition.value = vars.constantCapital.value / vars.variableCapital.value;
                vars.rateOfProfit.value = vars.surplusValue.value / (vars.constantCapital.value + vars.variableCapital.value);
                vars.productivity.value = vars.organicComposition.value; // Update productivity from organic composition
            }

            // Update history
            Object.keys(vars).forEach(key => {
                newState.history[key].push(vars[key].value);
                if (newState.history[key].length > MAX_HISTORY_LENGTH) {
                    newState.history[key].shift();
                }
            });

            newState.timeStep += TIME_STEP;
            return newState;
        });

        // Update current step and check if we've reached the target
        setCurrentStep(prev => {
            const nextStep = prev + 1;
            if (nextStep >= targetSteps) {
                setIsRunning(false);
            }
            return nextStep;
        });
    };

    const handleVariableChange = (name: string, value: number): void => {
        setState(prevState => {
            const newState = { ...prevState };
            const vars = newState.variables;

            // Handle basic variables
            if (name === 'constantCapital') {
                vars.constantCapital.value = value;
                // Update total value
                vars.totalValue.value = vars.constantCapital.value + vars.variableCapital.value + vars.surplusValue.value;
            } else if (name === 'variableCapital') {
                vars.variableCapital.value = value;
                // Update total value
                vars.totalValue.value = vars.constantCapital.value + vars.variableCapital.value + vars.surplusValue.value;
            } else if (name === 'surplusValue') {
                vars.surplusValue.value = value;
                // Update total value
                vars.totalValue.value = vars.constantCapital.value + vars.variableCapital.value + vars.surplusValue.value;
            } else if (name === 'totalValue') {
                // When total value changes, maintain the ratios
                const oldTotal = vars.totalValue.value;
                const ratio = value / oldTotal;
                vars.constantCapital.value *= ratio;
                vars.variableCapital.value *= ratio;
                vars.surplusValue.value *= ratio;
                vars.totalValue.value = value;
            }
            // Handle ratio changes
            else if (name === 'rateOfExploitation') {
                // When changing s/v, only adjust s and v, keeping c and total value constant
                const oldTotal = vars.totalValue.value;
                const oldC = vars.constantCapital.value;
                const newRatio = value;
                
                // Calculate new v and s while keeping c constant
                const newV = (oldTotal - oldC) / (1 + newRatio);
                const newS = newV * newRatio;
                
                vars.variableCapital.value = newV;
                vars.surplusValue.value = newS;
                // constantCapital remains unchanged
            } else if (name === 'organicComposition') {
                // When changing c/v, only adjust c and v, keeping s and total value constant
                const oldTotal = vars.totalValue.value;
                const oldS = vars.surplusValue.value;
                const newRatio = value;
                
                // Calculate new v and c while keeping s constant
                const newV = (oldTotal - oldS) / (1 + newRatio);
                const newC = oldTotal - oldS - newV;
                
                vars.variableCapital.value = newV;
                vars.constantCapital.value = newC;
                // surplusValue remains unchanged
            }
            // Handle class struggle and inflation
            else if (name === 'classStruggle') {
                vars.classStruggle.value = value;
                // Update wage growth
                vars.wageGrowth.value = value - vars.inflation.value;
            } else if (name === 'inflation') {
                vars.inflation.value = value;
                // Update wage growth
                vars.wageGrowth.value = vars.classStruggle.value - value;
            } else if (name === 'fictitiousCapitalProduction') {
                // Update fictitious capital production
                vars.fictitiousCapitalProduction.value = value;
                // No need to update other variables as this only affects future accumulation
            } else if (name === 'accumulatedFictitiousCapital') {
                // Update accumulated fictitious capital
                vars.accumulatedFictitiousCapital.value = value;
                // No need to update other variables as this is a separate accumulation
            } else if (name === 'moneySupply') {
                // Update money supply
                vars.moneySupply.value = value;
                // Update MELT based on new money supply
                const totalLaborTime = vars.totalValue.value;
                vars.melt.value = value / totalLaborTime;
            } else if (name === 'moneyPrintingRate') {
                // Update money printing rate
                vars.moneyPrintingRate.value = value;
                // No immediate effect, will be applied in calculateNextStep
            } else if (name === 'melt') {
                // Update MELT directly
                vars.melt.value = value;
                // No need to update other variables as MELT is used for price calculations
            }

            // Update derived ratios
            vars.rateOfExploitation.value = vars.surplusValue.value / vars.variableCapital.value;
            vars.organicComposition.value = vars.constantCapital.value / vars.variableCapital.value;
            vars.rateOfProfit.value = vars.surplusValue.value / (vars.constantCapital.value + vars.variableCapital.value);
            vars.productivity.value = vars.organicComposition.value; // Update productivity from organic composition

            return newState;
        });
    };

    useEffect(() => {
        if (isRunning) {
            const animate = () => {
                calculateNextStep();
                animationFrameRef.current = requestAnimationFrame(animate);
            };
            animationFrameRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isRunning]);

    const getChartData = (): ChartData<'line'> => {
        const timeLabels = Array.from({ length: MAX_HISTORY_LENGTH }, (_, i) => i);
        const datasets = Object.entries(state.history)
            .filter(([_, values]) => {
                // Only include variables that have changed
                return values.length > 0 && values.some((val, i, arr) => i > 0 && val !== arr[i - 1]);
            })
            .map(([key, values]) => {
                const variable = state.variables[key];
                const isRatio = variable.category === 'ratio';
                const isPT = variable.dimension === 'PT';
                const isRate = variable.dimension === 'T^-1';
                
                return {
                    label: variable.name,
                    data: values,
                    borderColor: isPT ? 
                        `hsl(${Math.random() * 60 + 330}, 70%, 50%)` : // Red-dominated colors for PT
                        isRate ?
                        `hsl(${Math.random() * 60 + 180}, 70%, 50%)` : // Blue-dominated colors for rates
                        `hsl(${Math.random() * 120 + 120}, 70%, 50%)`, // Green for ratios
                    backgroundColor: 'transparent',
                    yAxisID: showDualAxes && (isRatio || isRate) ? 'proportion' : 'value',
                    hidden: values.length === 0
                };
            });

        return {
            labels: timeLabels,
            datasets
        };
    };

    // Add function to get static variables
    const getStaticVariables = () => {
        return Object.entries(state.history)
            .filter(([_, values]) => {
                // Only include variables that haven't changed
                return values.length > 0 && values.every((val, i, arr) => i === 0 || val === arr[i - 1]);
            })
            .map(([key, values]) => ({
                name: state.variables[key].name,
                value: values[0],
                dimension: state.variables[key].dimension
            }));
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        animation: {
            duration: 0 // Disable animation for smoother updates
        },
        scales: {
            x: {
                type: timeScale,
                title: {
                    display: true,
                    text: 'Time Step'
                }
            },
            value: {
                type: useLogScale ? 'logarithmic' : 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: 'Numerical Value'
                }
            },
            proportion: showDualAxes ? {
                type: 'linear',
                position: 'right',
                min: 0,
                max: 1,
                title: {
                    display: true,
                    text: 'Proportion'
                }
            } : undefined
        },
        plugins: {
            legend: {
                position: 'top' as const
            },
            title: {
                display: true,
                text: 'Economic Variables Over Time'
            }
        }
    };

    const handleStartClick = (event: React.MouseEvent<HTMLElement>) => {
        setStepsAnchorEl(event.currentTarget);
    };

    const handleStepsMenuClose = () => {
        setStepsAnchorEl(null);
        setIsStepsMenuOpen(false);
    };

    const handleStepsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        if (!isNaN(value) && value > 0) {
            setStepsToGenerate(value);
        }
    };

    const handleStartWithSteps = () => {
        setTargetSteps(stepsToGenerate);
        setCurrentStep(0);
        handleStepsMenuClose();
        handleStart();
    };

    const handleStart = () => {
        setState(prevState => {
            const preSimState = {
                ...prevState,
                variables: Object.entries(prevState.variables).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: {
                        ...value,
                        value: value.value
                    }
                }), {}) as Record<string, EconomicVariable>
            };

            const vars = preSimState.variables;
            const targetInflation = vars.inflation.value;
            
            // Only initialize t=-1 if there's non-zero inflation
            if (targetInflation !== 0) {
                const moneyPrintingRate = vars.moneyPrintingRate.value;
                
                // Calculate the required MELT change to achieve the target inflation
                // inflation = moneyPrintingRate - meltChange
                // Therefore: meltChange = moneyPrintingRate - inflation
                const requiredMeltChange = moneyPrintingRate - targetInflation;
                
                // Set MELT at t=-1 to achieve this change
                vars.melt.value = vars.melt.value / (1 + requiredMeltChange);
                
                // Set timeStep to -1 only if we need to initialize inflation
                preSimState.timeStep = -1;
            } else {
                // If no inflation, start at t=0
                preSimState.timeStep = 0;
            }

            setPreSimulationState(preSimState);
            return prevState;
        });
        setIsRunning(true);
    };

    const handleReset = () => {
        setState(initialState);
        setIsRunning(false);
        setPreSimulationState(null);
    };

    const handleResetToPreSimulation = () => {
        if (preSimulationState) {
            // Create a deep copy of the pre-simulation state
            const resetState = {
                ...preSimulationState,
                timeStep: 0,
                history: Object.keys(preSimulationState.variables).reduce((acc, key) => ({ ...acc, [key]: [] }), {})
            };
            setState(resetState);
            setIsRunning(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Marxian Economic Simulation
            </Typography>

            {/* Simulation Controls */}
            <Box sx={{ mb: 3 }}>
                <ButtonGroup variant="contained" sx={{ mr: 2 }}>
                    <Button 
                        onClick={handleStartClick}
                        disabled={isRunning}
                    >
                        Start
                    </Button>
                    <Menu
                        anchorEl={stepsAnchorEl}
                        open={Boolean(stepsAnchorEl)}
                        onClose={handleStepsMenuClose}
                    >
                        <MenuItem sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
                            <Typography variant="body2">Number of steps to generate:</Typography>
                            <TextField
                                type="number"
                                value={stepsToGenerate}
                                onChange={handleStepsChange}
                                size="small"
                                inputProps={{ min: 1 }}
                            />
                            <Button 
                                variant="contained" 
                                onClick={handleStartWithSteps}
                                sx={{ mt: 1 }}
                            >
                                Start Simulation
                            </Button>
                        </MenuItem>
                    </Menu>
                    <Button 
                        onClick={() => setIsRunning(false)}
                        disabled={!isRunning}
                    >
                        Stop
                    </Button>
                    <Button 
                        onClick={handleReset}
                        disabled={isRunning}
                    >
                        Default
                    </Button>
                    <Button 
                        onClick={handleResetToPreSimulation}
                        disabled={isRunning || !preSimulationState}
                    >
                        Reset
                    </Button>
                </ButtonGroup>

                {isRunning && (
                    <Typography variant="body2" sx={{ display: 'inline', ml: 2 }}>
                        Step {currentStep} of {targetSteps}
                    </Typography>
                )}

                <ButtonGroup variant="outlined" sx={{ mr: 2 }}>
                    <Button 
                        onClick={() => setShowDualAxes(!showDualAxes)}
                        color={showDualAxes ? "primary" : "inherit"}
                    >
                        Dual Axes
                    </Button>
                    <Button 
                        onClick={() => setUseLogScale(!useLogScale)}
                        color={useLogScale ? "primary" : "inherit"}
                    >
                        Log Scale
                    </Button>
                    <Button 
                        onClick={() => setTimeScale(timeScale === 'linear' ? 'logarithmic' : 'linear')}
                        color={timeScale === 'logarithmic' ? "primary" : "inherit"}
                    >
                        Time Scale
                    </Button>
                </ButtonGroup>
            </Box>

            {/* Variables */}
            <Grid container spacing={3}>
                {/* Chart */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Time Series
                        </Typography>
                        <Line data={getChartData()} options={chartOptions} />
                        {/* Static Variables Display */}
                        {getStaticVariables().length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {getStaticVariables().map(({ name, value, dimension }) => (
                                    <Typography key={name} variant="body2">
                                        {name}: {value.toFixed(2)} [{dimension}]
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Basic Variables */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Variables
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {Object.entries(state.variables)
                                .filter(([_, v]) => v.category === 'basic')
                                .map(([key, variable]) => (
                                    <Box key={key} sx={{ flex: '1 1 300px' }}>
                                        <Slider
                                            variable={variable}
                                            onChange={(value: number) => handleVariableChange(key, value)}
                                            step={0.01}
                                            disabled={isRunning || variable.isDerived}
                                        />
                                        <VariableDetails
                                            variable={variable}
                                            isSelected={selectedVariables.includes(key)}
                                            onSelect={() => setSelectedVariables([...selectedVariables, key])}
                                        />
                                    </Box>
                                ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Marxian Ratios */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Marxian Ratios
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {Object.entries(state.variables)
                                .filter(([_, v]) => v.category === 'ratio')
                                .map(([key, variable]) => (
                                    <Box key={key} sx={{ flex: '1 1 300px' }}>
                                        <Slider
                                            variable={variable}
                                            onChange={(value: number) => handleVariableChange(key, value)}
                                            step={0.01}
                                            disabled={isRunning || variable.isDerived}
                                        />
                                        <VariableDetails
                                            variable={variable}
                                            isSelected={selectedVariables.includes(key)}
                                            onSelect={() => setSelectedVariables([...selectedVariables, key])}
                                        />
                                    </Box>
                                ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Subjective Factors */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Subjective Factors
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {Object.entries(state.variables)
                                .filter(([key, v]) => v.category === 'subjective' || key === 'classStruggle')
                                .map(([key, variable]) => (
                                    <Box key={key} sx={{ flex: '1 1 300px' }}>
                                        <Slider
                                            variable={variable}
                                            onChange={(value: number) => handleVariableChange(key, value)}
                                            step={0.01}
                                            disabled={isRunning || variable.isDerived}
                                        />
                                        <VariableDetails
                                            variable={variable}
                                            isSelected={selectedVariables.includes(key)}
                                            onSelect={() => setSelectedVariables([...selectedVariables, key])}
                                        />
                                    </Box>
                                ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Bourgeois Economics */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Bourgeois Economics
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {Object.entries(state.variables)
                                .filter(([key, v]) => v.category === 'bourgeois' && key !== 'classStruggle')
                                .map(([key, variable]) => (
                                    <Box key={key} sx={{ flex: '1 1 300px' }}>
                                        <Slider
                                            variable={variable}
                                            onChange={(value: number) => handleVariableChange(key, value)}
                                            step={0.01}
                                            disabled={isRunning || variable.isDerived}
                                        />
                                        <VariableDetails
                                            variable={variable}
                                            isSelected={selectedVariables.includes(key)}
                                            onSelect={() => setSelectedVariables([...selectedVariables, key])}
                                        />
                                    </Box>
                                ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}; 