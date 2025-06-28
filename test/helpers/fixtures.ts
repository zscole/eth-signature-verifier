// Common test fixtures and utilities

export const REAL_SIGNATURE_DATA = {
  address: '0x663918f51479a1dd832929199296843d09d0f71a',
  message: 'Hello from fresh test',
  signature: '0xda689ba088beb48ceafea291888c4ad87f6cb3d9b2e45a4e8bf742b56ff8fa2f3f5fa686956810fe30171761489282af3a6e8047fd74591f81f822477be21e771b'
}

export const MOCK_SIGNATURE = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b'

export const MOCK_ADDRESS = '0x8ba1f109551bD432803012645Hac136c'

export const SAMPLE_EIP712_DOMAIN = {
  name: 'Test App',
  version: '1',
  chainId: 1
}

export const SAMPLE_EIP712_TYPES = {
  Message: [
    { name: 'content', type: 'string' },
    { name: 'timestamp', type: 'uint256' }
  ]
}

export const SAMPLE_EIP712_VALUE = {
  content: 'Hello World',
  timestamp: 1234567890
} 