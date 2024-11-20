const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



module.exports = buildModule("SaigonTechCoin", (m) => {
  //Set default admin to my self, should be we as a parameter
  const defaultAdmin = m.getParameter("defaultAdmin");
  const saigonTechCoin = m.contract("SaigonTechCoin", [defaultAdmin]);


  return { saigonTechCoin };
});
