import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { US_STATES } from '../../constants/usStates';

interface USStateSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  valueType?: 'code' | 'name';
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/**
 * US State Select component with mobile-optimized touch scrolling.
 * Wraps shadcn/ui Select with proper mobile scroll behavior for iOS and Android.
 */
export default function USStateSelect({
  id,
  value,
  onValueChange,
  placeholder = 'Select state',
  disabled = false,
  valueType = 'code',
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: USStateSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="mobile-scroll-select">
        {US_STATES.map((state) => (
          <SelectItem
            key={state.code}
            value={valueType === 'code' ? state.code : state.name}
          >
            {state.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
