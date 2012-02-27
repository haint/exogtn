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

/**
 * Manages the main navigation menu on the portal
 */
function UIPortalNavigation() {
  this.currentOpenedMenu = null;
  this.scrollMgr = null;
  this.scrollManagerLoaded = false;   
};
/**
 * Sets some parameters :
 *  . the superClass to eXo.webui.UIPopupMenu
 *  . the css style classes
 * and calls the buildMenu function
 */
UIPortalNavigation.prototype.init = function(popupMenu, container, x, y) {
  this.superClass = eXo.webui.UIPopupMenu;
  this.superClass.init(popupMenu, container, x, y) ;
  
  this.tabStyleClass = "MenuItem";
  this.itemStyleClass = "NormalItem";
  this.selectedItemStyleClass = "SelectedItem";
  this.itemOverStyleClass = "OverItem";
  this.containerStyleClass = "MenuItemContainer";
  
  this.buildMenu(popupMenu);
};
/**
 * Calls the init function when the page loads
 */
UIPortalNavigation.prototype.onLoad = function() {
  var uiWorkingWorkspace = document.getElementById("UIWorkingWorkspace");
  var uiNavPortlets = eXo.core.DOMUtil.findDescendantsByClass(uiWorkingWorkspace, "div", "UINavigationPortlet");
  if (uiNavPortlets.length) {
		var mainContainer = eXo.core.DOMUtil.findFirstDescendantByClass(uiNavPortlets[0], "ul", "UIHorizontalTabs");
 		eXo.portal.UIPortalNavigation.init(uiNavPortlets[0], mainContainer, 0, 0);
		for (var i = 1; i < uiNavPortlets.length; ++i) {
				uiNavPortlets[i].style.display = "none";
		}		
  }
};
/**
 * Builds the menu and the submenus
 * Configures each menu item :
 *  . sets onmouseover and onmouseout to call setTabStyle
 *  . sets the width of the item
 * Checks if a submenu exists, if yes, set some parameters :
 *  . sets onclick on the item to call toggleSubMenu
 *  . sets the width and min-width of the sub menu container
 * For each sub menu item :
 *  . set onmouseover to onMenuItemOver and onmouseout to onMenuItemOut
 *  . adds onclick event if the item contains a link, so a click on this item will call the link
 */
UIPortalNavigation.prototype.buildMenu = function(popupMenu) {
  var DOMUtil = eXo.core.DOMUtil;
  var topContainer = DOMUtil.findFirstDescendantByClass(popupMenu, "ul", "UIHorizontalTabs");
  topContainer.id = "PortalNavigationTopContainer";
  // Top menu items
  var topItems = DOMUtil.findDescendantsByClass(topContainer, "li", "UITab");
  for (var i = 0; i < topItems.length; i++) {
    var archos = DOMUtil.getElementsBy(function(a) {    	
    	return a.parentNode === topItems[i] || a.parentNode.parentNode === topItems[i];
    }, "a", topItems[i]);    
    var tmp = archos.length ? archos[0] : topItems[i];
    
    eXo.addEvent(tmp, "focus", eXo.portal.UIPortalNavigation.setTabStyleOnMouseOver);
    tmp.onblur = function(e) {
    	e = e || window.event;
    	e.which = e.which || e.keyCode;
    	if (e.which == 9 || e.which == 27) {
    		//Tab || ESC keypress --> Change tab 
    		eXo.portal.UIPortalNavigation.setTabStyleOnMouseOut(e, this);        		
    	}
    };
    eXo.addEvent(topItems[i], "mouseover", eXo.portal.UIPortalNavigation.setTabStyleOnMouseOver);
    eXo.addEvent(topItems[i], "mouseout", eXo.portal.UIPortalNavigation.setTabStyleOnMouseOut);
    if (!topItems[i].getAttribute('hidesubmenu')) {
    	topItems[i].onmousemove = eXo.portal.UIPortalNavigation.tabOnMouseMove;
    }
    topItems[i].style.width = topItems[i].offsetWidth + "px";

    /**
     * TODO: fix IE7;
     */
    var container = DOMUtil.findFirstDescendantByClass(topItems[i], "ul", this.containerStyleClass);
    if (container) {
    	if (eXo.core.Browser.isIE6()) {
    		container.style.width = topItems[i].offsetWidth + "px";
    	} else {
    		container.style.minWidth = topItems[i].offsetWidth + "px";
    	}
    }
  }
  
  var itemConts = DOMUtil.findDescendantsByClass(topContainer, "ul", this.containerStyleClass);
  for (var i = 0; i < itemConts.length; i++) {
	  var cont = itemConts[i];
	  if(!cont.id) cont.id = DOMUtil.generateId("PortalNavigationContainer");
	  cont.resized = false;

	  var items = DOMUtil.findDescendantsByClass(cont, "li", this.tabStyleClass);
	  if(items.length == 0) cont.parentNode.removeChild(cont);
	  for(var j = 0; j < items.length; j ++) {
		  var archos = DOMUtil.findDescendantsByTagName(items[j],"a");
		  for (k = 0; k < archos.length; k++) {
			  //Make sure uitab will not looses focus
			  archos[k].tabIndex = -1;
		  }
		  items[j].onmouseover = eXo.portal.UIPortalNavigation.onMenuItemOver;
		  items[j].onmouseout = eXo.portal.UIPortalNavigation.onMenuItemOut;		  		  
	  }	  
  }

  if (!eXo.portal.UIPortalNavigation.docEventRegistered) {
	  var Browser = eXo.core.Browser;
	  eXo.addEvent(document, "keydown.UIPortalNavigation", eXo.portal.UIPortalNavigation.onKeyDown);
	  eXo.addEvent(document, "click.UIPortalNavigation", function(e) {
		  e = e || window.event;
		  if (!eXo.portal.UIPortalNavigation.currentOpenedMenu) return;
		  var target = eXo.core.Browser.getEventSource(e);
		  if (!DOMUtil.findAncestorByClass(target, "li", eXo.portal.UIPortalNavigation.tabStyleClass)) {
			  eXo.portal.UIPortalNavigation.hideKeyboardContainers(e);
		  }
	  });
	  eXo.portal.UIPortalNavigation.docEventRegistered = true;
  }
};

