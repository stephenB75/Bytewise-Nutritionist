/**
 * Bytewise Confetti Animation System
 * 
 * Brand-consistent confetti celebrations for achievements
 * Features:
 * - Canvas-based confetti animation
 * - Bytewise brand colors (pastel yellow/blue)
 * - 2-second celebration duration
 * - Performance optimized
 * - Mobile-friendly
 */

import React from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  gravity: number;
  life: number;
  decay: number;
}

// Bytewise brand colors for confetti
const BRAND_COLORS = [
  '#fef7cd', // pastel yellow
  '#a8dadc', // pastel blue  
  '#89c4c7', // pastel blue dark
  '#ffffff', // white
  '#f8f9fa', // light gray
  '#e9ecef', // muted
];

class ConfettiManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ConfettiParticle[] = [];
  private animationId: number | null = null;
  private isRunning = false;
  private startTime = 0;
  private duration = 2000; // 2 seconds

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupCanvas();
  }

  private setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  private createParticle(x: number, y: number): ConfettiParticle {
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    
    return {
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -12 - 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 8 + 4,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      gravity: 0.3 + Math.random() * 0.2,
      life: 1,
      decay: 0.01 + Math.random() * 0.01
    };
  }

  private drawParticle(particle: ConfettiParticle) {
    this.ctx.save();
    
    this.ctx.globalAlpha = particle.life;
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);
    
    this.ctx.fillStyle = particle.color;
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 1;
    
    const size = particle.size;
    
    switch (particle.shape) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'square':
        this.ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
        
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size / 2);
        this.ctx.lineTo(-size / 2, size / 2);
        this.ctx.lineTo(size / 2, size / 2);
        this.ctx.closePath();
        this.ctx.fill();
        break;
    }
    
    this.ctx.restore();
  }

  private updateParticle(particle: ConfettiParticle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.gravity;
    particle.rotation += particle.rotationSpeed;
    particle.life -= particle.decay;
    
    // Add some air resistance
    particle.vx *= 0.99;
    particle.vy *= 0.99;
  }

  private animate = (currentTime: number) => {
    if (!this.startTime) {
      this.startTime = currentTime;
    }
    
    const elapsed = currentTime - this.startTime;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles = this.particles.filter(particle => {
      this.updateParticle(particle);
      
      // Remove particles that are off screen or faded out
      if (particle.life <= 0 || 
          particle.y > this.canvas.height + 50 || 
          particle.x < -50 || 
          particle.x > this.canvas.width + 50) {
        return false;
      }
      
      this.drawParticle(particle);
      return true;
    });
    
    // Continue animation if within duration and particles exist
    if (elapsed < this.duration || this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.stop();
    }
  };

  public start(x?: number, y?: number) {
    if (this.isRunning) {
      this.stop();
    }
    
    this.isRunning = true;
    this.startTime = 0;
    this.particles = [];
    
    // Default to center of canvas
    const centerX = x ?? this.canvas.clientWidth / 2;
    const centerY = y ?? this.canvas.clientHeight / 3;
    
    // Create initial burst of particles
    for (let i = 0; i < 50; i++) {
      this.particles.push(this.createParticle(centerX, centerY));
    }
    
    // Add additional particles over time for continuous effect
    const particleInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(particleInterval);
        return;
      }
      
      for (let i = 0; i < 3; i++) {
        this.particles.push(this.createParticle(centerX, centerY));
      }
    }, 100);
    
    // Stop adding particles after 1 second
    setTimeout(() => {
      clearInterval(particleInterval);
    }, 1000);
    
    this.animationId = requestAnimationFrame(this.animate);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public destroy() {
    this.stop();
  }
}

// React component for confetti canvas
interface ConfettiCanvasProps {
  isActive: boolean;
  onComplete?: () => void;
  trigger?: number; // Change this to restart confetti
}

export function ConfettiCanvas({ isActive, onComplete, trigger }: ConfettiCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const managerRef = React.useRef<ConfettiManager | null>(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;

    managerRef.current = new ConfettiManager(canvasRef.current);

    return () => {
      managerRef.current?.destroy();
    };
  }, []);

  React.useEffect(() => {
    if (isActive && managerRef.current && canvasRef.current) {
      managerRef.current.start();
      
      // Auto-complete after 2 seconds
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, trigger, onComplete]);

  React.useEffect(() => {
    if (!isActive && managerRef.current) {
      managerRef.current.stop();
    }
  }, [isActive]);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (managerRef.current && canvasRef.current) {
        managerRef.current['setupCanvas']();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[100]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100,
        pointerEvents: 'none'
      }}
    />
  );
}

// Hook for confetti management
export function useConfetti() {
  const [isActive, setIsActive] = React.useState(false);
  const [trigger, setTrigger] = React.useState(0);

  const startConfetti = React.useCallback(() => {
    setIsActive(true);
    setTrigger(prev => prev + 1);
  }, []);

  const stopConfetti = React.useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    trigger,
    startConfetti,
    stopConfetti,
    ConfettiComponent: React.useCallback((props: Omit<ConfettiCanvasProps, 'isActive' | 'trigger'>) => (
      <ConfettiCanvas 
        isActive={isActive} 
        trigger={trigger} 
        {...props}
      />
    ), [isActive, trigger])
  };
}

// Utility function to trigger confetti from anywhere in the app
export function triggerConfettiCelebration() {
  // Dispatch custom event that the app can listen to
  window.dispatchEvent(new CustomEvent('bytewise-confetti', {
    detail: { duration: 2000 }
  }));
}