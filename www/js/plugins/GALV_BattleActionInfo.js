//-----------------------------------------------------------------------------
//  Galv's Battle Action Info
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_BattleActionInfo.js
//-----------------------------------------------------------------------------
//  2016-04-30 - Version 1.3 - fixed a bug when using code in formula
//                           - fixed issue when changing a skill to damage type
//                           - 'none' and still had damage in it.
//  2016-02-22 - Version 1.2 - compatibility added for Victor's Hit Formula
//  2016-02-20 - Version 1.1 - compatibility changes and bug fixes
//  2016-02-20 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
// Requested by Andy
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_BattleActionInfo = true;

var Galv = Galv || {};            // Galv's main object
Galv.ATI = Galv.ATI || {};        // Galv's stuff

// Galv Notetag setup (Add notes required for this plugin if not already added)
Galv.noteFunctions = Galv.noteFunctions || [];       // Add note function to this.

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Displays information when targeting an enemy with info such as crit chance, damage, etc.
 *
 * @author Galv - galvs-scripts.com
 *
 * @param Include Evade
 * @desc true or false - if target's evade affects the hit % chance in the action info
 * @default true
 *
 * @param Windowskin Opacity
 * @desc Opacity of the box's windowskin background.
 * @default 0
 *
 * @param Peek Height
 * @desc How many pixels the image remains peeking from the top of the screen when info is up.
 * @default 0
 *
 * @param Box Dimensions
 * @desc Width,Height - the dimensions of the info box. Background image must be same dimensions.
 * @default 500,260
 *
 * @param Default Enemy Indicator
 * @desc imageName,x,y - imageName from /img/system/ folder for indicator that appears when targeting enemies
 * @default battleAttackInfoArrow1,96,165
 *
 * @param Default Ally Indicator
 * @desc imageName,x,y - imageName from /img/system/ folder for indicator that appears when targeting allies
 * @default battleAttackInfoArrow2,96,165
 *
 * @param Min Damage Position
 * @desc x,y,width,alignment,size,color - alignment can be center,left or right, leave size/color blank for default
 * @default 170,30,75,center
 *
 * @param Max Damage Position
 * @desc x,y,width,alignment,size,color - alignment can be center,left or right, leave size/color blank for default
 * @default 260,30,75,center
 *
 * @param Damage Heal Color
 * @desc For min and max damages - an overriding color when a skill/item will heal instead of cause damage. Leave blank to not use.
 * @default #68ff64
 *
 * @param Crit Chance Position
 * @desc x,y,width,alignment,size,color - alignment can be center,left or right, leave size/color blank for default
 * @default 170,90,160,center,14,#ffb7a0
 *
 * @param Skill Name Position
 * @desc x,y,width,alignment,size,color - alignment can be center,left or right, leave size/color blank for default
 * @default 100,115,300,center
 *
 * @param Hit Chance Position
 * @desc x,y,width,alignment,size,color - alignment can be center,left or right, leave size/color blank for default
 * @default 170,70,160,center,18
 *
 * @param Icon Position
 * @desc x,y,alignment,size,color - alignment can be center,left or right, leave size/color blank for default
 * @default 250,155,center,12
 *
 * @param Add Icon
 * @desc Icon Id to use to indicate the state/buff is being added. It overlaps the state/buff icon.
 * @default 0
 *
 * @param Remove Icon
 * @desc Icon Id to use to indicate the state/buff is being removed. It overlaps the state/buff icon.
 * @default 0
 * 
 * @help
 *   Galv's Attack Info
 * ----------------------------------------------------------------------------
 * This plugin creates a dropdown box when an item or skill is used during
 * battle. The box contains information about the potential results of the
 * skill or item used against the target selected.
 * Most of the plugin settings are for customizing the look and layout of your
 * attack info box.
 *
 * Images for this plugin need to be put in /img/system/ folder.
 * 
 * Note: This plugin does not detect changes made with javascript code within
 * the formula box. For example, if you add a state using code inside the
 * formula box, it will not display.
 *
 * Upcoming features:
 * - Skills able to use unique images in place of the default Enemy and Ally
 *   Indicator arrows
 * - Custom fields to add additional data to the box
 */


