var TrailMaster = function () {
  'use strict';
  const version = '0.0.1';
  this.settings = {
      tokenCharMgrEnabled: true,
    };
  log(`-=> TrailMaster v${version} <=-`);
};

TrailMaster.prototype.TokenCharMgr = function () {
  'use strict';
  const version = '0.0.1';
  this.settings = {};
  log(`-=> TrailMaster - TokenCharMgr v${version} <=-`);
  return {
    CharType: function (charID) {
      // Pass character object ID and get back if character is a player, npc or mook
      var char = getObj('character', charID);
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

      return charType
    },

    TokenType: function (token) {
      var CharID = token.get('represents');
      if (CharID) {
        var Char = getObj('character', CharID);
        if (Char.get('controlledby')) {
          Type = 'player';
        } else {
          var Type = 'npc';
        }
      } else {
        var Type = 'mook';
      };

      return Type
    }
  }
};

on('ready', function () {
  'use strict';
  var TM = new TrailMaster();
  if (TM.settings.tokenCharMgrEnabled) {
    var TCM = new TM.TokenCharMgr();
  };

  var id = '-KQSTIqUJ3qd4OzI1Rle';
  var char = TCM.CharType(id);
  log(`char type: ${char}`)

  var player = TCM.TokenType(getObj('graphic', '-KKpwR5QRLavq99FkTm1'));
  log(`player token: ${player}`);
  var npc = TCM.TokenType(getObj('graphic', '-KQRv8cjEYvxaC4eXxto'));
  log(`npc token: ${npc}`);
  var mook = TCM.TokenType(getObj('graphic', '-KQRvEIkENjKc2Y1iwFG'));
  log(`mook token: ${mook}`);
  var nochar = TCM.TokenType(getObj('graphic', '-KQRvPhMWt4itnlcDLGf'));
  log(`nochar token: ${nochar}`);
});