UIPortalNavigation.prototype.hideKeyboardContainers = function(e) {
	var DOMUtil = eXo.core.DOMUtil;
	var nav = eXo.portal.UIPortalNavigation;	
	
	if (nav.currItem) {
		var tmp = nav.currItem; 
		do {
			tmp.onmouseout.call(tmp, e);
			tmp = DOMUtil.findAncestorByClass(tmp, nav.tabStyleClass);
		} while(tmp);
	}
	nav.hideMenu();	
};

UIPortalNavigation.prototype.onKeyDown = function(e) {
	var DOMUtil = eXo.core.DOMUtil;
	var nav = eXo.portal.UIPortalNavigation;				
	
	e = e || window.event;
	e.which = e.which || e.keyCode;
	switch (e.which) {
	case 27:
		//ESC		
	case 9:
		//Tab
		nav.hideKeyboardContainers(e);
		var src = eXo.core.Browser.getEventSource(e);
		var tab = DOMUtil.findAncestorByClass(src, "HighlightNavigationTab");
		if (tab) {
			src.onblur(e);
		}
		return;
	case 37:
		//Left
		nav.onLeftKeyPressed(e);
		break;		
	case 38:
		//Up
		nav.onUpKeyPressed(e);
		break;
	case 39:
		//Right
		nav.onRightKeyPressed(e);
		break;
	case 40:
		//Down
		nav.onDownKeyPressed(e);
		break;
	default: 
			return;
	}
	
	if (nav.currItem) {
		var a = DOMUtil.getChildrenByTagName(nav.currItem, "a")[0];
		if (a) {
			DOMUtil.addClass(a, "Selected");		
			//IE8 : need to setTimeout to make it has focus
			//jQuery $(a).focus() works without this workaround
			window.setTimeout(function() {a.focus();}, 0);
		}
		return false;
	}
};

UIPortalNavigation.prototype.onUpKeyPressed = function(e) {
	var nav = eXo.portal.UIPortalNavigation;
	var DOMUtil = eXo.core.DOMUtil;
	if (!nav.currentOpenedMenu || !nav.currItem) return;
	
	var tmp = nav.currItem;
	do {			
		var prevItem = DOMUtil.findPreviousElementByTagName(tmp, "li");
		tmp = prevItem;
	} while (prevItem && !DOMUtil.hasClass(prevItem, nav.tabStyleClass));
	
	if (!prevItem) {
		var childs = DOMUtil.findChildrenByClass(nav.currItem.parentNode, "li", nav.tabStyleClass);
		prevItem = childs[childs.length - 1];
	}
	nav.currItem.onmouseout(e);
	nav.currItem = prevItem;
	prevItem.onmouseover(e);
};

