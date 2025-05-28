
import React from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  placeholder: string;
  disabled: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  placeholder,
  disabled
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
          placeholder={placeholder}
          minLength={8}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
