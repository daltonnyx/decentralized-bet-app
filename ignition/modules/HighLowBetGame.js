const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const web3 = require("web3");


module.exports = buildModule("HighLowBetGame", (m) => {
  //Set default admin to my self, should be we as a parameter
  const tokenAddr = m.getParameter("_token");
  const betGame = m.contract("HighLowBetGame", [tokenAddr]);

  const managerAddresses = ["0x256c5De8fcCA0C2FE4701f809ca577eee7Ee39f1", "0xEfe366A999d1634f1fbc9F394Ff64eFECe6759d3"];
  managerAddresses.forEach((managerAddress, i) => {
    m.call(betGame, "grantRole", [web3.utils.keccak256("MANAGER_ROLE"), managerAddress], { id: `a${i + 1}` });
  });
  return { betGame };
});
