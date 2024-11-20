window.addEventListener('load', async function () {
  if (web3_check_metamask()) {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    if (accounts != undefined && accounts.length > 0) {
      setLoginName(accounts[0]);
      const stcBalance = await getSTCBalance(web3, accounts[0]);
      setSTCBalance(stcBalance);
      console.log(stcBalance);
    }

    const HighLowBetGame = new web3.eth.Contract(HIGHLOWBETGAME_ABI, HIGHLOWBETGAME_ADDRESS);
    const isAdmin = await HighLowBetGame.methods.hasRole(web3.utils.keccak256("MANAGER_ROLE"), window.activeAccount).call({ from: window.activeAccount });
    console.log(isAdmin);
    const resultSet = await loadResults(web3);
    await loadGames(isAdmin, resultSet);
    loadHistories(web3, resultSet);
  }
  document.getElementById("login")?.addEventListener("click", async function (event) {
    event.preventDefault();
    if (web3_check_metamask()) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      if (accounts != undefined) {
        setLoginName(accounts[0]);
        const stcBalance = await getSTCBalance(web3, accounts[0]);
        setSTCBalance(stcBalance);
        console.log(stcBalance);
      }
      console.log(accounts[0]);
    }
  });
  document.getElementById("btnHistory")?.addEventListener("click", async function (event) {
    event.preventDefault();
    document.getElementById("histories").style.display = "block";
    document.getElementById("matches").style.display = "none";
    document.getElementById("btnHistory").classList.add("navigation--item-current");
    document.getElementById("btnGame").classList.remove("navigation--item-current");
  });
  document.getElementById("btnGame")?.addEventListener("click", async function (event) {
    event.preventDefault();
    document.getElementById("histories").style.display = "none";
    document.getElementById("matches").style.display = "block";
    document.getElementById("btnGame").classList.add("navigation--item-current");
    document.getElementById("btnHistory").classList.remove("navigation--item-current");
  });
  document.getElementById("topupSubmit").addEventListener("click", async function (event) {
    event.preventDefault();
    if (web3_check_metamask()) {
      const web3 = new Web3(window.ethereum);
      if (window.activeAccount == undefined) {
        alert('Please login first');
        return;
      }
      const stcContract = new web3.eth.Contract(STC_ABI, STC_ADDRESS);
      const stcValue = document.getElementById("topupAmount").value;
      const modal = document.getElementById("topup-modal");
      modal.style.display = "none";
      const txResult = await stcContract.methods.TopUp().send({ from: window.activeAccount, value: stcValue * web3.utils.toWei('1', 'gwei'), gas: 3000000 });
      const stcBalance = await getSTCBalance(web3, window.activeAccount);
      const txapproveResult = await stcContract.methods.approve(HIGHLOWBETGAME_ADDRESS, stcBalance).send({ from: window.activeAccount, gas: 3000000 });
      console.log(txResult, txapproveResult);
      setSTCBalance(stcBalance);
      console.log(stcBalance);
    }
  });
  document.getElementById("cancelSubmit").addEventListener("click", async function (event) {
    event.preventDefault();
    const modal = document.getElementById("topup-modal");
    modal.style.display = "none";
  });
  document.getElementById("topup").addEventListener("click", async function (event) {
    event.preventDefault();
    const modal = document.getElementById("topup-modal");
    modal.style.display = "block";
  });
  jQuery("#matches").on("click", ".button--win", async function (event) {
    event.preventDefault();
    const gameId = jQuery(event.currentTarget).data("gameid");
    const team = jQuery(event.currentTarget).data("gameteam");
    jQuery(event.currentTarget).prop("disabled", true);
    if (web3_check_metamask()) {
      const web3 = new Web3(window.ethereum);
      if (window.activeAccount == undefined) {
        alert('Please login first');
        return;
      }
      const HighLowBetGame = new web3.eth.Contract(HIGHLOWBETGAME_ABI, HIGHLOWBETGAME_ADDRESS);
      try {
        const txResult = await HighLowBetGame.methods.SetGameResult(gameId, team == "AWAYTEAM" ? 1 : 0).send({ from: window.activeAccount, gas: 3000000 });
        console.log(txResult);
        jQuery(event.currentTarget).prop("disabled", false);
        alert('Set result successfully');
      } catch (error) {
        console.log(error);
        alert('Set result failed: ' + error.message);
        jQuery(event.currentTarget).prop("disabled", false);
      }
    }
  });
  jQuery("#matches").on("click", ".button--bet", async function (event) {
    event.preventDefault();
    const gameId = jQuery(event.currentTarget).data("gameid");
    const team = jQuery(event.currentTarget).data("gameteam");
    jQuery(event.currentTarget).prop("disabled", true);
    const amountInput = jQuery("input[data-gameId='" + gameId + "'][data-gameTeam='" + team + "']");
    const amount = amountInput.val();
    console.log(gameId, team, amount);
    if (web3_check_metamask()) {
      const web3 = new Web3(window.ethereum);
      if (window.activeAccount == undefined) {
        alert('Please login first');
        return;
      }
      const HighLowBetGame = new web3.eth.Contract(HIGHLOWBETGAME_ABI, HIGHLOWBETGAME_ADDRESS);
      try {
        const txResult = await HighLowBetGame.methods.PlaceBet(amount, gameId, team == "AWAYTEAM" ? 1 : 0).send({ from: window.activeAccount, gas: 3000000 });
        console.log(txResult);
        jQuery(event.currentTarget).prop("disabled", false);
        alert('Bet placed successfully');
        amountInput.val('');
        setSTCBalance(await getSTCBalance(web3, window.activeAccount));

      } catch (error) {
        console.log(error);
      }

      // console.log(txResult);
    }
  });
  jQuery("#histories").on("click", ".button--claim", async function (event) {
    event.preventDefault();
    const gameId = jQuery(event.currentTarget).data("gameid");
    jQuery(event.currentTarget).prop("disabled", true);
    if (web3_check_metamask()) {
      const web3 = new Web3(window.ethereum);
      if (window.activeAccount == undefined) {
        alert('Please login first');
        return;
      }

      const HighLowBetGame = new web3.eth.Contract(HIGHLOWBETGAME_ABI, HIGHLOWBETGAME_ADDRESS);
      try {
        const txResult = await HighLowBetGame.methods.ClaimPrize(gameId).send({ from: window.activeAccount, gas: 3000000 });
        console.log(txResult);
        jQuery(event.currentTarget).prop("disabled", false);
        alert('Claim successfully');
        setSTCBalance(await getSTCBalance(web3, window.activeAccount));
      } catch (error) {
        console.log(error);
        alert('Claim failed: ' + error.message);
        jQuery(event.currentTarget).prop("disabled", false);
      }
    }
  })
});

