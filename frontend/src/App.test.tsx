import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Smart Inventory Application', () => {
  it('renders login screen when not authenticated', () => {
    localStorage.clear();
    render(<App />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin or manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In to Dashboard/i)).toBeInTheDocument();
  });

  it('renders demo evaluation profiles', () => {
    localStorage.clear();
    render(<App />);
    expect(screen.getByText(/1-Click Demo Profiles/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Admin$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Manager$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Staff$/i })).toBeInTheDocument();
  });
});