UIPortalNavigation.prototype.onDownKeyPressed = function(e) {
	var nav = eXo.portal.UIPortalNavigation;
	var DOMUtil = eXo.core.DOMUtil;
	
	if (!nav.currentOpenedMenu) return;
	var nextItem;
	if (nav.currItem) {
		nav.currItem.onmouseout(e);
		var tmp = nav.currItem;
		do {
			nextItem = DOMUtil.findNextElementByTagName(tmp, "li");
			tmp = nextItem;
		} while (nextItem && !DOMUtil.hasClass(nextItem, nav.tabStyleClass));
	}
	if (!nextItem) {			
		var visibleConts = nav.superClass.currentVisibleContainers;
		var currCont = document.getElementById(visibleConts[visibleConts.length - 1]);
		nextItem = DOMUtil.findFirstChildByClass(currCont, "li", nav.tabStyleClass);			
	}
	nav.currItem = nextItem;
	nextItem.onmouseover(e);	
};

UIPortalNavigation.prototype.onLeftKeyPressed = function(e) {
	var nav = eXo.portal.UIPortalNavigation;
	if (!nav.currentOpenedMenu || !nav.currItem) return;
	
	var parentItem = eXo.core.DOMUtil.findAncestorByClass(nav.currItem, nav.tabStyleClass);
	if (!parentItem) return;
	
	nav.currItem.onmouseout(e);
	nav.currItem = parentItem;
};

UIPortalNavigation.prototype.onRightKeyPressed = function(e) {
	var nav = eXo.portal.UIPortalNavigation;
	var DOMUtil = eXo.core.DOMUtil;
	if (!nav.currentOpenedMenu || !nav.currItem) return;
	
	var childItem = DOMUtil.findFirstDescendantByClass(nav.currItem, "li", nav.tabStyleClass);
	if (!childItem) return;
	
	var a = DOMUtil.getChildrenByTagName(nav.currItem, "a")[0];
	DOMUtil.removeClass(a, "Selected");
	nav.currItem = childItem;
	childItem.onmouseover(e);
};

UIPortalNavigation.prototype.generateContainer = function(data) {		
	var htmlFrags = "<ul class='" + this.containerStyleClass + "' style='display: none;' id='"; 
	htmlFrags += eXo.core.DOMUtil.generateId("PortalNavigationContainer") + "' resized='false'>";	

	for (var i = 0; i < data.length; i++) {
		var node = data[i];
		var actionLink = node.actionLink ? node.actionLink : "javascript:void(0);";
				
		htmlFrags += ("<li class='MenuItem " + (node.hasChild ? "ArrowIcon " : "") + (node.isSelected ? "SelectedItem'" : "NormalItem'")); 
		htmlFrags += (node.hasChild ? (" exo:getNodeURL='" + node.getNodeURL + "' ") : "" ); 
		htmlFrags += ("onmouseover='eXo.portal.UIPortalNavigation.onMenuItemOver(this)' onmouseout='eXo.portal.UIPortalNavigation.onMenuItemOut(this)'");
		htmlFrags += ("' title='" + node.label + "'>");
		htmlFrags += ("<a class='ItemIcon " + (node.icon ? node.icon : "DefaultPageIcon") + "'" +
				"href='" + actionLink + "' tabindex='-1'>" + (node.label.length > 40 ? node.label.substring(0,37) + "..." : node.label) + "</a>");
		if (node.childs.length) {
			htmlFrags += eXo.portal.UIPortalNavigation.generateContainer(node.childs);			
		}
		htmlFrags += "</li>";
	}
	htmlFrags += "</ul>";
	return htmlFrags;
};

