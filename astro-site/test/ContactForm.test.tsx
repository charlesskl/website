import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactForm from '../src/components/ContactForm';

describe('ContactForm', () => {
  it('renders all required fields for English', () => {
    render(<ContactForm lang="en" />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('renders Chinese labels for cn lang', () => {
    render(<ContactForm lang="cn" />);
    expect(screen.getByLabelText('名字')).toBeInTheDocument();
    expect(screen.getByLabelText('姓氏')).toBeInTheDocument();
  });

  it('renders Indonesian labels for id lang', () => {
    render(<ContactForm lang="id" />);
    expect(screen.getByLabelText('Nama Depan')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', () => {
    const { container } = render(<ContactForm lang="en" />);
    const form = container.querySelector('form')!;
    fireEvent.submit(form);
    expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0);
  });

  it('validates email format', () => {
    render(<ContactForm lang="en" />);
    const email = screen.getByLabelText('Email Address');
    fireEvent.change(email, { target: { value: 'notanemail' } });
    // Fill other required fields
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Send Message →'));
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('updates progress bar as fields are filled', () => {
    const { container } = render(<ContactForm lang="en" />);
    const progressFill = container.querySelector('.form-progress-fill') as HTMLElement;
    expect(progressFill.style.width).toBe('0%');

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
    expect(progressFill.style.width).toBe('20%');
  });
});