//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {
var t = "";

Galv.ATI.peek = Number(PluginManager.parameters('Galv_BattleActionInfo')['Peek Height']);

	t = PluginManager.parameters('Galv_BattleActionInfo')['Box Dimensions'].split(",");
Galv.ATI.size = [Number(t[0]),Number(t[1])];

Galv.ATI.windowOpac = Number(PluginManager.parameters('Galv_BattleActionInfo')['Windowskin Opacity']);

	t = PluginManager.parameters('Galv_BattleActionInfo')['Min Damage Position'].split(",");
if (t.length > 1) Galv.ATI.minDam = [Number(t[0]),Number(t[1]),Number(t[2]),t[3],t[4],t[5]];

	t = PluginManager.parameters('Galv_BattleActionInfo')['Max Damage Position'].split(",");
if (t.length > 1) Galv.ATI.maxDam = [Number(t[0]),Number(t[1]),Number(t[2]),t[3],t[4],t[5]];

	t = PluginManager.parameters('Galv_BattleActionInfo')['Crit Chance Position'].split(",");
if (t.length > 1) Galv.ATI.critChance = [Number(t[0]),Number(t[1]),Number(t[2]),t[3],t[4],t[5]];

	t = PluginManager.parameters('Galv_BattleActionInfo')['Skill Name Position'].split(",");
if (t.length > 1) Galv.ATI.itemName = [Number(t[0]),Number(t[1]),Number(t[2]),t[3],t[4],t[5]];

Galv.ATI.healColor = PluginManager.parameters('Galv_BattleActionInfo')['Damage Heal Color'];

	t = PluginManager.parameters('Galv_BattleActionInfo')['Default Ally Indicator'].split(",");
if (t.length > 1) Galv.ATI.allyIndicator = [t[0],Number(t[1]),Number(t[2])];

	t = PluginManager.parameters('Galv_BattleActionInfo')['Default Enemy Indicator'].split(",");
if (t.length > 1) Galv.ATI.enemyIndicator = [t[0],Number(t[1]),Number(t[2])];

	t = PluginManager.parameters('Galv_BattleActionInfo')['Hit Chance Position'].split(",");
if (t.length > 1) Galv.ATI.hitChance = [Number(t[0]),Number(t[1]),Number(t[2]),t[3],t[4],t[5]];

	t = PluginManager.parameters('Galv_BattleActionInfo')['Icon Position'].split(",");
if (t.length > 1) Galv.ATI.stateIcons = [Number(t[0]),Number(t[1]),t[2],t[3],t[4]];


Galv.ATI.addIcon = PluginManager.parameters('Galv_BattleActionInfo')['Add Icon'];
Galv.ATI.removeIcon = PluginManager.parameters('Galv_BattleActionInfo')['Remove Icon'];

Galv.ATI.applyEvade = PluginManager.parameters('Galv_BattleActionInfo')['Include Evade'].toLowerCase() == "true" ? true : false;

//-----------------------------------------------------------------------------
//  NOTE TAGS
//-----------------------------------------------------------------------------

if (!Galv.notetagAlias) {   // Add alias only if not added by another Galv plugin
	Galv.ATI.Scene_Boot_start = Scene_Boot.prototype.start;
	Scene_Boot.prototype.start = function() {	
		for (var i = 0;i < Galv.noteFunctions.length; i++) {
			Galv.noteFunctions[i]();	
		};
		Galv.ATI.Scene_Boot_start.call(this);
	};
	Galv.notetagAlias = true;
};

