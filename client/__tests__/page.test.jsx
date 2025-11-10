// Simple test for client/app/page.js
import React from "react";
import { render, screen } from '@testing-library/react';

// Mock next/image to a simple img so tests can render without Next's image loader
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

const Home = require('../app/page').default;

test('renders the main heading and links', () => {
  render(React.createElement(Home));
  expect(screen.getByText(/To get started, edit the page.js file./i)).toBeInTheDocument();
  expect(screen.getByText(/Templates/i)).toBeInTheDocument();
});
