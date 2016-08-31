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
      on('change:campaign:turnorder', function(obj, prev) {
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
      var currentToken = getObj("graphic", turnOrder[0].id);
      if (currentToken.get('layer') === 'gmlayer') {
        return;
      }

      var tokenType = TCM.TokenType(currentToken);
      var tokenIMG = currentToken.get('imgsrc');
      var tokenName = currentToken.get('showplayers_name') ? currentToken.get('name') : 'NPC';
      var nameString = `<span style="font-size: 115%; font-weight:bold; text-decoration: underline"><a href="https://journal.roll20.net/character/${currentToken.get('represents')}">${tokenName}</a></span>`;
      log(nameString);
    },
  };
};

var TM = new TrailMaster();
var TCM = new TM.TokenCharMgr();
var RTM = new TM.RoundTurnMgr();

on('ready', function () {
  'use strict';
  if (TM.settings.tokenCharMgrEnabled) {
    log('enabled')
  };

  if (TM.settings.roundTurnMgrEnabled) {
    RTM.RegisterEventHandlers()
  };

});
