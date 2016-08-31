var TrailMaster = function () {
  'use strict';
  const version = '0.0.1';
  this.settings = {
      tokenCharMgrEnabled: true,
      roundTurnMgrEnabled: true,
    };
  log(`-=> TrailMaster - Main v${version} <=-`);
};

TrailMaster.prototype.TokenCharMgr = function () {
  'use strict';
  const version = '0.0.1';
  this.settings = {};
  log(`-=> TrailMaster - TokenCharMgr v${version} <=-`);
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
  this.settings = {};
  log(`-=> TrailMaster - RoundTurnMgr v${version} <=-`);
  return {
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
        var RTM = new TrailMaster().RoundTurnMgr();
        var turnOrder = RTM.TurnOrder.Get();
        turnOrder.push(turnOrder.shift());
        RTM.TurnOrder.Set(turnOrder);
      },

      HasTurn: function (token) {
        var RTM = new TrailMaster().RoundTurnMgr();
        var tokenID = token.get('id');
        var turnOrder = RTM.TurnOrder.Get();
        return turnOrder.findIndex(function (turn) { return turn.id === tokenID; }) >= 0;
      },

      UpsertTurn: function (token, pr) {
        var RTM = new TrailMaster().RoundTurnMgr();
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
  };
};

on('ready', function () {
  'use strict';
  var TM = new TrailMaster();
  if (TM.settings.tokenCharMgrEnabled) {
    var TCM = new TM.TokenCharMgr();
  };

  if (TM.settings.roundTurnMgrEnabled) {
    var RTM = new TM.RoundTurnMgr();
  };

  RTM.TurnOrder.UpsertTurn(getObj('graphic', '-KQT-LhWaKtAsvc9oMMK'),20);

});
