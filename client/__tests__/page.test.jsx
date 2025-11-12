// Test for client/app/page.js
import React from "react";
import { render, screen } from '@testing-library/react';

// Mock next/image
jest.mock('next/image', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => {
      const { src, alt, ...rest } = props;
      return React.createElement('img', { src, alt, ...rest });
    },
  };
});

// Mock next/link
jest.mock('next/link', () => {
  const React = require('react');
  return ({ children, href, ...props }) => {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock framer-motion - filter out non-DOM props
jest.mock('framer-motion', () => {
  const React = require('react');
  const createElement = (type, props, ...children) => {
    if (!props) props = {};
    // Filter out framer-motion specific props
    const {
      initial,
      animate,
      exit,
      transition,
      whileInView,
      viewport,
      variants,
      ...domProps
    } = props;
    return React.createElement(type, domProps, ...children);
  };
  return {
    motion: {
      div: (props) => createElement('div', props, props.children),
      h1: (props) => createElement('h1', props, props.children),
      p: (props) => createElement('p', props, props.children),
      h2: (props) => createElement('h2', props, props.children),
      h3: (props) => createElement('h3', props, props.children),
    },
  };
});

// Mock useWallet hook
jest.mock('../hooks/useWallet', () => ({
  useWallet: () => ({
    provider: null,
    signer: null,
    account: null,
    connectWallet: jest.fn(),
    isConnected: false,
    error: null,
  }),
}));

// Mock useLottery hook
jest.mock('../hooks/useLottery', () => ({
  useLottery: () => ({
    jackpot: '0.0',
    playersCount: 0,
    isLoading: false,
  }),
}));

// Mock MetaMaskModal component
jest.mock('../components/MetaMaskModal', () => {
  const React = require('react');
  return function MetaMaskModal({ isOpen }) {
    return isOpen ? React.createElement('div', { 'data-testid': 'metamask-modal' }, 'MetaMask Modal') : null;
  };
});

const Home = require('../app/page').default;

test('renders the main heading and content', () => {
  render(React.createElement(Home));
  
  // Check for main heading (appears multiple times, use getAllByText)
  const blockLuckyElements = screen.getAllByText(/BlockLucky/i);
  expect(blockLuckyElements.length).toBeGreaterThan(0);
  
  // Check for subtitle
  expect(screen.getByText(/Decentralized Lottery/i)).toBeInTheDocument();
  
  // Check for CTA button (appears multiple times, use getAllByText)
  const connectWalletElements = screen.getAllByText(/Connect Wallet/i);
  expect(connectWalletElements.length).toBeGreaterThan(0);
  
  // Check for "How It Works" section
  expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
  
  // Check for "Live on Ethereum" badge
  expect(screen.getByText(/Live on Ethereum/i)).toBeInTheDocument();
});
