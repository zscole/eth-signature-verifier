import { hashPersonalMessage, recoverAddress, hashTypedData } from './utils.js'
import type { TypedDataDomain, TypedDataTypes } from './types.js'

/**
 * Verifies an Ethereum signature created with personal_sign or eth_sign
 */
export function verifyMessage(
  address: string,
  message: string,
  signature: string
): boolean {
  try {
    const msgHash = hashPersonalMessage(message)
    const recovered = recoverAddress(msgHash, signature)
    return address.toLowerCase() === recovered.toLowerCase()
  } catch {
    return false
  }
}

/**
 * Verifies an EIP-712 typed data signature
 */
export function verifyTypedData(
  address: string,
  signature: string,
  domain: TypedDataDomain,
  types: TypedDataTypes,
  value: Record<string, any>
): boolean {
  try {
    const digest = hashTypedData(domain, types, value)
    const recovered = recoverAddress(digest, signature)
    return address.toLowerCase() === recovered.toLowerCase()
  } catch {
    return false
  }
}

export type { TypedDataDomain, TypedDataTypes } from './types.js'
