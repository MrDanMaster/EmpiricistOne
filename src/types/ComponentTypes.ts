import { EconomicVariable } from './EconomicTypes';

export interface SliderProps {
    variable: EconomicVariable;
    onChange: (value: number) => void;
    disabled?: boolean;
    step?: number;
}

export interface VariableDetailsProps {
    variable: EconomicVariable;
    isSelected: boolean;
    onSelect: () => void;
} 