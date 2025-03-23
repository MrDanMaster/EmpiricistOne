export type Dimension = 'PT' | 'M' | 'R' | 'T' | 'P' | 'T^-1' | 'M/PT';

export interface EconomicVariable {
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    equation: string;
    description: string;
    measurementMethod: string;
    category: 'basic' | 'ratio' | 'bourgeois' | 'subjective';
    dimension: Dimension;
    isDerived: boolean;
    verificationData?: string;
}

export interface EconomicState {
    variables: Record<string, EconomicVariable>;
    timeStep: number;
    history: Record<string, number[]>;
    verificationPoints: Record<string, number[]>;
    reserveArmyOfLabor: number;
}

export const DEFAULT_VARIABLES: Record<string, EconomicVariable> = {
    // Basic Variables
    constantCapital: {
        name: "Constant Capital (c)",
        value: 100,
        min: 0,
        max: 10000000,
        step: 0.01,
        unit: "PT",
        equation: "c(t+1) = c(t) - (s(t) × fcs) + s(t)",
        description: "Value of means of production",
        measurementMethod: "Sum of all means of production values",
        category: "basic",
        dimension: "PT",
        isDerived: false
    },
    variableCapital: {
        name: "Variable Capital (v)",
        value: 50,
        min: 0,
        max: 100000,
        step: 1,
        unit: "P",
        equation: "v = labor power value",
        description: "Value of labor power",
        measurementMethod: "Sum of wages and benefits",
        category: "basic",
        dimension: "P",
        isDerived: false
    },
    surplusValue: {
        name: "Surplus Value (s)",
        value: 50,
        min: 0,
        max: 100000,
        step: 1,
        unit: "P",
        equation: "s = total value - (c + v)",
        description: "Value created beyond necessary labor",
        measurementMethod: "Difference between total value and capital advanced",
        category: "basic",
        dimension: "P",
        isDerived: false
    },
    totalValue: {
        name: "Total Value (W)",
        value: 200,
        min: 0,
        max: 2000,
        step: 0.01,
        unit: "PT",
        equation: "W = c + v + s",
        description: "Total value produced",
        measurementMethod: "Sum of all commodity values",
        category: "basic",
        dimension: "PT",
        isDerived: true
    },

    // Marxian Ratios
    rateOfExploitation: {
        name: "Rate of Exploitation (s/v)",
        value: 1,
        min: 0,
        max: 50,
        step: 0.01,
        unit: "R",
        equation: "s/v",
        description: "Ratio of surplus value to variable capital",
        measurementMethod: "Ratio of surplus value to wages",
        category: "ratio",
        dimension: "R",
        isDerived: false
    },
    organicComposition: {
        name: "Organic Composition (c/v)",
        value: 2,
        min: 0,
        max: 1000,
        step: 0.01,
        unit: "T",
        equation: "c/v",
        description: "Ratio of constant to variable capital",
        measurementMethod: "Ratio of means of production to wages",
        category: "ratio",
        dimension: "T",
        isDerived: false
    },
    rateOfProfit: {
        name: "Rate of Profit (s/(c+v))",
        value: 0.33,
        min: 0,
        max: 1,
        step: 0.01,
        unit: "T^-1",
        equation: "s/(c+v)",
        description: "Ratio of surplus value to total capital",
        measurementMethod: "Ratio of profit to total capital advanced",
        category: "ratio",
        dimension: "T^-1",
        isDerived: true
    },

    // Subjective Factors
    classStruggle: {
        name: 'Class Struggle Factor',
        value: 0,
        min: -1,
        max: 1,
        step: 0.01,
        unit: 'T^-1',
        equation: 'CS',
        description: 'Balance of power between workers and capital',
        measurementMethod: 'Class struggle intensity',
        category: 'subjective',
        dimension: 'T^-1',
        isDerived: false,
        verificationData: undefined
    },
    melt: {
        name: 'Monetary Expression of Labor Time (MELT)',
        value: 0,
        min: 0,
        max: 100,
        step: 0.01,
        unit: 'M/PT',
        equation: 'MELT(t+1) = MELT(t) × (1 + ΔM/M) ÷ (1 + Δ(c/v))',
        description: 'Conversion rate between labor-time and money, determined by money supply and labor productivity',
        measurementMethod: 'Ratio of total money supply to total labor time',
        category: 'subjective',
        dimension: 'M/PT',
        isDerived: false,
        verificationData: undefined
    },
    fictitiousCapitalProduction: {
        name: 'Fictitious Capital Spending Rate',
        value: 0,
        min: 0,
        max: 1,
        step: 0.01,
        unit: 'R',
        equation: 'fcs',
        description: 'Proportion of surplus value diverted to fictitious capital',
        measurementMethod: 'Ratio of surplus value diverted',
        category: 'subjective',
        dimension: 'R',
        isDerived: false,
        verificationData: undefined
    },
    accumulatedFictitiousCapital: {
        name: 'Accumulated Fictitious Capital',
        value: 0,
        min: 0,
        max: 1000,
        step: 0.01,
        unit: 'P',
        equation: 'f = previous_f + (s × fcs)',
        description: 'Total amount of surplus value diverted to fictitious capital',
        measurementMethod: 'Sum of diverted surplus value',
        category: 'subjective',
        dimension: 'P',
        isDerived: false,
        verificationData: undefined
    },

    // Bourgeois Economics
    moneySupply: {
        name: 'Money Supply',
        value: 1000,
        min: 0,
        max: 10000,
        step: 0.01,
        unit: 'M',
        equation: 'M',
        description: 'Total amount of money in circulation',
        measurementMethod: 'Sum of all money in circulation',
        category: 'bourgeois',
        dimension: 'M',
        isDerived: false,
        verificationData: undefined
    },
    moneyPrintingRate: {
        name: 'Money Printing Rate',
        value: 0,
        min: -1,
        max: 1,
        step: 0.01,
        unit: 'T^-1',
        equation: 'ΔM/M',
        description: 'Rate of change in money supply',
        measurementMethod: 'Percentage change in money supply',
        category: 'bourgeois',
        dimension: 'T^-1',
        isDerived: false,
        verificationData: undefined
    },
    inflation: {
        name: 'Inflation Rate',
        value: 0,
        min: -1,
        max: 1,
        step: 0.01,
        unit: 'T^-1',
        equation: 'ΔM/M - ΔMELT/MELT',
        description: 'Rate of price level change, derived from money supply growth minus MELT change',
        measurementMethod: 'Difference between money supply growth rate and MELT change rate',
        category: 'bourgeois',
        dimension: 'T^-1',
        isDerived: true,
        verificationData: undefined
    },
    wageGrowth: {
        name: 'Wage Growth Rate',
        value: 0,
        min: -2,
        max: 2,
        step: 0.01,
        unit: 'T^-1',
        equation: 'CS - i',
        description: 'Rate of real wage change',
        measurementMethod: 'Real wage change',
        category: 'bourgeois',
        dimension: 'T^-1',
        isDerived: true,
        verificationData: undefined
    },
    productivity: {
        name: 'Labor Productivity',
        value: 2,
        min: 0,
        max: 10,
        step: 0.01,
        unit: 'T',
        equation: 'c/v',
        description: 'Output per unit of labor (derived from organic composition)',
        measurementMethod: 'Ratio of constant capital to variable capital',
        category: 'bourgeois',
        dimension: 'T',
        isDerived: true,
        verificationData: undefined
    }
}; 