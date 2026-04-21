import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CareersJobBoard from '../src/components/CareersJobBoard';

const mockJobs = [
  {
    id: 'admin-officer',
    title: 'Admin Officer',
    department: 'Office',
    location: 'Indonesia, Kendal',
    type: 'Full-Time',
    arrangement: 'On-site',
    description: 'Handle admin operations.',
  },
  {
    id: 'mold-engineer',
    title: 'Mold Engineer',
    department: 'Production',
    location: 'Indonesia, Kendal',
    type: 'Full-Time',
    description: 'Design molds.',
  },
];

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve(mockJobs),
  } as Response);
});

describe('CareersJobBoard', () => {
  it('renders filter buttons in English', async () => {
    render(<CareersJobBoard lang="en" />);
    await waitFor(() => expect(screen.getByText('Admin Officer')).toBeInTheDocument());
    expect(screen.getByText('All Departments')).toBeInTheDocument();
    const filterBar = document.querySelector('.filter-bar')!;
    expect(filterBar).toHaveTextContent('Office');
    expect(filterBar).toHaveTextContent('Production');
  });

  it('filters jobs by department', async () => {
    render(<CareersJobBoard lang="en" />);
    await waitFor(() => expect(screen.getByText('Admin Officer')).toBeInTheDocument());

    const filterBtns = document.querySelectorAll('.filter-btn');
    const productionBtn = Array.from(filterBtns).find(b => b.textContent === 'Production')!;
    fireEvent.click(productionBtn);
    expect(screen.queryByText('Admin Officer')).not.toBeInTheDocument();
    expect(screen.getByText('Mold Engineer')).toBeInTheDocument();
  });

  it('shows all jobs when All Departments clicked', async () => {
    render(<CareersJobBoard lang="en" />);
    await waitFor(() => expect(screen.getByText('Admin Officer')).toBeInTheDocument());

    const filterBtns = document.querySelectorAll('.filter-btn');
    const productionBtn = Array.from(filterBtns).find(b => b.textContent === 'Production')!;
    fireEvent.click(productionBtn);
    fireEvent.click(screen.getByText('All Departments'));
    expect(screen.getByText('Admin Officer')).toBeInTheDocument();
    expect(screen.getByText('Mold Engineer')).toBeInTheDocument();
  });

  it('opens apply modal when Apply Now clicked', async () => {
    render(<CareersJobBoard lang="en" />);
    await waitFor(() => expect(screen.getByText('Admin Officer')).toBeInTheDocument());

    const applyLinks = screen.getAllByText('Apply Now →');
    fireEvent.click(applyLinks[0]);
    expect(screen.getByText('Apply for this position')).toBeInTheDocument();
  });

  it('renders Chinese filter labels', async () => {
    render(<CareersJobBoard lang="cn" />);
    await waitFor(() => expect(screen.getByText('所有部門')).toBeInTheDocument());
    expect(screen.getByText('辦公室')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    render(<CareersJobBoard lang="en" />);
    await waitFor(() => expect(screen.getByText('Unable to load job listings.')).toBeInTheDocument());
  });
});
