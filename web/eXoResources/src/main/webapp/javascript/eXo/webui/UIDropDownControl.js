/**
 * Copyright (C) 2009 eXo Platform SAS.
 * 
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 * 
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

function UIDropDownControl() {} ;

UIDropDownControl.prototype.init = function(id) {
  this.active = null;
  eXo.require("eXo.webui.KeyCode");
  var DOMUtil = eXo.core.DOMUtil;
  var root = document.getElementById(id);
  this.dropdownObject = DOMUtil.findFirstDescendantByClass(root, "div", "UIDropDownTitle");
  var dropDownAnchor = DOMUtil.findNextElementByTagName(this.dropdownObject, 'div') ;
  this.dropdownObject.anchorContainer = dropDownAnchor;
  this.dropdownObject.setAttribute("tabindex", 0);

  this.children =  DOMUtil.findDescendantsByClass(root, "a",  "OptionItem");
  var length = this.children.length;
  for (var i = 0; i < length; i++) {
     var element = this.children[i];
     element["next"] = this.children[i+1];
     element["prev"] = this.children[i-1];
     eXo.addEvent(element, "mouseenter", function(event) {
        eXo.webui.UIDropDownControl.activate(event, this);
     });
     eXo.addEvent(element, "mouseleave", function(event) {
        eXo.webui.UIDropDownControl.deactivate();
     });
  }
  this.children[0]["prev"] = this.children[length-1];
  this.children[length-1]["next"] = this.children[0];

  eXo.addEvent(this.dropdownObject, "keydown", function(event) {
     eXo.webui.UIDropDownControl.keydownHandler(event);
  });
};

UIDropDownControl.prototype.keydownHandler = function(event) {
   event.preventDefaultEvent = function() {
      if (this.preventDefault) {
         this.preventDefault();
      } else {
         this.returnValue = false;
      }
   };
   var keyCode = KeyCode;
   switch (event.keyCode) {
   case keyCode.UP:
      this.move("prev", event);
      event.preventDefaultEvent();
      break;
   case keyCode.DOWN:
      this.move("next", event);
      event.preventDefaultEvent();
      break;
   case keyCode.ENTER:
   case keyCode.NUMPAD_ENTER:
      event.preventDefaultEvent();
   case keyCode.TAB:
      if (this.active) {
         this.active.onclick();
         var href = this.active.getAttribute("href");
         window.location = href;
      }
      break;
   case keyCode.ESCAPE:
      event.preventDefaultEvent();
      eXo.webui.UIDropDownControl.close(event);
      break;
   default:
      break;
   };
};

UIDropDownControl.prototype.move = function(direction, event) {
   if (this.dropdownObject.anchorContainer.style.display == "none") {
      eXo.webui.UIDropDownControl.show(this.dropdownObject, event);
      return;
   }

   if (!this.active) {
      this.activate(event, this.children[0]);
      return;
   } else {
      var element = this.active[direction];
      if (element) {
         this.deactivate();
         this.activate(event, element);
      }
   }
}

UIDropDownControl.prototype.close = function(event) {
   if (this.dropdownObject.anchorContainer.style.display == "block") {
      eXo.webui.UIDropDownControl.show(this.dropdownObject, event);
      this.deactivate();
   }
}

UIDropDownControl.prototype.deactivate = function() {
   if (!this.active) return;
   this.active.className = "OptionItem";
   this.active = null;
}

UIDropDownControl.prototype.activate = function(event, item) {
   this.deactivate();
   item.className = "OptionItem Over";
   this.active = item;
}

UIDropDownControl.prototype.selectItem = function(method, id, selectedIndex) {
	if(method)	method(id, selectedIndex) ;
} ;

/*.
 * minh.js.exo
 */
/**
 * show or hide drop down control
 * @param {Object} obj document object to use as Anchor for drop down
 * @param {Object} evet event object
 */
UIDropDownControl.prototype.show = function(obj, evt) {
	if(!evt) evt = window.event ;
	evt.cancelBubble = true ;
	
	var DOMUtil = eXo.core.DOMUtil ;
	var Browser = eXo.core.Browser ;
	var dropDownAnchor = DOMUtil.findNextElementByTagName(obj, 'div') ;
	if (dropDownAnchor) {
		if (dropDownAnchor.style.display == "none") {
			dropDownAnchor.style.display = "block" ;
			dropDownAnchor.style.visibility = "visible" ;
			var middleCont = DOMUtil.findFirstDescendantByClass(dropDownAnchor, "div", "MiddleItemContainer") ;
			var topCont = DOMUtil.findPreviousElementByTagName(middleCont, "div") ;
			var bottomCont = DOMUtil.findNextElementByTagName(middleCont, "div") ;
			topCont.style.display = "block" ;
			bottomCont.style.display = "block" ;
			var visibleHeight = Browser.getBrowserHeight() - Browser.findPosY(middleCont) - 40 ;
			var scrollHeight = middleCont.scrollHeight ;
			if(scrollHeight > visibleHeight) {
				topCont.style.display = "block" ;
				bottomCont.style.display = "block" ;
				middleCont.style.height = visibleHeight - topCont.offsetHeight - bottomCont.offsetHeight + "px" ;
				topCont.onclick = function(event) {
					event = event || window.event;
					event.cancelBubble = true;
				};
				bottomCont.onclick = function(event){
					event = event || window.event;
					event.cancelBubble = true;
				}
			} else {
				topCont.style.display = "none" ;
				bottomCont.style.display = "none" ;
				middleCont.scrollTop = 0;
				middleCont.style.height = "auto";
			}
			DOMUtil.listHideElements(dropDownAnchor) ;
		}
		else {
			dropDownAnchor.style.display = "none" ;
			dropDownAnchor.style.visibility = "hidden" ;
		}
	}
	
} ;
/**
 * Hide an object
 * @param {Object, String} obj object to hide
 */
UIDropDownControl.prototype.hide = function(obj) {
	if (typeof(obj) == "string") obj = document.getElementById(obj) ;
	obj.style.display = "none" ;		
} ;
/**
 * Use as event when user selects a item in drop down list
 * Display content of selected item and hide drop down control
 * @param {Object} obj selected object
 * @param {Object} evt event
 */
UIDropDownControl.prototype.onclickEvt = function(obj, evt) {
	var DOMUtil = eXo.core.DOMUtil ;
	var uiDropDownAnchor = DOMUtil.findAncestorByClass(obj, 'UIDropDownAnchor') ;
	var uiDropDownTitle = DOMUtil.findPreviousElementByTagName(uiDropDownAnchor, 'div') ;
	var uiDropDownMiddleTitle = DOMUtil.findFirstDescendantByClass(uiDropDownTitle,'div','DropDownSelectLabel') ;
	uiDropDownMiddleTitle.innerHTML = obj.innerHTML ;
	uiDropDownAnchor.style.display = 'none' ;
} ;

eXo.webui.UIDropDownControl = new UIDropDownControl() ;