UIPortalNavigation.prototype.setTabStyleOnMouseOver = function(e) {
  var DOMUtil = eXo.core.DOMUtil ;
  var tab = this ;
  if (!DOMUtil.hasClass(tab, "UITab")) {
	  tab = DOMUtil.findAncestorByClass(tab, "UITab");
  }
  if (eXo.portal.UIPortalNavigation.previousMenuItem != tab) {	  
	  eXo.portal.UIPortalNavigation.hideKeyboardContainers();
  }
  //highlights the tab
  eXo.webui.UIHorizontalTabs.changeTabNavigationStyle(tab, true);
  
  eXo.portal.UIPortalNavigation.previousMenuItem = tab ;    
  
  var getNodeURL = tab.getAttribute("exo:getNodeURL");
  var menuItemContainer = eXo.core.DOMUtil.findFirstDescendantByClass(tab, "ul", eXo.portal.UIPortalNavigation.containerStyleClass);
  if (getNodeURL && !menuItemContainer) {
	  var jsChilds = ajaxAsyncGetRequest(getNodeURL,false)
	  try {
		  var data = eXo.core.JSON.parse(jsChilds);		  
	  } catch (e) {
	  }				  
	  if (!data || !data.length) {
		  return;
	  }
	  var temp = document.createElement("div");
	  temp.innerHTML = eXo.portal.UIPortalNavigation.generateContainer(data); 		  
	  tab.appendChild(eXo.core.DOMUtil.findFirstChildByClass(temp, "ul", eXo.portal.UIPortalNavigation.containerStyleClass));
  }
  
  if (!eXo.portal.UIPortalNavigation.menuVisible) {    
    var hideSubmenu = tab.getAttribute('hideSubmenu') ;
    menuItemContainer = eXo.core.DOMUtil.findFirstDescendantByClass(tab, "ul", eXo.portal.UIPortalNavigation.containerStyleClass);
    if (menuItemContainer && !hideSubmenu) {      
		  if(eXo.core.Browser.browserType == "ie") {
		    var navAncestor = DOMUtil.findAncestorByClass(tab, "UINavigationPortlet") ;
		    var pageBody = document.getElementById("UIPageBody");
		    if(pageBody){
		    	var uicomponents = DOMUtil.getChildrenByTagName(pageBody.parentNode, "div") ;
		    	for(var i = 0; i < uicomponents.length; i ++) {
		      	var navPortlet = DOMUtil.findFirstDescendantByClass(uicomponents[i], "div", "UINavigationPortlet") ;
		      	if(navPortlet && (navAncestor != navPortlet)) {
		      		var tabsContainer = DOMUtil.findFirstDescendantByClass(navPortlet, "ul", "UIHorizontalTabs");
		      		tabsContainer.style.position = "static" ;
		      	}
		    	}	
		    } 
		  }
      eXo.portal.UIPortalNavigation.toggleSubMenu(e, tab, menuItemContainer) ;
    }
  }  
  
  eXo.portal.UIPortalNavigation.cancelHideMenuContainer() ;
  eXo.portal.UIPortalNavigation.menuVisible = true ;
} ;

UIPortalNavigation.prototype.setTabStyleOnMouseOut = function(e, src) {
  var tab = src || this;
  var nav = eXo.portal.UIPortalNavigation;  
  
  eXo.webui.UIHorizontalTabs.changeTabNavigationStyle(tab, false);
  eXo.portal.UIPortalNavigation.hideMenuTimeout(300) ;
}

UIPortalNavigation.prototype.tabOnMouseMove = function() {
  eXo.portal.UIPortalNavigation.cancelHideMenuContainer() ;
} ;

/**
 * Shows or hides a submenu
 * Calls hideMenuContainer to hide a submenu.
 * Hides any other visible sub menu before showing the new one
 * Sets the width of the submenu (the first time it is shown) to fix a bug in IE
 * Sets the currentOpenedMenu to the menu being opened
 */