Galv.ATI.notetags = function() {
	// Skill Notes
	for (var i = 1;i < $dataSkills.length;i++) {
		var note = $dataSkills[i].note.toLowerCase().match(/<ati_image:(.*),(.*),(.*)>/i)
		if (note) $dataSkills[i].atiImage = [note[1],Number(note[2]),Number(note[3])];
	};
	// Item Notes
	for (var i = 1;i < $dataItems.length;i++) {
		var note = $dataItems[i].note.toLowerCase().match(/<ati_image:(.*),(.*),(.*)>/i)
		if (note) $dataItems[i].atiImage = [note[1],Number(note[2]),Number(note[3])];
	};
};

Galv.noteFunctions.push(Galv.ATI.notetags);

//-----------------------------------------------------------------------------
//  END NOTE TAGS
//-----------------------------------------------------------------------------

Galv.ATI.Game_Action_subject = Game_Action.prototype.subject;
Game_Action.prototype.subject = function() {
	if (Galv.ATI.tempTarget) {
		if (this._subjectActorId > 0) {
			Galv.ATI.tempSubject = JsonEx.makeDeepCopy($gameActors.actor(this._subjectActorId));
		} else {
			Galv.ATI.tempSubject = JsonEx.makeDeepCopy($gameTroop.members()[this._subjectEnemyIndex]);
		};
		return Galv.ATI.tempSubject;
	} else {
		return Galv.ATI.Game_Action_subject.call(this);
	};
};

Galv.ATI.minMax = function(action,item,target) {
	var minMax = [0,0];
	if (action && item && target) {
		action._dontApply = true;
		Galv.ATI.tempTarget = JsonEx.makeDeepCopy(target);
		if (action.item().damage.type <= 0) { // If set to damage type 'none'
			var baseDamage = 0;
		} else {
			var baseDamage = action.makeDamageValue(Galv.ATI.tempTarget,false);
		};
		var variance = item.damage.variance;
		var v = Math.floor(Math.max(Math.abs(baseDamage) * variance / 100, 0));
		minMax[0] = action.applyGuard(baseDamage - v,target);  // min damage
		minMax[1] = action.applyGuard(baseDamage + v,target);  // max damage
		Galv.ATI.tempTarget = null;
		action._dontApply = false;
	};
	return minMax;
};

Galv.ATI.Game_Action_applyVariance = Game_Action.prototype.applyVariance;
Game_Action.prototype.applyVariance = function(damage, variance) {
	if (this._dontApply) return damage;
    return Galv.ATI.Game_Action_applyVariance.call(this,damage,variance);
};

Galv.ATI.Game_Action_applyGuard = Game_Action.prototype.applyGuard;
Game_Action.prototype.applyGuard = function(damage, target) {
	if (this._dontApply) return damage;
    return Galv.ATI.Game_Action_applyGuard.call(this,damage,target);
};

Galv.ATI.Scene_Battle_initialize = Scene_Battle.prototype.initialize;
Scene_Battle.prototype.initialize = function() {
	ImageManager.loadSystem('battleAttackInfo');
	ImageManager.loadSystem(Galv.ATI.allyIndicator[0]);
	ImageManager.loadSystem(Galv.ATI.enemyIndicator[0]);
    Galv.ATI.Scene_Battle_initialize.call(this);
};

Galv.ATI.Scene_Battle_createHelpWindow = Scene_Battle.prototype.createHelpWindow;
Scene_Battle.prototype.createHelpWindow = function() {
	this._attackInfoWindow = new Window_BattleAttackInfo();
	this.addWindow(this._attackInfoWindow);
    Galv.ATI.Scene_Battle_createHelpWindow.call(this);
};

Galv.ATI.Window_Help_setBattler = Window_Help.prototype.setBattler;
Window_Help.prototype.setBattler = function(battler) {
	if (this._enemyWindow || this._actorWindow) {
		this.contents.clear();
    	this.clear();
		return this.hide();
	}
    Galv.ATI.Window_Help_setBattler.call(this);
};

