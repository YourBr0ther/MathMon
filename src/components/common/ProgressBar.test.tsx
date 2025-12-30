import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/testUtils';
import { ProgressBar, CatchProgress } from './ProgressBar';

describe('ProgressBar', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<ProgressBar current={5} max={10} />);
      expect(document.querySelector('.progress-bar-kawaii')).toBeInTheDocument();
    });

    it('should render the fill element', () => {
      render(<ProgressBar current={5} max={10} />);
      expect(document.querySelector('.progress-bar-fill')).toBeInTheDocument();
    });
  });

  describe('percentage calculation', () => {
    it('should calculate correct percentage for 50%', () => {
      render(<ProgressBar current={5} max={10} animated={false} />);
      const fill = document.querySelector('.progress-bar-fill');
      expect(fill).toHaveStyle({ width: '50%' });
    });

    it('should calculate correct percentage for 100%', () => {
      render(<ProgressBar current={10} max={10} animated={false} />);
      const fill = document.querySelector('.progress-bar-fill');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('should calculate correct percentage for 0%', () => {
      render(<ProgressBar current={0} max={10} animated={false} />);
      const fill = document.querySelector('.progress-bar-fill');
      expect(fill).toHaveStyle({ width: '0%' });
    });

    it('should cap at 100% even if current exceeds max', () => {
      render(<ProgressBar current={15} max={10} animated={false} />);
      const fill = document.querySelector('.progress-bar-fill');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('should not go below 0%', () => {
      render(<ProgressBar current={-5} max={10} animated={false} />);
      const fill = document.querySelector('.progress-bar-fill');
      expect(fill).toHaveStyle({ width: '0%' });
    });
  });

  describe('height variations', () => {
    it('should apply small height', () => {
      render(<ProgressBar current={5} max={10} height="small" />);
      expect(document.querySelector('.progress-bar-kawaii')).toHaveClass('h-2');
    });

    it('should apply medium height by default', () => {
      render(<ProgressBar current={5} max={10} />);
      expect(document.querySelector('.progress-bar-kawaii')).toHaveClass('h-3');
    });

    it('should apply large height', () => {
      render(<ProgressBar current={5} max={10} height="large" />);
      expect(document.querySelector('.progress-bar-kawaii')).toHaveClass('h-4');
    });
  });

  describe('label', () => {
    it('should not show label by default', () => {
      render(<ProgressBar current={5} max={10} />);
      expect(screen.queryByText('5 / 10')).not.toBeInTheDocument();
    });

    it('should show label when showLabel is true', () => {
      render(<ProgressBar current={5} max={10} showLabel />);
      expect(screen.getByText('5 / 10')).toBeInTheDocument();
    });

    it('should show correct values in label', () => {
      render(<ProgressBar current={25} max={100} showLabel />);
      expect(screen.getByText('25 / 100')).toBeInTheDocument();
    });
  });
});

describe('CatchProgress', () => {
  describe('rendering', () => {
    it('should render 5 dots by default', () => {
      render(<CatchProgress correctCount={0} />);
      const dots = document.querySelectorAll('.progress-dot');
      expect(dots).toHaveLength(5);
    });

    it('should render custom number of dots', () => {
      render(<CatchProgress correctCount={0} maxCount={3} />);
      const dots = document.querySelectorAll('.progress-dot');
      expect(dots).toHaveLength(3);
    });
  });

  describe('filled state', () => {
    it('should fill correct number of dots', () => {
      render(<CatchProgress correctCount={3} />);
      const filledDots = document.querySelectorAll('.progress-dot-filled');
      expect(filledDots).toHaveLength(3);
    });

    it('should have no filled dots when correctCount is 0', () => {
      render(<CatchProgress correctCount={0} />);
      const filledDots = document.querySelectorAll('.progress-dot-filled');
      expect(filledDots).toHaveLength(0);
    });

    it('should fill all dots when correctCount equals maxCount', () => {
      render(<CatchProgress correctCount={5} maxCount={5} />);
      const filledDots = document.querySelectorAll('.progress-dot-filled');
      expect(filledDots).toHaveLength(5);
    });

    it('should handle correctCount exceeding maxCount', () => {
      render(<CatchProgress correctCount={7} maxCount={5} />);
      const filledDots = document.querySelectorAll('.progress-dot-filled');
      expect(filledDots).toHaveLength(5);
    });
  });
});