UIPortalNavigation.prototype.toggleSubMenu = function(e, tab, menuItemContainer) {
  if (!e) e = window.event;
  e.cancelBubble = true;
  var src = eXo.core.Browser.getEventSource(e);
  if (src.tagName.toLowerCase() == "a" && !menuItemContainer) {
    if (src.href.substr(0, 7) == "http://") {
      if (!src.target) {
        window.location.href = src.href
      } else {
        return true ;
      }
    } else eval(src.href);
    return false;
  }
  var item = tab;
  var DOMUtil = eXo.core.DOMUtil;
  if (menuItemContainer) {
    if (menuItemContainer.style.display == "none") {
      // shows the sub menu
      // hides a previously opened sub menu
      if (eXo.portal.UIPortalNavigation.currentOpenedMenu) eXo.portal.UIPortalNavigation.hideMenu();
      
      eXo.portal.UIPortalNavigation.superClass.pushVisibleContainer(menuItemContainer.id);
      menuItemContainer.style.display = "block";
      menuItemContainer.style.position = "absolute";
      var offParent = menuItemContainer.offsetParent;
      var y = item.offsetHeight + eXo.core.Browser.findPosYInContainer(item, offParent);
      var x = eXo.core.Browser.findPosXInContainer(item, offParent) + 2;
      if(eXo.core.I18n.isRT()) {
      	x = eXo.core.Browser.findPosX(offParent) + offParent.offsetWidth - eXo.core.Browser.findPosX(item) - item.offsetWidth;
//      	if(eXo.core.Browser.isIE6()) x += parseInt(document.getElementById("UIWorkingWorkspace").style.marginRight) ;
      }
      eXo.portal.UIPortalNavigation.superClass.setPosition(menuItemContainer, x, y, eXo.core.I18n.isRT());
      eXo.portal.UIPortalNavigation.superClass.show(menuItemContainer);
      
      menuItemContainer.style.width = menuItemContainer.offsetWidth - parseInt(DOMUtil.getStyle(menuItemContainer, "borderLeftWidth",true)) 
          - parseInt(DOMUtil.getStyle(menuItemContainer, "borderRightWidth",true)) + "px";
			var posXinBrowser = eXo.core.Browser.findPosX(menuItemContainer);
			if(eXo.core.I18n.isLT()) {
				if(posXinBrowser + menuItemContainer.offsetWidth >= eXo.core.Browser.getBrowserWidth()) {
					x += (item.offsetWidth - menuItemContainer.offsetWidth) ;
					menuItemContainer.style.left = x + "px";
				}
			} else {
				if(posXinBrowser + item.offsetWidth <menuItemContainer.offsetWidth) {
					x += (item.offsetWidth - menuItemContainer.offsetWidth) ;
					menuItemContainer.style.right = x + "px";
				}
			}
      eXo.portal.UIPortalNavigation.currentOpenedMenu = menuItemContainer.id;
    } else {
      // hides the sub menu
      eXo.portal.UIPortalNavigation.hideMenuContainer();
    }
  }
};

UIPortalNavigation.prototype.cancelHideMenuContainer = function() {
  if (this.hideMenuTimeoutId) {
    window.clearTimeout(this.hideMenuTimeoutId) ;
  }
} ;

UIPortalNavigation.prototype.closeMenuTimeout = function() {
  eXo.portal.UIPortalNavigation.hideMenuTimeout(200) ;
} ;

UIPortalNavigation.prototype.hideMenuTimeout = function(time) {
  this.cancelHideMenuContainer() ;
  if (!time || time <= 0) {
    time = 200 ;
  }
  //this.hideMenuTimeoutId = window.setTimeout(this.hideMenu, time) ;
  this.hideMenuTimeoutId = window.setTimeout('eXo.portal.UIPortalNavigation.hideMenu() ;', time) ;
} ;

/**
 * Adds the currentOpenedMenu to the list of containers to hide
 * and sets a time out to close them effectively
 * Sets currentOpenedMenu to null (no menu is opened)
 * Uses the methods from the superClass (eXo.webui.UIPopupMenu) to perform these operations
 */
UIPortalNavigation.prototype.hideMenuContainer = function() {
  var menuItemContainer = document.getElementById(eXo.portal.UIPortalNavigation.currentOpenedMenu);
  if (menuItemContainer) {
    eXo.portal.UIPortalNavigation.superClass.pushHiddenContainer(menuItemContainer.id);
    eXo.portal.UIPortalNavigation.superClass.popVisibleContainer();
    eXo.portal.UIPortalNavigation.superClass.setCloseTimeout();
    eXo.portal.UIPortalNavigation.superClass.hide(menuItemContainer);
    eXo.portal.UIPortalNavigation.currentOpenedMenu = null;
  }
  eXo.portal.UIPortalNavigation.currItem = null;
  this.previousMenuItem = false ;
  eXo.portal.UIPortalNavigation.menuVisible = false ;
};
/**
 * Changes the style of the parent button when a submenu has to be hidden
 */
