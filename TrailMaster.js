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
  this.settings = {
  };
  log('-=> TrailMaster - TokenCharMgr v${version} <=-');
  return {

  };
};

on('ready', function () {
  'use strict';
  var TM = new TrailMaster();
  if (TM.settings.tokenCharMgrEnabled) {
    var TCM = new TM.TokenCharMgr();
  };
});
