const SaigonTechCoin = require("../ignition/modules/SaigonTechCoin");
const HighLowBetGame = require("../ignition/modules/HighLowBetGame");
const web3 = require("web3");
const fs = require("fs");
(async () => {
  const ownerAddress = "0x256c5De8fcCA0C2FE4701f809ca577eee7Ee39f1";
  const { saigonTechCoin } = await hre.ignition.deploy(SaigonTechCoin, {
    parameters: { SaigonTechCoin: { defaultAdmin: ownerAddress } }
  });

  const coinAddress = await saigonTechCoin.getAddress();
  console.log("SaigonTechCoin deployed to:", coinAddress);

  const { betGame } = await hre.ignition.deploy(HighLowBetGame, {
    parameters: { HighLowBetGame: { _token: coinAddress } }
  });

  console.log("HighLowBetGame deployed to:", await betGame.getAddress());


  const stcArtifact = await hre.artifacts.readArtifact("SaigonTechCoin");

  const gameArtifact = await hre.artifacts.readArtifact("HighLowBetGame");

  artifacts = `
    const STC_ABI = ${JSON.stringify(stcArtifact.abi)};
    const HIGHLOWBETGAME_ABI = ${JSON.stringify(gameArtifact.abi)};
    `;
  addresses = `
    const STC_ADDRESS = "${coinAddress}";
    const HIGHLOWBETGAME_ADDRESS = "${await betGame.getAddress()}";
    `;

  fs.writeFileSync("./web3/js/abis.js", artifacts);
  fs.writeFileSync("./web3/js/addresses.js", addresses);

})().catch(console.error);
