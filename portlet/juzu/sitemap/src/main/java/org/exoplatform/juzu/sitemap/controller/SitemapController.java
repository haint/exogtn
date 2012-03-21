/*
 * Copyright (C) 2012 eXo Platform SAS.
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
package org.exoplatform.juzu.sitemap.controller;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import javax.inject.Inject;
import javax.portlet.PortletPreferences;

import org.exoplatform.portal.mop.SiteType;
import org.exoplatform.portal.mop.Visibility;
import org.exoplatform.portal.mop.navigation.GenericScope;
import org.exoplatform.portal.mop.navigation.Scope;
import org.exoplatform.portal.mop.user.UserNavigation;
import org.exoplatform.portal.mop.user.UserNode;
import org.exoplatform.portal.mop.user.UserNodeFilterConfig;
import org.exoplatform.portal.mop.user.UserPortal;
import org.exoplatform.portal.webui.navigation.TreeNode;
import org.exoplatform.portal.webui.util.Util;
import org.exoplatform.web.url.navigation.NodeURL;
import org.exoplatform.webui.application.WebuiRequestContext;
import org.juzu.Controller;
import org.juzu.Path;
import org.juzu.View;
import org.juzu.template.Template;

/**
 * @author <a href="mailto:haithanh0809@gmail.com">Hai Thanh Nguyen</a>
 * @version $Id$
 * 
 */
public class SitemapController extends Controller
{
   @Inject
   @Path("index.gtmpl")
   org.exoplatform.juzu.sitemap.templates.index index;

   private UserNodeFilterConfig NAVIGATION_FILTER_CONFIG;

   private TreeNode treeNode;

   private Scope scope;

   @Inject
   private SitemapController(PortletPreferences preferences)
   {
      UserNodeFilterConfig.Builder filterConfigBuilder = UserNodeFilterConfig.builder();
      filterConfigBuilder.withReadWriteCheck().withVisibility(Visibility.DISPLAYED, Visibility.TEMPORAL);
      filterConfigBuilder.withTemporalCheck();
      NAVIGATION_FILTER_CONFIG = filterConfigBuilder.build();

      int level = Integer.parseInt(preferences.getValue("level", "2"));
      if (level <= 0)
         scope = Scope.ALL;
      else
         scope = GenericScope.treeShape(level);
   }

   @View
   public void index() throws Exception
   {
      index.with().controller(this).render();
   }

   public String treeView() throws Exception
   {
      StringBuilder b = new StringBuilder();
      loadTreeNodes();
      NodeURL nodeURL = WebuiRequestContext.getCurrentInstance().createURL(NodeURL.TYPE);
      travelNode(treeNode, nodeURL, b);
      return b.toString();
   }

   private void travelNode(TreeNode rootNode, NodeURL nodeURL, StringBuilder b)
   {
      List<TreeNode> children = rootNode.getChildren();

      int size = 0;
      for (TreeNode child : children)
      {
         size++;
         UserNode node = child.getNode();
         String label = node.getEncodedResolvedLabel();
         String actionLink = null;
         if (node.getPageRef() != null)
         {
            nodeURL.setNode(node);
            actionLink = nodeURL.toString();
         }

         if (child.hasChild())
         {
            b.append("<li")
               .append(size == children.size() ? " class=\"expandable lastExpandable\">" : " class=\"expandable\">")
               .append("<div")
               .append(
                  size == children.size() ? " class=\"hitarea expandable-hitarea lastExpandable-hitarea\">"
                     : " class=\"hitarea expandable-hitarea\">").append("</div>");
            if (actionLink != null)
            {
               b.append("<a href='").append(actionLink).append("'>").append(label).append("</a>");
            }
            else
            {
               b.append("<span>").append(label).append("</span>");
            }
            b.append("<ul style='display: none;'>");
            travelNode(child, nodeURL, b);
            b.append("</ul>");
            b.append("</li>");
         }
         else
         {
            b.append("<li").append(size == children.size() ? " class='last'>" : ">").append("<a href='")
               .append(actionLink).append("'>").append(label).append("</a>").append("</li>");
         }
      }
   }

   private void loadTreeNodes() throws Exception
   {
      treeNode = new TreeNode();

      UserPortal userPortal = Util.getPortalRequestContext().getUserPortalConfig().getUserPortal();
      List<UserNavigation> listNavigations = userPortal.getNavigations();

      List<UserNode> childNodes = new LinkedList<UserNode>();
      for (UserNavigation nav : rearrangeNavigations(listNavigations))
      {
         try
         {
            UserNode rootNode = userPortal.getNode(nav, scope, NAVIGATION_FILTER_CONFIG, null);
            if (rootNode != null)
            {
               childNodes.addAll(rootNode.getChildren());
            }
         }
         catch (Exception ex)
         {
            ex.printStackTrace();
         }
      }
      treeNode.setChildren(childNodes);
   }

   private List<UserNavigation> rearrangeNavigations(List<UserNavigation> listNavigation)
   {
      List<UserNavigation> returnNavs = new ArrayList<UserNavigation>();

      List<UserNavigation> portalNavs = new ArrayList<UserNavigation>();
      List<UserNavigation> groupNavs = new ArrayList<UserNavigation>();
      List<UserNavigation> userNavs = new ArrayList<UserNavigation>();

      for (UserNavigation nav : listNavigation)
      {
         SiteType siteType = nav.getKey().getType();
         switch (siteType)
         {
            case PORTAL :
               portalNavs.add(nav);
               break;
            case GROUP :
               groupNavs.add(nav);
               break;
            case USER :
               userNavs.add(nav);
               break;
         }
      }

      returnNavs.addAll(portalNavs);
      returnNavs.addAll(groupNavs);
      returnNavs.addAll(userNavs);

      return returnNavs;
   }
}
