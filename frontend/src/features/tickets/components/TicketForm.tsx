import React, { useState, useCallback } from 'react';
import { TextInput } from '../../../components/common/TextInput';
import { Button } from '../../../components/common/Button';
import { CreateTicketRequest } from '../../../types/Ticket';

interface TicketFormProps {
  onSubmit: (request: CreateTicketRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_EMAIL_LENGTH: 256,
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateField = (field: keyof CreateTicketRequest, value: string): string | null => {
  const trimmed = value.trim();

  switch (field) {
    case 'name':
      if (!trimmed) return 'Name is required';
      if (trimmed.length < VALIDATION_LIMITS.MIN_NAME_LENGTH) return `Name must be at least ${VALIDATION_LIMITS.MIN_NAME_LENGTH} character`;
      if (value.length > VALIDATION_LIMITS.MAX_NAME_LENGTH) return `Name cannot exceed ${VALIDATION_LIMITS.MAX_NAME_LENGTH} characters`;
      return null;

    case 'email':
      if (!trimmed) return 'Email is required';
      if (value.length > VALIDATION_LIMITS.MAX_EMAIL_LENGTH) return `Email cannot exceed ${VALIDATION_LIMITS.MAX_EMAIL_LENGTH} characters`;
      if (!EMAIL_REGEX.test(value)) return 'Invalid email format';
      return null;

    case 'description':
      if (!trimmed) return 'Issue Description is required';
      if (trimmed.length < VALIDATION_LIMITS.MIN_DESCRIPTION_LENGTH) return `Issue Description must be at least ${VALIDATION_LIMITS.MIN_DESCRIPTION_LENGTH} characters`;
      if (value.length > VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH) return `Issue Description cannot exceed ${VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH} characters`;
      return null;

    default:
      return null;
  }
};

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<CreateTicketRequest>({
    name: '',
    email: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof CreateTicketRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof CreateTicketRequest>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextInput
        label="Name"
        value={formData.name}
        onChange={(value) => updateField('name', value)}
        error={errors.name}
        placeholder="Enter your full name"
        required
        maxLength={VALIDATION_LIMITS.MAX_NAME_LENGTH}
      />

      <TextInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        error={errors.email}
        placeholder="your.email@example.com"
        required
        maxLength={VALIDATION_LIMITS.MAX_EMAIL_LENGTH}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Issue Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe your issue in detail (minimum 10 characters)..."
          className={`w-full px-4 py-3 bg-white border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 resize-y min-h-[120px] ${errors.description
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400'
            }`}
          rows={5}
          maxLength={VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH}
        />
        <div className="flex justify-between items-center">
          {errors.description && (
            <p className="text-red-600 text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.description}
            </p>
          )}
          <span className={`text-xs text-gray-500 ${errors.description ? '' : 'ml-auto'}`}>
            {formData.description.length} / {VALIDATION_LIMITS.MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Creating...
            </span>
          ) : (
            'Create Ticket'
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
