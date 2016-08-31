var TrailMaster = function () {
  'use strict';
  const version = '0.0.1';
  log(`TM Version = ${version}`)
  this.settings = {
      tokenCharMgrEnabled: true,
      roundTurnMgrEnabled: true,
    };
};

TrailMaster.prototype.TokenCharMgr = function () {
  'use strict';
  const version = '0.0.1';
  return {
    CharType: function (char) {
      // Pass character object and get back if character is a player, npc or mook
      var controllers = (char.get('controlledby') !== '') ? char.get('controlledby').split(',') : [];
      if (controllers.length > 0) {
        if (controllers.every(playerIsGM)) {
          var charType = 'npc';
        } else {
          var charType = 'player';
        }
      } else {
        charType = 'mook';
      }

      return charType;
    },

    TokenType: function (token) {
      // Pass token object and get back if token is player, npc, mook or nochar (no associated character sheet)
      var charID = token.get('represents');
      if (charID) {
        var tokenType = this.CharType(getObj('character', charID));
      } else {
        tokenType = 'nochar';
      }

      return tokenType;
    },
  };
};

TrailMaster.prototype.RoundTurnMgr = function () {
  'use strict';
  const version = '0.0.1';
  return {
    RegisterEventHandlers: function () {
      on('change:campaign:turnorder', function (obj, prev) {
        RTM.AnnounceCurrentTurn();
      });

    },

    TurnOrder: {
      Get: function () {
        var turnOrder = Campaign().get('turnorder');
        turnOrder = (turnOrder === '' ? '[]' : turnOrder);
        return JSON.parse(turnOrder);
      },

      Set: function (turnOrder) {
        Campaign().set({ turnorder: JSON.stringify(turnOrder) });
      },

      Next: function () {
        var turnOrder = RTM.TurnOrder.Get();
        turnOrder.push(turnOrder.shift());
        RTM.TurnOrder.Set(turnOrder);
      },

      HasTurn: function (token) {
        var tokenID = token.get('id');
        var turnOrder = RTM.TurnOrder.Get();
        return turnOrder.findIndex(function (turn) { return turn.id === tokenID; }) >= 0;
      },

      UpsertTurn: function (token, pr) {
        var turnOrder = RTM.TurnOrder.Get();
        if (RTM.TurnOrder.HasTurn(token)) {
          turnOrder = turnOrder.filter(function (turn) {
            return turn.id !== token.get('id');
          });
        }

        var newTurn = {
          id: token.get('id'),
          pr: pr,
          custom: '',
          pageid: token.get('pageid'),
        };
        var currentTurnID = turnOrder[0].id;
        turnOrder.push(newTurn);
        turnOrder.sort(function (a, b) {
          return b.pr - a.pr;
        });

        while (turnOrder[0].id !== currentTurnID) {
          turnOrder.push(turnOrder.shift());
        };

        RTM.TurnOrder.Set(turnOrder);
      },
    },
    AnnounceCurrentTurn: function () {
      var turnOrder = RTM.TurnOrder.Get();
      var currentToken = getObj('graphic', turnOrder[0].id);
      if (currentToken.get('layer') === 'gmlayer') {
        return;
      }

      const tokenSize = 70;
      var tokenType = TCM.TokenType(currentToken);
      var tokenIMG = currentToken.get('imgsrc');
      var tokenName = currentToken.get('showplayers_name') ? currentToken.get('name') : 'NPC';
      var nameString = `<span style='font-size: 115%; font-weight:bold; text-decoration: underline;'><a href='https://journal.roll20.net/character/${currentToken.get('represents')}'>${tokenName}</a></span>`;

      if (tokenType === 'player') {
        var bgColor = '#efe';
        var char = getObj('character', currentToken.get('represents'));
        var currentHP = getAttrByName(char.id, 'HP');
        var tempHP = getAttrByName(char.id, 'HP-temp');
        var totalHP = Number(currentHP) + Number(tempHP);
        var speed = getAttrByName(char.id, 'speed-modified');
        var maxHP = getAttrByName(char.id, 'HP', 'max');
        var nonLeathal = getAttrByName(char.id, 'non-lethal-damage');
        var charInfo = `<span style='font-weight: bold;'>HP: </span>${totalHP}/${maxHP} ${nonLeathal != 0 ? `<span style='font-weight: bold;'>NLD: </span> ${nonLeathal}` : ``} <br> <span style='font-weight: bold;'>Speed: </span> ${speed} ft`;
      } else {
        var bgColor = '#eef';
      }

      var imgSrcTag = `<img src='${tokenIMG}' style='float:right; width:${Math.round(tokenSize * .8)}px; height:${Math.round(tokenSize * .8)}px; padding: 0px 2px;' />`;
      var announceBox = `<div style='border: 3px solid #808080; background-color: ${bgColor}; padding: 1px 1px;'> <div style='text-align: left; margin: 5px 5px; position: relative; vertical-align: text-top;'> ${imgSrcTag} ${nameString} <br> ${charInfo ? charInfo : ''} <div style="clear:both;"></div></div></div>`;
      sendChat('', `/direct ${announceBox}`);
    },
  };
};

var TM = new TrailMaster();
var TCM = new TM.TokenCharMgr();
var RTM = new TM.RoundTurnMgr();

on('ready', function () {
  'use strict';
  if (TM.settings.tokenCharMgrEnabled) {
  }

  if (TM.settings.roundTurnMgrEnabled) {
    RTM.RegisterEventHandlers();
  }

});
