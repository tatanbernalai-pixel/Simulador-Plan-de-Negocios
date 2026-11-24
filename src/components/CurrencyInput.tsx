import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === 0 || isNaN(value)) {
      setDisplayValue('');
    } else {
      setDisplayValue(new Intl.NumberFormat('es-CO').format(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (raw === '') {
      setDisplayValue('');
      onChange(0);
    } else {
      const num = parseInt(raw, 10);
      setDisplayValue(new Intl.NumberFormat('es-CO').format(num));
      onChange(num);
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
};
