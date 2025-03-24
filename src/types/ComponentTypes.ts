import { EconomicVariable } from './EconomicTypes';

export interface SliderProps {
    variable: EconomicVariable;
    onChange: (name: string, value: number) => void;
}

export interface VariableDetailsProps {
    variable: EconomicVariable;
    history: number[];
    verificationPoints?: number[];
} 