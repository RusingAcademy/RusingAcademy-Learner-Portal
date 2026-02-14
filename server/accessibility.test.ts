/**
 * Accessibility Configuration Tests
 * 
 * These tests verify that accessibility utilities and configurations are properly set up
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('Accessibility Configuration Tests', () => {
  describe('CSS Accessibility Utilities', () => {
    it('should have focus-visible styles in index.css', () => {
      const indexCss = fs.readFileSync(
        path.join(projectRoot, 'client/src/index.css'),
        'utf-8'
      );
      expect(indexCss).toContain('focus-visible');
    });

    it('should have skip-link utility class', () => {
      const indexCss = fs.readFileSync(
        path.join(projectRoot, 'client/src/index.css'),
        'utf-8'
      );
      expect(indexCss).toContain('.skip-link');
    });

    it('should have reduced-motion media query', () => {
      const indexCss = fs.readFileSync(
        path.join(projectRoot, 'client/src/index.css'),
        'utf-8'
      );
      expect(indexCss).toContain('prefers-reduced-motion');
    });

    it('should have touch-target utility for mobile accessibility', () => {
      const indexCss = fs.readFileSync(
        path.join(projectRoot, 'client/src/index.css'),
        'utf-8'
      );
      expect(indexCss).toContain('.touch-target');
    });
  });

  describe('Skip Link Implementation', () => {
    it('should have skip link in App.tsx', () => {
      const appTsx = fs.readFileSync(
        path.join(projectRoot, 'client/src/App.tsx'),
        'utf-8'
      );
      expect(appTsx).toContain('skip-link');
      expect(appTsx).toContain('#main-content');
    });
  });

  describe('Design Tokens Accessibility', () => {
    it('should have dark mode settings in tokens.css', () => {
      const tokensCss = fs.readFileSync(
        path.join(projectRoot, 'client/src/styles/tokens.css'),
        'utf-8'
      );
      expect(tokensCss).toContain('.dark');
    });

    it('should have focus ring styles', () => {
      const tokensCss = fs.readFileSync(
        path.join(projectRoot, 'client/src/styles/tokens.css'),
        'utf-8'
      );
      expect(tokensCss).toContain(':focus-visible');
    });
  });
});

describe('Dashboard Accessibility', () => {
  describe('Learner Dashboard', () => {
    it('should exist', () => {
      const dashboardPath = path.join(projectRoot, 'client/src/pages/LearnerDashboard.tsx');
      expect(fs.existsSync(dashboardPath)).toBe(true);
    });

    it('should use accessible slate color scheme', () => {
      const dashboard = fs.readFileSync(
        path.join(projectRoot, 'client/src/pages/LearnerDashboard.tsx'),
        'utf-8'
      );
      expect(dashboard).toContain('slate');
    });
  });

  describe('Coach Dashboard', () => {
    it('should exist', () => {
      const dashboardPath = path.join(projectRoot, 'client/src/pages/CoachDashboard.tsx');
      expect(fs.existsSync(dashboardPath)).toBe(true);
    });
  });

  describe('HR Dashboard', () => {
    it('should exist', () => {
      const dashboardPath = path.join(projectRoot, 'client/src/pages/HRDashboard.tsx');
      expect(fs.existsSync(dashboardPath)).toBe(true);
    });
  });

  describe('Admin Reminders Dashboard', () => {
    it('should exist', () => {
      const dashboardPath = path.join(projectRoot, 'client/src/pages/AdminReminders.tsx');
      expect(fs.existsSync(dashboardPath)).toBe(true);
    });

    it('should use accessible slate color scheme', () => {
      const dashboard = fs.readFileSync(
        path.join(projectRoot, 'client/src/pages/AdminReminders.tsx'),
        'utf-8'
      );
      expect(dashboard).toContain('slate');
    });
  });
});