Galv.ATI.Scene_Battle_createEnemyWindow = Scene_Battle.prototype.createEnemyWindow;
Scene_Battle.prototype.createEnemyWindow = function() {
	Galv.ATI.Scene_Battle_createEnemyWindow.call(this);
	this._attackInfoWindow.setWindows(this._enemyWindow,this._actorWindow);
	this._helpWindow._enemyWindow = this._enemyWindow;
	this._helpWindow._actorWindow = this._actorWindow;
};

Galv.ATI.Window_BattleLog_initialize = Window_BattleLog.prototype.initialize;
Window_BattleLog.prototype.initialize = function() {
	Galv.ATI.Window_BattleLog_initialize.call(this);
	this.y += Galv.ATI.peek;
};


//-----------------------------------------------------------------------------
// Window_BattleAttackInfo


function Window_BattleAttackInfo() {
    this.initialize.apply(this, arguments);
}

Window_BattleAttackInfo.prototype = Object.create(Window_Base.prototype);
Window_BattleAttackInfo.prototype.constructor = Window_BattleAttackInfo;

Window_BattleAttackInfo.prototype.initialize = function() {
    var width = Galv.ATI.size[0];
    var height = Galv.ATI.size[1];
	var x = Graphics.boxWidth / 2 - width / 2;
	this._peekHeight = Galv.ATI.peek;
	var y = -height + this._peekHeight;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
	this.opacity = Galv.ATI.windowOpac;
	this._momentum = 0;
	this._currentIndex = -1;
	this._skill = null;
};

Window_BattleAttackInfo.prototype.standardPadding = function() {return 0;};

Window_BattleAttackInfo.prototype.setWindows = function(enemyWindow,actorWindow) {
	this._enemyWindow = enemyWindow;
	this._actorWindow = actorWindow;
	this.drawData();
};

Window_BattleAttackInfo.prototype.target = function() {
	if (this._enemyWindow.active) {
		return this._enemyWindow.enemy();
	} else {
		return this._actorWindow.actor();
	};
};

Window_BattleAttackInfo.prototype.subject = function() {
	var pId = Math.max(BattleManager._actorIndex,0);
	return $gameParty.members()[pId];
};

Window_BattleAttackInfo.prototype.action = function() {
	return this.subject().currentAction() //Galv.ATI.action;
};

Window_BattleAttackInfo.prototype.drawData = function() {
	this.contents.clear();
	
	var action = this.action();
	this.drawBg(action,target,item);  // Draw BG Image
	if (!action) return false;
	
	var target = this.target();
	action._targetIndex = this._enemyWindow.active ? this._enemyWindow._index : this._actorWindow._index;
	
	var item = action._item.object();

	if (!item || !target) return false;
	this.drawIndicator(target,item);
	this.drawMinMax(action,target,item);
    this.drawItemName(item);
	this.drawCritChance(action,target,item);
	this.drawHitChance(action,target,item);
	this.drawIcons(action,target,item);
	this.drawCustom(action,target,item);
};


Window_BattleAttackInfo.prototype.drawBg = function(action,target,item) {
	var bitmap = ImageManager.loadSystem('battleAttackInfo');
    var pw = this._width;
    var ph = this._height;
    this.contents.blt(bitmap, 0, 0, pw, ph, 0, 0);
};

Window_BattleAttackInfo.prototype.drawIndicator = function(target,item) {
	if (item.atiImage) { // custom indicator?
		var img = item.atiImage[0];
		var x = item.atiImage[1];
		var y = item.atiImage[2];
	} else if (target.isActor()) {
		var img = Galv.ATI.allyIndicator[0];
		var x = Galv.ATI.allyIndicator[1];
		var y = Galv.ATI.allyIndicator[2];
	} else {
		var img = Galv.ATI.enemyIndicator[0];
		var x = Galv.ATI.enemyIndicator[1];
		var y = Galv.ATI.enemyIndicator[2];
	};

	var bitmap = ImageManager.loadSystem(img);
    var pw = bitmap.width;
    var ph = bitmap.height;
    this.contents.blt(bitmap, 0, 0, pw, ph, x, y);

};

