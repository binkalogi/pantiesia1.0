//-----------------------------------------------------------------------------
//  Galv's Equip Display Window
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_EquipDisplayWindow.js
//-----------------------------------------------------------------------------
//  20xx-xx-xx - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
// Requested by Patron James
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_EquipDisplayWindow = true;

var Galv = Galv || {};        // Galv's main object
Galv.EDW = Galv.EDW || {};        // Galv's plugin stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.0) This plugin allows you to display a window with basic weapon or armor details on screen.
 *
 * @author Galv - galvs-scripts.com
 *
 * @param Window Width
 * @desc The pixel width of the equip display window
 * @default 340
 *
 * @param Window Height
 * @desc The number of lines to fit in the height of the window
 * @default 10
 
 * @param Choice Window Id
 * @desc The id to use for the equip window that changes during choice hover
 * @default 0
 *
 * @help
 *   Galv's Equip Display Window
 * ----------------------------------------------------------------------------
 * Adds the ability to display a window with some very basic details about a
 * piece of armor or a weapon from the database.
 *
 *
 * ----------------------------------------------------------------------------
 *  SCRIPT CALLS
 * ----------------------------------------------------------------------------
 *
 *       Galv.EDW.show(id,"itemString",x,y);
 *
 * id         = unique id and array index used for multiple windows
 * itemString = a string to set which item is being displayed. This is a letter
 *              (w or a) followed by a database id... for example:
 *              "a10" would be armor 10.
 *              "w2" would be weapon 2.
 * x          = the x position of the window
 * y          = the y position of the window
 *
 *
 *       Galv.EDW.remove(id);       // remove a certain window id from screen
 *
 *       Galv.EDW.clear();          // clear all windows from screen
 *
 * ----------------------------------------------------------------------------
 *  SHOW CHOICES
 * ----------------------------------------------------------------------------
 * You can also display a window on "Show Choices" hover that can change when
 * the player cycles through each of the choices. This is done by adding a
 * tag to each of the choices to change the choice window.
 * 
 *      <edw:itemString,x,y>
 *
 *
 * ----------------------------------------------------------------------------
 *  NOTE TAGS
 * ----------------------------------------------------------------------------
 * You can use a note tag in weapons and armors to show a quick description.
 * This description doesn't have word wrap, but you can use the | symbol to
 * specify a new line of text.
 *
 *       <eDisplayTxt:Text for first|Text for second|Text for third>
 *
 *
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.EDW.width = Number(PluginManager.parameters('Galv_EquipDisplayWindow')["Window Width"]);
Galv.EDW.heightLines = Number(PluginManager.parameters('Galv_EquipDisplayWindow')["Window Height"]);
Galv.EDW.choiceWindowId = Number(PluginManager.parameters('Galv_EquipDisplayWindow')["Choice Window Id"]);
Galv.EDW.choiceList = [];

Galv.EDW.getItem = function(itemString) {
	var item = null;
	var type = itemString[0];
	var id = Number(itemString.substr(1));
	switch (type) {
		case "w":
			item = $dataWeapons[id];
			break;
		case "a":
			item = $dataArmors[id];
			break;
		case "i":
			item = $dataItems[id];
			break;
	}
	return item;
};

Galv.EDW.show = function(id,itemString,x,y) {
	if (!itemString) return;
	$gameSystem._eDisplayWindows[id] = {id:id || 0,item:itemString,x:x || 0,y:y || 0};
	Galv.EDW.refreshWindows();
};

Galv.EDW.remove = function(id) {
	$gameSystem._eDisplayWindows[id] = null;
	Galv.EDW.refreshWindows();
};

Galv.EDW.clear = function(id) {
	$gameSystem._eDisplayWindows = [];
	Galv.EDW.refreshWindows();
};

Galv.EDW.refreshWindows = function() {
	if (SceneManager._scene.createEquipDisplayWindows) SceneManager._scene.createEquipDisplayWindows();
};

Galv.EDW.getChoiceWindows = function() {
	Galv.EDW.choiceList = [];
	if (!$gameMessage._choices) return;
	for (var i = 0; i < $gameMessage._choices.length; i++) {
		var txt = $gameMessage._choices[i].match(/<edw:(.*)>/i);
		if (txt) Galv.EDW.createWindowOptions(i,txt);
	}
};

Galv.EDW.createWindowOptions = function(index,txt) {
	$gameMessage._choices[index] = $gameMessage._choices[index].replace(txt[0],'');
	var opts = txt[1].split(',');
	Galv.EDW.choiceList[index] = {itemString:opts[0],x:Number(opts[1]),y:Number(opts[2])};
};


