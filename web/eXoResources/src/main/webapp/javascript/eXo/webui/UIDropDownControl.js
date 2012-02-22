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
  var DOMUtil = eXo.core.DOMUtil;
  var root = document.getElementById(id);
  var title = DOMUtil.findFirstDescendantByClass(root, "div", "UIDropDownTitle");
  title.setAttribute("tabindex", 0);

  var anchors =  DOMUtil.findDescendantsByClass(root, "a",  "OptionItem");
  for(var i = 0; i < anchors.length; i++) {
	  eXo.addEvent(anchors[i], "mouseover", function(event) {
		  eXo.webui.UIDropDownControl.anchorMouseEnter(event);
	  }, { eleRoot : root, eleTarget : title });
	  
	  eXo.addEvent(anchors[i], "mouseout", function(event) {
		  eXo.webui.UIDropDownControl.anchorMouseLeave(event);
	  }, { eleRoot : root, eleTarget : title});
  }

  eXo.addEvent(title, "keyup", function(event) {
	  eXo.webui.UIDropDownControl.targetOnKeyUp(event);
  }, { eleRoot : root, eleTarget : title });

  eXo.addEvent(title, "blur", function(event) {
	  eXo.webui.UIDropDownControl.targetOnBlur(event);
  }, { eleRoot : root });
};

UIDropDownControl.prototype.targetOnBlur = function(event) {
	var DOMUtil = eXo.core.DOMUtil;
	var root = event.data.eleRoot;
	var anchor = DOMUtil.findFirstDescendantByClass(root, "a", "Over");
	if(anchor) anchor.className = "OptionItem";

	var anchorContainer  = DOMUtil.findFirstDescendantByClass(root, "div", "UIDropDownAnchor");
	anchorContainer.style.display = 'none';
	anchorContainer.visibility = 'hidden';
};

UIDropDownControl.prototype.targetOnKeyUp = function(event) {
	var DOMUtil = eXo.core.DOMUtil;
	var root = event.data.eleRoot;
	var anchorContainer  = DOMUtil.findFirstDescendantByClass(root, "div", "UIDropDownAnchor");
	
	if(event.which == 40) { // 40 is key code of arrow down
		if(anchorContainer.style.display == "none") {
			eXo.webui.UIDropDownControl.show(event.data.eleTarget, event);
		} else {
			eXo.webui.UIDropDownControl.downItem(root);
		}
	}	else if(event.which == 38) {
		if(anchorContainer.style.display == "none") {
			eXo.webui.UIDropDownControl.show(event.data.eleTarget, event);
		} else {
			eXo.webui.UIDropDownControl.upItem(root);
		}
	} else if(event.which == 27) { // 27 is key code of escape
		anchorContainer.style.display = "none";
		anchorContainer.style.visibility = "hidden";
	} else if(event.which == 13) { // 13 is key code of enter
		var anchor = DOMUtil.findFirstDescendantByClass(root, "a", "Over");
		if(anchor)  anchor.onclick();
	}
};

UIDropDownControl.prototype.anchorMouseEnter = function(event) {
	var target = event.data.eleTarget;
	var root = event.data.eleRoot
	//Necessary remove blur handler because current target will be lost focus then click
	eXo.removeEvent(target, "blur");
	var DOMUtil = eXo.core.DOMUtil;
	var anchor = DOMUtil.findFirstDescendantByClass(root, "a", "Over");
	if(anchor) anchor.className = "OptionItem";
};

UIDropDownControl.prototype.anchorMouseLeave = function(event) {
	var target  = event.data.eleTarget;
	eXo.addEvent(target, "blur", function(event) {
		eXo.webui.UIDropDownControl.targetOnBlur(event);
	}, { eleRoot : event.data.eleRoot });
};

UIDropDownControl.prototype.downItem = function(root) {
	var DOMUtil = eXo.core.DOMUtil;
  var anchors = DOMUtil.findDescendantsByClass(root, "a", "OptionItem");
  for(var i = 0; i < anchors.length; i++) {
    var current = anchors[i]
    if(DOMUtil.hasClass(current, "Over")) {
    	current.className = "OptionItem";
      if(i == anchors.length - 1) 
        break;
      else {
        var next = anchors[i+1];
        next.className = "OptionItem Over";
        return;
      }
    }
  }
  anchors[0].className = "OptionItem Over";
}

UIDropDownControl.prototype.upItem = function(root) {
	var DOMUtil = eXo.core.DOMUtil;
  var anchors = DOMUtil.findDescendantsByClass(root, "a", "OptionItem");
  for(var i = anchors.length - 1; i >= 0; i--) {
    var current = anchors[i]
    if(DOMUtil.hasClass(current, "Over")) {
    	current.className = "OptionItem";
      if(i == 0) 
        break;
      else {
        var next = anchors[i-1];
        next.className = "OptionItem Over";
        return;
      }
    }
  }
  anchors[anchors.length - 1].className = "OptionItem Over";
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
