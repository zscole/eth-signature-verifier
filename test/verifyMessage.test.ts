import { test, expect } from 'vitest'
import { verifyMessage } from '../src/index.js'
import { REAL_SIGNATURE_DATA } from './helpers/fixtures.js'

test('verifies valid personal_sign signature', () => {
  expect(verifyMessage(
    REAL_SIGNATURE_DATA.address,
    REAL_SIGNATURE_DATA.message,
    REAL_SIGNATURE_DATA.signature
  )).toBe(true)
})

test('returns false for wrong address', () => {
  const address = '0x742d35Cc1C3c72AE4d5e4F0e3D1E3c7E5E8C1A2B'
  expect(verifyMessage(
    address,
    REAL_SIGNATURE_DATA.message,
    REAL_SIGNATURE_DATA.signature
  )).toBe(false)
})

test('returns false for wrong message', () => {
  const message = 'Different message'
  expect(verifyMessage(
    REAL_SIGNATURE_DATA.address,
    message,
    REAL_SIGNATURE_DATA.signature
  )).toBe(false)
})

test('returns false for wrong signature', () => {
  const signature = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
  expect(verifyMessage(
    REAL_SIGNATURE_DATA.address,
    REAL_SIGNATURE_DATA.message,
    signature
  )).toBe(false)
})

test('handles address case insensitivity', () => {
  const address = REAL_SIGNATURE_DATA.address.toUpperCase()
  expect(verifyMessage(
    address,
    REAL_SIGNATURE_DATA.message,
    REAL_SIGNATURE_DATA.signature
  )).toBe(true)
})

test('returns false for malformed signature', () => {
  const signature = 'invalid'
  expect(verifyMessage(
    REAL_SIGNATURE_DATA.address,
    REAL_SIGNATURE_DATA.message,
    signature
  )).toBe(false)
})

test('returns false for empty message', () => {
  const message = ''
  expect(verifyMessage(
    REAL_SIGNATURE_DATA.address,
    message,
    REAL_SIGNATURE_DATA.signature
  )).toBe(false)
})

test('returns false for null values', () => {
  expect(verifyMessage(null as any, 'test', '0x123')).toBe(false)
  expect(verifyMessage('0x123', null as any, '0x123')).toBe(false)
  expect(verifyMessage('0x123', 'test', null as any)).toBe(false)
})

test('returns false for undefined values', () => {
  expect(verifyMessage(undefined as any, 'test', '0x123')).toBe(false)
  expect(verifyMessage('0x123', undefined as any, '0x123')).toBe(false)
  expect(verifyMessage('0x123', 'test', undefined as any)).toBe(false)
}) 