//-----------------------------------------------------------------------------
//  WINDOW CHOICE
//-----------------------------------------------------------------------------

Galv.EDW.Window_ChoiceList_callUpdateHelp = Window_ChoiceList.prototype.callUpdateHelp;
Window_ChoiceList.prototype.callUpdateHelp = function() {
	Galv.EDW.Window_ChoiceList_callUpdateHelp.call(this);
	var i = this.index();
	if (this.active && Galv.EDW.choiceList[i]) {
		var op = Galv.EDW.choiceList[i];
		Galv.EDW.show(Galv.EDW.choiceWindowId,op.itemString,op.x,op.y);
    } else {
		Galv.EDW.remove(Galv.EDW.choiceWindowId);
	}
};

Galv.EDW.Window_ChoiceList_start = Window_ChoiceList.prototype.start;
Window_ChoiceList.prototype.start = function() {
	Galv.EDW.getChoiceWindows();
	Galv.EDW.Window_ChoiceList_start.call(this);
};


//-----------------------------------------------------------------------------
// Game_System
//-----------------------------------------------------------------------------

Galv.EDW.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	Galv.EDW.Game_System_initialize.call(this);
	this._eDisplayWindows = [];
};


//-----------------------------------------------------------------------------
//  SCENE MAP
//-----------------------------------------------------------------------------

Galv.EDW.Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
	Galv.EDW.Scene_Map_createDisplayObjects.call(this);
	this.createEquipDisplayWindows();
};

Scene_Map.prototype.createEquipDisplayWindows = function() {
	// if windows exist, remove them all
	if (this._eDisplayWindows) {
		for (var i = 0; i < this._eDisplayWindows.length; i++) {
			this.removeChild(this._eDisplayWindows[i]);
		}
	}
	// init display window container
	this._eDisplayWindows = [];	
	// create varBar sprites
	for (var i = 0; i < $gameSystem._eDisplayWindows.length; i++) {
		// if index exists in array, add window
		if ($gameSystem._eDisplayWindows[i]) {
			this._eDisplayWindows.push(new Window_EquipDisplay(i));		
		}
	}	
	// make children
	for (var i = 0; i < this._eDisplayWindows.length; i++) {
		this.addChild(this._eDisplayWindows[i]);
	}
};

})();



//-----------------------------------------------------------------------------
// Window_EquipDisplay
//-----------------------------------------------------------------------------

function Window_EquipDisplay() {
    this.initialize.apply(this, arguments);
}

Window_EquipDisplay.prototype = Object.create(Window_Base.prototype);
Window_EquipDisplay.prototype.constructor = Window_EquipDisplay;

Window_EquipDisplay.prototype.initialize = function(id) {
	this._id = id;
    var width = this.windowWidth();
    var height = this.windowHeight();
	var x = this.data().x;
	var y = this.data().y;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
};

Window_EquipDisplay.prototype.windowWidth = function() {
    return Galv.EDW.width;
};

Window_EquipDisplay.prototype.windowHeight = function() {
    return this.fittingHeight(Galv.EDW.heightLines) + 10;
};

Window_EquipDisplay.prototype.data = function() {
    return $gameSystem._eDisplayWindows[this._id];
};

Window_EquipDisplay.prototype.refresh = function() {
    this.contents.clear();
	this._item = Galv.EDW.getItem(this.data().item);
    if (this._item) {
        this.drawItemName(this._item, this.textPadding(), 0);
        for (var i = 0; i < 6; i++) {
            this.drawItem(0, this.lineHeight() * (1 + i), 2 + i);
        }
		this.drawItemDesc(this.lineHeight() * 7 + 10);
    }
};

Window_EquipDisplay.prototype.drawItem = function(x, y, paramId) {
    this.drawParamName(x + this.textPadding(), y, paramId);
    if (this._item) {
        this.drawCurrentParam(x, y, paramId);
    }
};

Window_EquipDisplay.prototype.drawParamName = function(x, y, paramId) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.param(paramId), x, y, 120);
};

Window_EquipDisplay.prototype.drawCurrentParam = function(x, y, paramId) {
    this.resetTextColor();
    this.drawText(this._item.params[paramId], x, y, this.contentsWidth(), 'right');
};

Window_EquipDisplay.prototype.drawItemDesc = function(y) {
	var txt = this._item.meta.eDisplayTxt || "";
	var array = txt.split("|");
	for (var i = 0; i < array.length; i++) {
		this.drawTextEx(array[i], this.textPadding(), y + i * this.lineHeight());
	}
};