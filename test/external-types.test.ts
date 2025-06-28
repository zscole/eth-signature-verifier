import { test, expect } from 'vitest'
import { verifyTypedData } from '../src/index.js'
import type { 
  EthersCompatibleDomain,
  EthersCompatibleTypes,
  ViemCompatibleDomain,
  ViemCompatibleTypes 
} from '../src/index.js'

test('accepts ethers-compatible types', () => {
  // This test demonstrates type compatibility without runtime ethers dependency
  const ethersDomain: EthersCompatibleDomain = {
    name: 'Test App',
    version: '1',
    chainId: 1
  }

  const ethersTypes: EthersCompatibleTypes = {
    Message: [
      { name: 'content', type: 'string' }
    ]
  }

  const value = { content: 'Hello World' }
  const address = '0x742d35Cc1C3c72AE4d5e4F0e3D1E3c7E5E8C1A2B'
  const signature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b'

  // Should not throw type errors and should return boolean
  const result = verifyTypedData(address, signature, ethersDomain, ethersTypes, value)
  expect(typeof result).toBe('boolean')
})

test('accepts viem-compatible types', () => {
  // This test demonstrates type compatibility without runtime viem dependency
  const viemDomain: ViemCompatibleDomain = {
    name: 'Test App',
    version: '1',
    chainId: 1
  }

  const viemTypes: ViemCompatibleTypes = {
    Message: [
      { name: 'content', type: 'string' }
    ]
  }

  const value = { content: 'Hello World' }
  const address = '0x742d35Cc1C3c72AE4d5e4F0e3D1E3c7E5E8C1A2B'
  const signature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b'

  // Should not throw type errors and should return boolean
  const result = verifyTypedData(address, signature, viemDomain, viemTypes, value)
  expect(typeof result).toBe('boolean')
}) 