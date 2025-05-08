require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: "0.8.20",
  networks: {
    alfajores: {
      url: process.env.ALFAJORES_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};