// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SaigonTechCoin.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HighLowBetGame is AccessControl {
    SaigonTechCoin private token;
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    enum team {
        HOMETEAM,
        AWAYTEAM
    }

    struct BetData {
        uint tokenAmount;
        team betTeam;
    }

    mapping(uint => bool) private gameFinished;

    mapping(uint => mapping(address => BetData)) private bets;

    mapping(uint => mapping(team => uint)) private totalBetAmount;

    mapping(uint => team) public gameResults;

    constructor(address _token) {
        token = SaigonTechCoin(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        //need to mint a certain amount of token to the contract
    }

    event BetPlaced(
        address indexed _owner,
        uint indexed _gameId,
        uint _tokenAmount,
        team _betTeam
    );

    event PrizeClaimed(
        address indexed _owner,
        uint indexed _gameId,
        uint _tokenAmount
    );

    event GameResultSet(uint indexed _gameId, team _winningTeam);

    function PlaceBet(uint _tokenAmount, uint _gameId, team _betTeam) public {
        require(
            _tokenAmount <= token.balanceOf(msg.sender),
            "Not enough token to place bet"
        );
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(_gameId > 0, "Game id must be greater than 0");
        require(
            gameFinished[_gameId] == false,
            "Game has already been finished"
        );
        bets[_gameId][msg.sender].tokenAmount = _tokenAmount;
        bets[_gameId][msg.sender].betTeam = _betTeam;
        token.transferFrom(msg.sender, address(this), _tokenAmount);
        totalBetAmount[_gameId][_betTeam] += _tokenAmount;
        emit BetPlaced(msg.sender, _gameId, _tokenAmount, _betTeam);
    }

    function GetBetRatio(uint _gameId) public view returns (uint) {
        uint totalBet = totalBetAmount[_gameId][team.HOMETEAM] +
            totalBetAmount[_gameId][team.AWAYTEAM];
        if (totalBet == 0) {
            return 0;
        }
        return (totalBetAmount[_gameId][team.HOMETEAM] * 100) / totalBet;
    }

    function SetGameResult(
        uint _gameId,
        team _winningTeam
    ) public onlyRole(MANAGER_ROLE) {
        require(!gameFinished[_gameId], "This game has already been finished");
        gameResults[_gameId] = _winningTeam;
        gameFinished[_gameId] = true;
        emit GameResultSet(_gameId, _winningTeam);
    }

    function ClaimPrize(uint _gameId) public {
        require(gameFinished[_gameId], "Game is not finished yet");
        uint totalBet = totalBetAmount[_gameId][team.HOMETEAM] +
            totalBetAmount[_gameId][team.AWAYTEAM];
        require(totalBet > 0, "No bet found for this game");

        require(
            bets[_gameId][msg.sender].tokenAmount > 0,
            "No bet found for this game"
        );
        require(
            bets[_gameId][msg.sender].betTeam == gameResults[_gameId],
            "You lose"
        );

        uint playerWinAmount = (bets[_gameId][msg.sender].tokenAmount /
            totalBetAmount[_gameId][gameResults[_gameId]]) * totalBet;
        bets[_gameId][msg.sender].tokenAmount = 0;
        bets[_gameId][msg.sender].betTeam = team.HOMETEAM;
        token.transfer(msg.sender, playerWinAmount);
        emit PrizeClaimed(msg.sender, _gameId, playerWinAmount);
    }

    function Withdraw(uint _gameId) public {
        require(
            bets[_gameId][msg.sender].tokenAmount > 0,
            "No bet found for this game"
        );
        uint tokenAmount = bets[_gameId][msg.sender].tokenAmount;
        token.transfer(msg.sender, tokenAmount);
        bets[_gameId][msg.sender].tokenAmount = 0;
        bets[_gameId][msg.sender].betTeam = team.HOMETEAM;
    }
}
