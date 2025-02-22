// examples/advanced/FormFields.tsx
import React, { useEffect }         from 'react';
import { BladeComponent, useBlade } from '@blade-to-react/core';

interface FormFieldsProps {
  initialData?: {
    type?: string;
    category?: string;
  };
}

@BladeComponent('form-fields')
export function FormFields({ initialData = {} }: FormFieldsProps) {
  const [formData, setFormData] = useBlade('clientForm');
  const [validationErrors, setValidationErrors] = useBlade('validationErrors');

  useEffect(() => {
    blade.listen('backend:validation', (errors) => {
      setValidationErrors(errors);
    });
    blade.listen('form:reset', () => {
      setFormData({});
      setValidationErrors({});
    });
  }, []);

  const handleSelectChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    blade.emit('form:changed', {
      field,
      value,
      isValid: true // Você pode adicionar validação aqui
    });
  };

  return (
    <div className="react-fields">
      <div className="form-group">
        <label>Tipo</label>
        <select
          value={formData?.type || ''}
          onChange={e => handleSelectChange('type', e.target.value)}
          className={validationErrors?.type ? 'is-invalid' : ''}
        >
          <option value="">Selecione...</option>
          <option value="individual">Individual</option>
          <option value="company">Empresa</option>
        </select>
        {validationErrors?.type && (
          <div className="invalid-feedback">{validationErrors.type}</div>
        )}
      </div>

      <div className="form-group">
        <label>Categoria</label>
        <select
          value={formData?.category || ''}
          onChange={e => handleSelectChange('category', e.target.value)}
          className={validationErrors?.category ? 'is-invalid' : ''}
        >
          <option value="">Selecione...</option>
          <option value="a">Categoria A</option>
          <option value="b">Categoria B</option>
        </select>
        {validationErrors?.category && (
          <div className="invalid-feedback">{validationErrors.category}</div>
        )}
      </div>
    </div>
  );
}