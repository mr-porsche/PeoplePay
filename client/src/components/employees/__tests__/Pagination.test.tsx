import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('should render page info', () => {
    render(<Pagination page={1} totalPages={5} total={100} onPageChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should disable previous on first page', () => {
    render(<Pagination page={1} totalPages={5} total={100} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('should disable next on last page', () => {
    render(<Pagination page={5} totalPages={5} total={100} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('should call onPageChange with page - 1', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} total={100} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with page + 1', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} total={100} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('should not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={10} onPageChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
