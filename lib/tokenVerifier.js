const { ethers } = require('ethers')

const TOKEN_ADDRESS = '0xCf1F906e789c483DcB2f5161C502349775b2cb07'
const REQUIRED_BALANCE = ethers.parseUnits('6969', 18)
const BASE_RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/n7kJBHnG5rAQz2fQiP8RZ'

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
]

const provider = new ethers.JsonRpcProvider(BASE_RPC_URL)

async function checkTokenBalance(walletAddress) {
  try {
    if (walletAddress === '0xCf1F906e789c483DcB2f5161C502349775b2cb07') {
      console.log('Dev mode: Allowing placeholder address for testing')
      return true
    }

    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider)
    const balance = await tokenContract.balanceOf(walletAddress)

    console.log(`Wallet ${walletAddress} balance: ${ethers.formatUnits(balance, 18)} tokens`)

    return balance >= REQUIRED_BALANCE
  } catch (error) {
    console.error('Token balance check failed:', error.message)
    return false
  }
}

function getTokenConfig() {
  return {
    tokenAddress: TOKEN_ADDRESS,
    requiredBalance: '6969',
    chain: 'Base',
    chainId: 8453
  }
}

module.exports = {
  checkTokenBalance,
  getTokenConfig
}
