import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { Label } from './label';
import { Input } from './input';
import { FormField } from './form-field';
import { Select } from './select';
import { Checkbox } from './checkbox';
import { Radio } from './radio';
import { Switch } from './switch';
import { QuantityStepper } from './quantity-stepper';

describe('Form Primitives', () => {
  describe('Label', () => {
    it('renders label with accessible htmlFor and required indicator', () => {
      render(
        <Label htmlFor="email-input" required>
          E-mail de contato
        </Label>
      );

      const label = screen.getByText(/e-mail de contato/i);
      expect(label).toHaveAttribute('for', 'email-input');
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Input', () => {
    it('renders input, handles changes and applies focus and invalid styles', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Input placeholder="Digite seu nome" onChange={handleChange} />
      );

      const input = screen.getByPlaceholderText('Digite seu nome');
      expect(input).toBeInTheDocument();
      expect(input.className).toContain('border-border-default');

      fireEvent.change(input, { target: { value: 'Satoshi' } });
      expect(handleChange).toHaveBeenCalled();

      rerender(<Input placeholder="Digite seu nome" invalid />);
      const invalidInput = screen.getByPlaceholderText('Digite seu nome');
      expect(invalidInput).toHaveAttribute('aria-invalid', 'true');
      expect(invalidInput.className).toContain('border-feedback-error');
    });

    it('renders with left and right icons with appropriate padding', () => {
      render(
        <Input
          placeholder="Busca"
          leftIcon={<span data-testid="left">🔍</span>}
          rightIcon={<span data-testid="right">✖</span>}
        />
      );

      expect(screen.getByTestId('left')).toBeInTheDocument();
      expect(screen.getByTestId('right')).toBeInTheDocument();
      const input = screen.getByPlaceholderText('Busca');
      expect(input.className).toContain('pl-9');
      expect(input.className).toContain('pr-9');
    });
  });

  describe('FormField', () => {
    it('associates label, input, description and error with aria-describedby and aria-invalid', () => {
      render(
        <FormField
          id="username"
          label="Nome de usuário"
          required
          description="Seu identificador público no marketplace"
          error="Nome de usuário já cadastrado"
        >
          <Input />
        </FormField>
      );

      const label = screen.getByText('Nome de usuário');
      expect(label).toBeInTheDocument();

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'username');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-required', 'true');

      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('username-description');
      expect(describedBy).toContain('username-error');

      const description = screen.getByText('Seu identificador público no marketplace');
      expect(description).toHaveAttribute('id', 'username-description');

      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('id', 'username-error');
      expect(error).toHaveTextContent('Nome de usuário já cadastrado');
    });
  });

  describe('Select', () => {
    it('renders options, placeholder and responds to selection changes', () => {
      const handleChange = vi.fn();
      const options = [
        { value: 'eth', label: 'Ethereum (ETH)' },
        { value: 'polygon', label: 'Polygon (POL)' },
      ];

      render(
        <Select
          options={options}
          placeholder="Selecione a rede"
          defaultValue=""
          onChange={handleChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(screen.getByText('Selecione a rede')).toBeInTheDocument();
      expect(screen.getByText('Ethereum (ETH)')).toBeInTheDocument();

      fireEvent.change(select, { target: { value: 'polygon' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Checkbox', () => {
    it('renders checkbox with accessible label and handles toggle', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          id="terms"
          label="Concordo com os termos"
          description="Ao continuar você aceita as regras da plataforma"
          onChange={handleChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Radio', () => {
    it('renders radio button and responds to selection', () => {
      const handleChange = vi.fn();
      render(
        <Radio
          id="metamask"
          name="wallet"
          value="metamask"
          label="MetaMask"
          onChange={handleChange}
        />
      );

      const radio = screen.getByRole('radio');
      expect(radio).not.toBeChecked();

      fireEvent.click(radio);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Switch', () => {
    it('renders switch role and toggles on click and keydown', () => {
      const handleToggle = vi.fn();
      render(
        <Switch
          label="Notificações em tempo real"
          onCheckedChange={handleToggle}
        />
      );

      const switchBtn = screen.getByRole('switch');
      expect(switchBtn).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(switchBtn);
      expect(handleToggle).toHaveBeenCalledWith(true);

      fireEvent.keyDown(switchBtn, { key: ' ' });
      expect(handleToggle).toHaveBeenCalledWith(true);
    });
  });

  describe('QuantityStepper', () => {
    it('increments and decrements whole integer quantities within min/max boundaries', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <QuantityStepper value={1} min={1} max={5} onChange={handleChange} />
      );

      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveValue(1);

      const decBtn = screen.getByRole('button', { name: 'Diminuir quantidade' });
      const incBtn = screen.getByRole('button', { name: 'Aumentar quantidade' });

      // At min, decrement is disabled
      expect(decBtn).toBeDisabled();
      expect(incBtn).not.toBeDisabled();

      fireEvent.click(incBtn);
      expect(handleChange).toHaveBeenCalledWith(2);

      // Re-render at max
      rerender(<QuantityStepper value={5} min={1} max={5} onChange={handleChange} />);
      expect(decBtn).not.toBeDisabled();
      expect(incBtn).toBeDisabled();

      fireEvent.click(decBtn);
      expect(handleChange).toHaveBeenCalledWith(4);
    });

    it('enforces whole integers on direct input typing', () => {
      const handleChange = vi.fn();
      render(<QuantityStepper value={2} min={1} max={10} onChange={handleChange} />);

      const spinbutton = screen.getByRole('spinbutton');
      fireEvent.change(spinbutton, { target: { value: '4.8' } });
      expect(handleChange).toHaveBeenCalledWith(4);
    });
  });
});