function setLoginName(account) {

  document.getElementById("apptitle").innerHTML = `<h3 class="appbar__title-text">Hello, ${account}</h3>`;
  window.activeAccount = account;
}

async function getSTCBalance(web3, account) {
  const stcContract = new web3.eth.Contract(STC_ABI, STC_ADDRESS);
  const stcBalance = await stcContract.methods.balanceOf(account).call();
  return stcBalance;
}
function setSTCBalance(balance) {
  document.getElementById("accountBalance").innerHTML = balance;
}

function web3_check_metamask() {
  if (!window.ethereum) {
    console.error('It seems that the MetaMask extension is not detected. Please install MetaMask first.');
    alert('It seems that the MetaMask extension is not detected. Please install MetaMask first.');
    return false;
  } else {
    console.log('MetaMask extension has been detected!!');
    return true;
  }
}

async function loadGames(isAdminRole, resultSet) {
  const response = await fetch(`/games`)
  const result = await response.json();
  console.log(result);
  window.games = result.matches;
  result.matches.forEach((match, idx) => {
    const matchDiv = document.createElement("a");
    const isgameFinished = resultSet.hasOwnProperty(match.id);
    matchDiv.className = isgameFinished ? "list__item game-finished" : "list__item";
    matchDiv.innerHTML = `<p style="width: 100%; text-align: center;">${match.utcDate}</p>
    <img src="${match.competition.emblem}" class="list__icon"/>
    <div class="list__details">
      <h3>${match.homeTeam.name}</h3>
      <input type="number" class="list__input " data-gameId="${match.id}" ${isgameFinished ? "disabled" : ""} data-gameTeam="HOMETEAM" placeholder="Enter your bet amount" />
      <div class="list__item-footer">
        <button class="button button--secondary button--bet" data-gameId="${match.id}" ${isgameFinished ? "disabled" : ""} data-gameTeam="HOMETEAM">
              Bet
        </button>
        ${isAdminRole ? `<button class="button button--primary button--win" data-gameId="${match.id}" ${isgameFinished ? "disabled" : ""} data-gameTeam="HOMETEAM">
              Win
        </button>` : ""}
      </div>
    </div>
    <h2>VS.</h2>
    <div class="list__details">
      <h3>${match.awayTeam.name}</h3>
      <input type="number" class="list__input" data-gameId="${match.id}" data-gameTeam="AWAYTEAM" ${isgameFinished ? "disabled" : ""} placeholder="Enter your bet amount" />
      <div class="list__item-footer">
        <button class="button button--secondary button--bet" data-gameId="${match.id}" ${isgameFinished ? "disabled" : ""} data-gameTeam="AWAYTEAM">
              Bet
        </button>
         ${isAdminRole ? `<button class="button button--primary button--win" data-gameId="${match.id}" ${isgameFinished ? "disabled" : ""} data-gameTeam="AWAYTEAM">
              Win
        </button>` : ""}
      </div>
    </div>`;
    document.getElementById("matches").appendChild(matchDiv);
  });
}

