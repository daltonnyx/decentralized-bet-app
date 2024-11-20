require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs");
require("dotenv").config();


const mnemonic = fs.readFileSync(".secret").toString().trim();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    saigontech: {
      url: process.env.NETWORK_URL,
      chainId: 11214,
      gasPrice: 30000000,
      accounts: {
        mnemonic: mnemonic,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10
      }
    }
  }
};