Window_BattleAttackInfo.prototype.drawMinMax = function(action,target,item) {
	var minMax = Galv.ATI.minMax(action,item,target);  // array

	// Min value
	var mi = Galv.ATI.minDam; // x,y,width,alignment
	if (mi[4]) this.contents.fontSize = Number(mi[4]);
	
	if (Math.abs(minMax[0]) < Math.abs(minMax[1])) {
		var minValue = Math.abs(minMax[0]);
		var maxValue = Math.abs(minMax[1]);
	} else {
		var minValue = Math.abs(minMax[1]);
		var maxValue = Math.abs(minMax[0]);
	};
	
	if (minMax[0] < 0) {
		this.changeTextColor(Galv.ATI.healColor);
	} else if (mi[5])  {
		this.changeTextColor(mi[5].replace(" ",""));
	};

	this.drawText(minValue, mi[0], mi[1], mi[2], mi[3].replace(" ","")); // min
	this.resetFontSettings();
	
	// Max value
	var ma = Galv.ATI.maxDam; // x,y,width,alignment
	if (ma[4]) this.contents.fontSize = Number(ma[4]);
	
	if (minMax[0] < 0) {
		this.changeTextColor(Galv.ATI.healColor);
	} else if (ma[5])  {
		this.changeTextColor(ma[5].replace(" ",""));
	};
	if (ma[5]) this.changeTextColor(ma[5].replace(" ",""));
	this.drawText(maxValue, ma[0], ma[1], ma[2], ma[3].replace(" ","")); // max
	this.resetFontSettings();
};

Window_BattleAttackInfo.prototype.drawItemName = function(item) {
	var c = Galv.ATI.itemName;
	if (c[4]) this.contents.fontSize = Number(c[4]);
	if (c[5]) this.changeTextColor(c[5].replace(" ",""));
	this.drawText(item.name, c[0], c[1], c[2], c[3].replace(" ",""));
	this.resetFontSettings();
};

Window_BattleAttackInfo.prototype.drawCritChance = function(action,target,item) {
	var c = Galv.ATI.critChance;
	if (c[4]) this.contents.fontSize = Number(c[4]);
	if (c[5]) this.changeTextColor(c[5].replace(" ",""));

	var percent = Math.floor(action.itemCri(target) * 100);
	this.drawText(percent, c[0], c[1], c[2], c[3].replace(" ",""));
	this.resetFontSettings();
};

Window_BattleAttackInfo.prototype.drawHitChance = function(action,target,item) {
	var c = Galv.ATI.hitChance;
	if (!c) return false;
	if (c[4]) this.contents.fontSize = Number(c[4]);
	if (c[5]) this.changeTextColor(c[5].replace(" ",""));
	if (Imported['VE - Hit Formula']) {
		var percent = Math.floor(action.getHitResult(target) * 100);
	} else {
		var percent = Math.floor(action.itemHit(target) * 100);
		if (Galv.ATI.applyEvade) {
			percent = percent - Math.floor(action.itemEva(target) * percent);
		};
	};
	
	this.drawText(percent, c[0], c[1], c[2], c[3].replace(" ",""));
	this.resetFontSettings();
};

