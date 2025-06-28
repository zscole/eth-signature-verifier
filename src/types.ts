/**
 * EIP-712 Domain separator configuration
 * Used to prevent signature replay attacks across different domains
 */
export interface TypedDataDomain {
  /** Human-readable name of the signing domain */
  name?: string
  /** Current major version of the signing domain */
  version?: string
  /** Chain ID of the network */
  chainId?: number
  /** Address of the contract that will verify the signature */
  verifyingContract?: string
  /** Additional domain fields for future extensions */
  salt?: string
}

/**
 * Type definitions for EIP-712 structured data
 * Maps type names to their field definitions
 */
export interface TypedDataField {
  name: string
  type: string
}

export type TypedDataTypes = Record<string, TypedDataField[]>

/**
 * Parameters for message signature verification
 */
export interface VerifyMessageParams {
  /** Ethereum address that should have signed the message */
  address: string
  /** Original message that was signed */
  message: string
  /** Signature to verify (0x-prefixed hex string) */
  signature: string
}

/**
 * Parameters for EIP-712 typed data signature verification
 */
export interface VerifyTypedDataParams {
  /** Ethereum address that should have signed the data */
  address: string
  /** Signature to verify (0x-prefixed hex string) */
  signature: string
  /** Domain separator configuration */
  domain: TypedDataDomain
  /** Type definitions for the structured data */
  types: TypedDataTypes
  /** The actual data that was signed */
  value: Record<string, any>
}
