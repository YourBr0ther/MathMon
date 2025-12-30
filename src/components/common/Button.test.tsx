import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/testUtils';
import { Button, IconButton } from './Button';

describe('Button', () => {
  describe('rendering', () => {
    it('should render children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('variants', () => {
    it('should apply primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary-kawaii');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-secondary-kawaii');
    });

    it('should apply pink variant', () => {
      render(<Button variant="pink">Pink</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-pink-kawaii');
    });

    it('should apply mint variant', () => {
      render(<Button variant="mint">Mint</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-mint-kawaii');
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-ghost-kawaii');
    });
  });

  describe('sizes', () => {
    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-7', 'py-3', 'text-base');
    });

    it('should apply small size', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-5', 'py-2', 'text-sm');
    });

    it('should apply large size', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-9', 'py-4', 'text-lg');
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should have disabled attribute when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('fullWidth', () => {
    it('should apply full width class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should not have full width class by default', () => {
      render(<Button>Normal</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });
});

describe('IconButton', () => {
  describe('rendering', () => {
    it('should render icon correctly', () => {
      render(<IconButton icon={<span data-testid="icon">X</span>} ariaLabel="Close" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      render(<IconButton icon={<span>X</span>} ariaLabel="Close" />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close');
    });
  });

  describe('sizes', () => {
    it('should apply medium size by default', () => {
      render(<IconButton icon={<span>X</span>} ariaLabel="Test" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-12', 'h-12');
    });

    it('should apply small size', () => {
      render(<IconButton icon={<span>X</span>} ariaLabel="Test" size="small" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10', 'h-10');
    });

    it('should apply large size', () => {
      render(<IconButton icon={<span>X</span>} ariaLabel="Test" size="large" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-14', 'h-14');
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<IconButton icon={<span>X</span>} ariaLabel="Close" onClick={handleClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<IconButton icon={<span>X</span>} ariaLabel="Close" onClick={handleClick} disabled />);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<IconButton icon={<span>X</span>} ariaLabel="Test" disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<IconButton icon={<span>X</span>} ariaLabel="Test" disabled />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });
});