async function loadHistories(web3, resultSet) {
  const HighLowBetGame = new web3.eth.Contract(HIGHLOWBETGAME_ABI, HIGHLOWBETGAME_ADDRESS);
  const events = await HighLowBetGame.getPastEvents('BetPlaced', { fromBlock: 0, toBlock: 'latest', filter: { _owner: window.activeAccount } });
  console.log(events);
  const games = {};
  events.forEach((event, idx) => {
    const team = event.returnValues._betTeam == 1 ? "Away Team" : "Home Team";
    if (games[event.returnValues._gameId] == undefined) {
      games[event.returnValues._gameId] = {};
      games[event.returnValues._gameId]["amount"] = 0n;
      games[event.returnValues._gameId]["team"] = team;
    }
    games[event.returnValues._gameId]["amount"] += event.returnValues._tokenAmount;
  });
  for (const [gameId, gameData] of Object.entries(games)) {
    const isgameFinished = resultSet.hasOwnProperty(gameId);
    const eventDiv = document.createElement("div");
    const game = findGameById(gameId);
    eventDiv.className = "list__item";
    eventDiv.innerHTML = `<h3>Match: ${game.homeTeam.name} vs ${game.awayTeam.name}</h3>
    <h3>Bet Team: ${gameData["team"]}</h3>
    <h3>Amount: ${gameData["amount"]}</h3>
    <button class="button button--primary button--claim" ${isgameFinished ? "" : "disabled"} data-gameId="${gameId}">
              Claim
        </button>`;
    document.getElementById("histories").appendChild(eventDiv);
  }
}
async function loadResults(web3) {
  const HighLowBetGame = new web3.eth.Contract(HIGHLOWBETGAME_ABI, HIGHLOWBETGAME_ADDRESS);
  const events = await HighLowBetGame.getPastEvents('GameResultSet', { fromBlock: 0, toBlock: 'latest' });
  console.log(events);
  const games = {};
  events.forEach((event, idx) => {
    const winningTeam = event.returnValues._winningTeam == 1 ? "Away Team" : "Home Team";
    if (games[event.returnValues._gameId] == undefined) {
      games[event.returnValues._gameId] = winningTeam;
    }
  });
  return games;
}
function findGameById(gameId) {
  return window.games.find(game => game.id == gameId);
}

