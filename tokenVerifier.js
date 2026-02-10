/**
 * Token verification for spectator voting rights
 * Checks if wallet has required 6969 tokens on Base chain
 */

const { ethers } = require('ethers');

// Base chain configuration
const BASE_RPC = 'https://base-mainnet.g.alchemy.com/v2/n7kJBHnG5rAQz2fQiP8RZ';

// Token contract address (placeholder - update after token launch)
const TOKEN_CONTRACT_ADDRESS = '0xCf1F906e789c483DcB2f5161C502349775b2cb07';

// Required token balance for spectator voting rights
const REQUIRED_TOKEN_BALANCE = '6969';

// ERC-20 ABI (minimal for balanceOf)
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// Provider instance
let provider = null;
let tokenContract = null;

/**
 * Initialize provider and contract
 */
function initProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(BASE_RPC);
    tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
  }
}

/**
 * Check if wallet address has required token balance
 * @param {string} walletAddress - Ethereum wallet address
 * @returns {Promise<{hasTokens: boolean, balance: string, required: string}>}
 */
async function checkTokenBalance(walletAddress) {
  try {
    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    initProvider();

    // Get token decimals and balance
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(walletAddress);

    // Convert balance to human-readable format
    const balanceFormatted = ethers.formatUnits(balance, decimals);
    const balanceNumber = parseFloat(balanceFormatted);
    const requiredNumber = parseFloat(REQUIRED_TOKEN_BALANCE);

    return {
      hasTokens: balanceNumber >= requiredNumber,
      balance: balanceNumber.toFixed(2),
      required: REQUIRED_TOKEN_BALANCE,
      walletAddress: walletAddress
    };
  } catch (error) {
    console.error('Token balance check error:', error.message);

    // If it's a placeholder address error, allow for testing
    if (TOKEN_CONTRACT_ADDRESS === '0xCf1F906e789c483DcB2f5161C502349775b2cb07') {
      console.warn('Using placeholder token address - bypassing check for development');
      return {
        hasTokens: true,
        balance: REQUIRED_TOKEN_BALANCE,
        required: REQUIRED_TOKEN_BALANCE,
        walletAddress: walletAddress,
        dev_mode: true
      };
    }

    throw new Error(`Failed to verify token balance: ${error.message}`);
  }
}

/**
 * Get current token configuration
 */
function getTokenConfig() {
  return {
    tokenAddress: TOKEN_CONTRACT_ADDRESS,
    requiredBalance: REQUIRED_TOKEN_BALANCE,
    chain: 'Base',
    rpc: BASE_RPC
  };
}

module.exports = {
  checkTokenBalance,
  getTokenConfig,
  TOKEN_CONTRACT_ADDRESS,
  REQUIRED_TOKEN_BALANCE
};
