import {describe, expect, test, vi} from 'vitest';
import { render, screen} from '@testing-library/react';
import App from './App';

// Mock Firebase modules
vi.mock('./utilities/firebase', () => ({
  useAuthState: () => ({
    user: null,
    isAuthenticated: false,
    isInitialLoading: false,
  }),
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  useSightings: () => [[], false, undefined],
  addSighting: vi.fn(),
  corroborateSighting: vi.fn(),
}));

describe('counter tests', () => {
    
  test("Counter should be 0 at the start", () => {
    render(<App />);
    expect(screen.getByText('ICE Spy')).toBeDefined();
  });
});