UIPortalNavigation.prototype.hideMenu = function() {
  if (eXo.portal.UIPortalNavigation.currentOpenedMenu) {
    var currentItemContainer = document.getElementById(eXo.portal.UIPortalNavigation.currentOpenedMenu);
    var tab = eXo.core.DOMUtil.findAncestorByClass(currentItemContainer, "UITab");
    eXo.webui.UIHorizontalTabs.changeTabNavigationStyle(tab, false);
  }
  eXo.portal.UIPortalNavigation.hideMenuContainer();
  var DOMUtil = eXo.core.DOMUtil ;
  if(eXo.core.Browser.browserType == "ie") {
    var pageBody = document.getElementById("UIPageBody") ;
    if(!pageBody) return;
    var uicomponents = DOMUtil.getChildrenByTagName(pageBody.parentNode, "div") ;
    for(var i = 0; i < uicomponents.length; i ++) {
      var navPortlet = DOMUtil.findFirstDescendantByClass(uicomponents[i], "div", "UINavigationPortlet") ;
      if(navPortlet) {
      	var tabsContainer = DOMUtil.findFirstDescendantByClass(navPortlet, "ul", "UIHorizontalTabs");
      	tabsContainer.style.position = "relative" ;
      }
    }
  }  
};
/**
 * When the mouse goes over a menu item (in the main nav menu)
 * Check if this menu item has a sub menu, if yes, opens it
 * Changes the style of the button
 */
UIPortalNavigation.prototype.onMenuItemOver = function(menuItem) {  
  if (!menuItem || !menuItem.nodeName) menuItem = this;
  var DOMUtil = eXo.core.DOMUtil;
  
  var nav = eXo.portal.UIPortalNavigation;
  if (nav.currItem && nav.currItem !== menuItem) {
      var tmp = nav.currItem; 
      do {
    	  tmp.onmouseout.call(tmp);
    	  tmp = DOMUtil.findAncestorByClass(tmp, nav.tabStyleClass);    	  
    	  if (!tmp || tmp === menuItem || DOMUtil.findFirstChildByClass(tmp, nav.containerStyleClass) === menuItem.parentNode) break;
      } while(true);      
      nav.currItem = null;
  }
  
  var getNodeURL = menuItem.getAttribute("exo:getNodeURL");
  var subContainer = DOMUtil.findFirstDescendantByClass(menuItem, "ul", eXo.portal.UIPortalNavigation.containerStyleClass);
  if (getNodeURL && !subContainer) {
	  var jsChilds = ajaxAsyncGetRequest(getNodeURL,false);
	  try {
		  var data = eXo.core.JSON.parse(jsChilds);		  		  
	  } catch (e) {
	  }	
	  if (!data || !data.length) {
		  DOMUtil.removeClass(menuItem, "ArrowIcon");
		  menuItem.removeAttribute("exo:getNodeURL");
		  return;
	  }
	  var temp = document.createElement("div");
	  temp.innerHTML = eXo.portal.UIPortalNavigation.generateContainer(data); 		  
	  menuItem.appendChild(eXo.core.DOMUtil.findFirstChildByClass(temp, "ul", eXo.portal.UIPortalNavigation.containerStyleClass));
  }
    
  subContainer = DOMUtil.findFirstDescendantByClass(menuItem, "ul", eXo.portal.UIPortalNavigation.containerStyleClass);
  if (subContainer) {
	var visibleConts = eXo.portal.UIPortalNavigation.superClass.currentVisibleContainers;
	if (!visibleConts.contains(subContainer.id)) {
		eXo.portal.UIPortalNavigation.superClass.pushVisibleContainer(subContainer.id);		
	}
    eXo.portal.UIPortalNavigation.showMenuItemContainer(menuItem, subContainer) ;
    if (!subContainer.firstTime) {
        subContainer.style.width = subContainer.offsetWidth + 2 + "px";
        subContainer.firstTime = true;
    }
  }
};
/**
 * Shows a sub menu, uses the methods from superClass (eXo.webui.UIPopupMenu)
 */