Window_BattleAttackInfo.prototype.drawIcons = function(action,target,item) {
	var c = Galv.ATI.stateIcons;
	if (!c) return false;
	if (c[3]) this.contents.fontSize = Number(c[3]);
	if (c[4]) this.changeTextColor(c[4].replace(" ",""));
	
	var align = c[2].toLowerCase().replace(" ","");
	var initX = c[0];  // initial X position
	var y = c[1];
	var nextX = Sprite_StateIcon._iconWidth + 4;
	var offset = 0;

	var iconList = [];
	var buffList = {};
	
	// Get Effect Icons
	for (var i = 0;i < item.effects.length;i++) {
		var e = item.effects[i];

		if (e.code == Game_Action.EFFECT_ADD_STATE) {
			var sIcon = $dataStates[e.dataId] ? $dataStates[e.dataId].iconIndex : 0;
			if (sIcon > 0) iconList.push({icon:sIcon,type:Galv.ATI.addIcon,chance:e.value1});
		} else if (e.code == Game_Action.EFFECT_REMOVE_STATE) {
			var sIcon = $dataStates[e.dataId].iconIndex;
			if (sIcon > 0) iconList.push({icon:sIcon,type:Galv.ATI.removeIcon,chance:e.value1});
		} else if (e.code == Game_Action.EFFECT_ADD_BUFF) {
			buffList[e.dataId] = buffList[e.dataId] || {param:e.dataId,level:0,type:0};
			buffList[e.dataId].level += 1;
		} else if (e.code == Game_Action.EFFECT_ADD_DEBUFF) {
			buffList[e.dataId] = buffList[e.dataId] || {param:e.dataId,level:0,type:0,chance:1};
			buffList[e.dataId].level -= 1;
		} else if (e.code == Game_Action.EFFECT_REMOVE_BUFF) {
			buffList[e.dataId] = buffList[e.dataId] || {param:e.dataId,level:0,type:Galv.ATI.removeIcon};
			buffList[e.dataId].level += 1;
		} else if (e.code == Game_Action.EFFECT_REMOVE_DEBUFF) {
			buffList[e.dataId] = buffList[e.dataId] || {param:e.dataId,level:0,type:Galv.ATI.removeIcon};
			buffList[e.dataId].level -= 1;
		};
	};

	
	// Merge Buffs
	for (var i in buffList) {
		var obj = buffList[i];
		var sIcon = target.buffIconIndex(obj.level, obj.param);
		var ch = obj.chance || 1;
		if (sIcon > 0) iconList.push({icon:sIcon,type:obj.type,chance:ch});
	}

	// Set positions
	if (align == "right") {
		nextX = -nextX;
		initX = initX - Sprite_StateIcon._iconWidth;
	} else if (align == "center") {
		initX = initX + 4;
		var offset = -((iconList.length * nextX) / 2)
	};
	var txtY = y + Sprite_StateIcon._iconHeight / 2;
	
	// Draw Icons
	for (var i = 0; i < iconList.length; i++) {
		this.drawIcon(iconList[i].icon, initX + nextX * i + offset, y);
		this.drawIcon(iconList[i].type, initX + nextX * i + offset, y);
		var percent = Math.floor(iconList[i].chance * 100) + "%";
		this.drawText(percent, initX + nextX * i + offset, txtY, Sprite_StateIcon._iconWidth, "center");
	};

	this.resetFontSettings();
};

Window_BattleAttackInfo.prototype.drawCustom = function(action,target,item) {
	
};

Window_BattleAttackInfo.prototype.refresh = function() {
	this.drawData();
	this._currentIndex = this._currentWindow._index;
	this._currentItem = this.action()._item;
};

Window_BattleAttackInfo.prototype.update = function() {
	if (this._enemyWindow.active) {
		this.updateMotion();
		if (this._currentIndex !== this._enemyWindow._index || this._currentItem !== this.action()._item || this._currentWindow !== this._enemyWindow) {
			this._currentWindow = this._enemyWindow;
			this.refresh();
		};
	} else if (this._actorWindow.active) {
		this.updateMotion();
		if (this._currentIndex !== this._actorWindow._index || this._currentItem !== this.action()._item || this._currentWindow !== this._actorWindow) {
			this._currentWindow = this._actorWindow;
			this.refresh();
		};
	} else {
		if (this._momentum > 0) this._momentum = 0;
		this._momentum = this._momentum - 5;
		this.y = Math.max(this.y + this._momentum,-this._height + this._peekHeight);
		this._currentIndex = -1;
		this._currentItem = null;
	};
};

Window_BattleAttackInfo.prototype.updateMotion = function() {
	if (this._momentum < 0) this._momentum = 0;
	this._momentum = this._momentum + 5;
	this.y = Math.min(this.y + this._momentum,0);
};

})();