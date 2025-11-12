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
jest.mock('../hooks/useWallet', () => {
  const React = require('react');
  return {
    useWallet: () => ({
      provider: null,
      signer: null,
      account: null,
      connectWallet: jest.fn(),
      isConnected: false,
      error: null,
    }),
    WalletProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

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

test('affiche le hero BlockLucky avec les elements cles', () => {
  render(React.createElement(Home));

  expect(screen.getByRole('heading', { level: 1, name: /Block\s*Lucky/i })).toBeInTheDocument();
  expect(screen.getAllByText(/Loterie d'EtherBay/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Tentez de remporter la cagnotte/i)).toBeInTheDocument();
  expect(screen.getByText(/Cagnotte actuelle/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Se connecter pour participer/i })).toBeInTheDocument();
  expect(screen.getByText(/100% smart-contract/i)).toBeInTheDocument();
});