UIPortalNavigation.prototype.showMenuItemContainer = function(menuItem, menuItemContainer) {
  var x = menuItem.offsetWidth;
  var y = menuItem.offsetTop;
  this.superClass.show(menuItemContainer);
  var posRight = eXo.core.Browser.getBrowserWidth() - eXo.core.Browser.findPosX(menuItem) - menuItem.offsetWidth ; 
  var rootX = (eXo.core.I18n.isLT() ? eXo.core.Browser.findPosX(menuItem) : posRight) ;
	if (x + menuItemContainer.offsetWidth + rootX > eXo.core.Browser.getBrowserWidth()) {
  	x -= (menuItemContainer.offsetWidth + menuItem.offsetWidth) ;
  }
  this.superClass.setPosition(menuItemContainer, x, y, eXo.core.I18n.isRT());
};
/**
 * When the mouse goes out a menu item from the main nav menu
 * Checks if this item has a sub menu, if yes calls methods from superClass to hide it
 */
UIPortalNavigation.prototype.onMenuItemOut = function(menuItem) {
  if (!menuItem || !menuItem.nodeName) menuItem = this;
  var DOMUtil = eXo.core.DOMUtil;
  var a = DOMUtil.getChildrenByTagName(menuItem, "a")[0];
  DOMUtil.removeClass(a, "Selected");
  
  var subContainer = eXo.core.DOMUtil.findFirstDescendantByClass(menuItem, "ul", eXo.portal.UIPortalNavigation.containerStyleClass);
  if (subContainer) {
    eXo.portal.UIPortalNavigation.superClass.pushHiddenContainer(subContainer.id);
    eXo.portal.UIPortalNavigation.superClass.popVisibleContainer();
    eXo.portal.UIPortalNavigation.superClass.setCloseTimeout(300);
  }
};

/***** Scroll Management *****/
/**
 * Function called to load the scroll manager that will manage the tabs in the main nav menu
 *  . Creates the scroll manager with id PortalNavigationTopContainer
 *  . Adds the tabs to the scroll manager
 *  . Configures the arrows
 *  . Calls the initScroll function
 */
UIPortalNavigation.prototype.loadScroll = function(e) {
  var uiNav = eXo.portal.UIPortalNavigation;
  var portalNav = document.getElementById("PortalNavigationTopContainer");
  if (portalNav) {
    // Creates new ScrollManager and initializes it
    uiNav.scrollMgr = eXo.portal.UIPortalControl.newScrollManager("PortalNavigationTopContainer");
    uiNav.scrollMgr.initFunction = uiNav.initScroll;
    // Adds the tab elements to the manager
    uiNav.scrollMgr.mainContainer = portalNav;
    uiNav.scrollMgr.arrowsContainer = eXo.core.DOMUtil.findFirstDescendantByClass(portalNav, "li", "ScrollButtons");
    uiNav.scrollMgr.loadElements("UITab");
    // Configures the arrow buttons
    var arrowButtons = eXo.core.DOMUtil.findDescendantsByTagName(uiNav.scrollMgr.arrowsContainer, "a");
    if (arrowButtons.length == 2) {
      uiNav.scrollMgr.initArrowButton(arrowButtons[0], "left", "ScrollLeftButton", "HighlightScrollLeftButton", "DisableScrollLeftButton");
      uiNav.scrollMgr.initArrowButton(arrowButtons[1], "right", "ScrollRightButton", "HighlightScrollRightButton", "DisableScrollRightButton");
    }
    // Finish initialization
    uiNav.scrollMgr.callback = uiNav.scrollCallback;
    uiNav.scrollManagerLoaded = true;
    uiNav.initScroll();
  }
};
/**
 * Init function for the scroll manager
 *  . Calls the init function of the scroll manager
 *  . Calculates the available space to render the tabs
 *  . Renders the tabs
 */
UIPortalNavigation.prototype.initScroll = function(e) {
  if (!eXo.portal.UIPortalNavigation.scrollManagerLoaded) eXo.portal.UIPortalNavigation.loadScroll();
  var scrollMgr = eXo.portal.UIPortalNavigation.scrollMgr;
  scrollMgr.init();
  // Gets the maximum width available for the tabs
  scrollMgr.checkAvailableSpace();
  scrollMgr.renderElements();
};
/**
 * A callback function to call after a scroll event occurs (and the elements are rendered)
 * Is empty so far.
 */
UIPortalNavigation.prototype.scrollCallback = function() {
};
/***** Scroll Management *****/
eXo.portal.UIPortalNavigation = new UIPortalNavigation() ;
