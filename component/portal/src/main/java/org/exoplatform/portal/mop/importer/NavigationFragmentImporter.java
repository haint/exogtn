/*
 * Copyright (C) 2011 eXo Platform SAS.
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

package org.exoplatform.portal.mop.importer;

import org.exoplatform.portal.config.model.I18NString;
import org.exoplatform.portal.config.model.PageNode;
import org.exoplatform.portal.config.model.PageNodeContainer;
import org.exoplatform.portal.mop.Described;
import org.exoplatform.portal.mop.SiteKey;
import org.exoplatform.portal.mop.description.DescriptionService;
import org.exoplatform.portal.mop.navigation.GenericScope;
import org.exoplatform.portal.mop.navigation.NavigationContext;
import org.exoplatform.portal.mop.navigation.NavigationService;
import org.exoplatform.portal.mop.navigation.NodeChangeListener;
import org.exoplatform.portal.mop.navigation.NodeChangeQueue;
import org.exoplatform.portal.mop.navigation.NodeContext;
import org.exoplatform.portal.mop.navigation.NodeModel;
import org.exoplatform.portal.mop.navigation.NodeState;
import org.exoplatform.portal.mop.navigation.Scope;
import org.exoplatform.portal.tree.diff.Adapters;
import org.exoplatform.portal.tree.diff.ListAdapter;
import org.exoplatform.portal.tree.diff.ListChangeIterator;
import org.exoplatform.portal.tree.diff.ListChangeType;
import org.exoplatform.portal.tree.diff.ListDiff;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * @author <a href="mailto:julien.viet@exoplatform.com">Julien Viet</a>
 */
public class NavigationFragmentImporter
{

   private static final ListAdapter<PageNodeContainer, String> PAGE_NODE_CONTAINER_ADAPTER = new ListAdapter<PageNodeContainer, String>()
   {
      public int size(PageNodeContainer list)
      {
         List<PageNode> nodes = list.getNodes();
         if (nodes == null)
         {
            return 0;
         }
         else
         {
            return nodes.size();
         }
      }

      public Iterator<String> iterator(PageNodeContainer list, boolean reverse)
      {
         List<PageNode> nodes = list.getNodes();
         if (nodes == null)
         {
            return Collections.<String>emptyList().iterator();
         }
         else {
            String[] names = new String[nodes.size()];
            int index = 0;
            for (PageNode child : nodes)
            {
               names[index++] = child.getName();
            }
            return Adapters.<String>list().iterator(names, reverse);
         }
      }
   };

   private static final ListAdapter<NodeContext<?>, String> NODE_ADAPTER = new ListAdapter<NodeContext<?>, String>()
   {
      public int size(NodeContext<?> list)
      {
         return list.getNodeCount();
      }

      public Iterator<String> iterator(NodeContext<?> list, boolean reverse)
      {
         int size = list.getNodeCount();
         String[] names = new String[size];
         int index = 0;
         for (NodeContext<?> child = list.getFirst();child != null;child = child.getNext())
         {
            names[index++] = child.getName();
         }
         return Adapters.<String>list().iterator(names, reverse);
      }
   };

   /** . */
   private final String[] path;
   
   /** . */
   private final NavigationService navigationService;
   
   /** . */
   private final SiteKey navigationKey;

   /** . */
   private final Locale portalLocale;

   /** . */
   private final DescriptionService descriptionService;

   /** . */
   private final PageNodeContainer src;

   public NavigationFragmentImporter(
      String[] path,
      NavigationService navigationService,
      SiteKey navigationKey,
      Locale portalLocale,
      DescriptionService descriptionService,
      PageNodeContainer src)
   {
      this.path = path;
      this.navigationService = navigationService;
      this.navigationKey = navigationKey;
      this.portalLocale = portalLocale;
      this.descriptionService = descriptionService;
      this.src = src;
   }

   public NodeContext<?> perform()
   {
      NavigationContext navigationCtx = navigationService.loadNavigation(navigationKey);

      //
      if (navigationCtx != null)
      {
         NodeContext root = navigationService.loadNode(NodeModel.SELF_MODEL, navigationCtx, GenericScope.branchShape(path), null);

         //
         NodeContext from = root;
         for (String name : path)
         {
            NodeContext a = from.get(name);
            if (a != null)
            {
               from = a;
            }
            else
            {
               from = from.add(null, name);
            }
         }

         // Collect labels
         Map<NodeContext<?>, Map<Locale, Described.State>> labelMap = new HashMap<NodeContext<?>, Map<Locale, Described.State>>();

         // Perform save
         perform(src, from, labelMap);

         // Save the node
         navigationService.saveNode(root, null);

         //
         for (Map.Entry<NodeContext<?>, Map<Locale, Described.State>> entry : labelMap.entrySet())
         {
            String id = entry.getKey().getId();
            descriptionService.setDescriptions(id, entry.getValue());
         }

         //
         return from;
      }
      else
      {
         return null;
      }
   }
   
   private void perform(PageNodeContainer src, final NodeContext<?> dst, final Map<NodeContext<?>, Map<Locale, Described.State>> labelMap)
   {
      navigationService.rebaseNode(dst, Scope.CHILDREN, null);

      //
      ListDiff<NodeContext<?>, PageNodeContainer, String> diff = new ListDiff<NodeContext<?>, PageNodeContainer, String>(
         NODE_ADAPTER,
         PAGE_NODE_CONTAINER_ADAPTER);

      //
      List<PageNode> srcChildren = src.getNodes();
      ListChangeIterator<NodeContext<?>, PageNodeContainer, String> it = diff.iterator(dst, src);
      NodeChangeQueue<PageNodeContainer> changes = new NodeChangeQueue<PageNodeContainer>();

      //
      while (it.hasNext())
      {
         ListChangeType changeType = it.next();
         String name = it.getElement();
         PageNode srcChild = src.getNode(name);
         NodeContext<?> dstChild = dst.get(name);

         //
         switch (changeType)
         {
            case SAME:
               perform(srcChild, dstChild, labelMap);
               break;
            case ADD:
               if (dst.getNode(name) != null)
               {
                  // It's a move we do nothing
               }
               else
               {
                  // It's an addition
                  int index = srcChildren.indexOf(srcChild);
                  PageNode previous = index == 0 ? null : srcChildren.get(index - 1);
                  changes.onAdd(srcChild, src, previous);
               }
               break;
            case REMOVE:
               if (src.getNode(name) != null)
               {
                  // It's a move
                  int index = srcChildren.indexOf(srcChild);
                  PageNode previous = index == 0 ? null : srcChildren.get(index - 1);
                  changes.onMove(srcChild, src, src, previous);
               }
               else
               {
                  // It's a removal we do nothing
               }
               break;
         }
      }

      //
      changes.broadcast(new NodeChangeListener.Base<PageNodeContainer>()
      {
         @Override
         public void onAdd(PageNodeContainer target, PageNodeContainer parent, PageNodeContainer previous)
         {
            add((PageNode)target, (PageNode)previous, dst);
         }

         private void add(PageNode target, PageNode previous, NodeContext<?> dst)
         {
            I18NString labels = target.getLabels();

            //
            String label;
            Map<Locale, Described.State> description;
            if (labels.isSimple())
            {
               label = labels.getSimple();
               description = null;
            }
            else if (labels.isEmpty())
            {
               label = null;
               description = null;
            }
            else
            {
               label = null;
               description = new HashMap<Locale, Described.State>();
               for (Map.Entry<Locale, String> entry : labels.getExtended(portalLocale).entrySet())
               {
                  description.put(entry.getKey(), new Described.State(entry.getValue(), null));
               }
            }

            //
            String name = target.getName();
            int index;
            if (previous != null)
            {
               index = dst.get((previous).getName()).getIndex() + 1;
            }
            else
            {
               index = 0;
            }
            NodeContext<?> child = dst.add(index, name);
            Date start = target.getStartPublicationDate();
            Date end = target.getEndPublicationDate();
            NodeState state = new NodeState(
               label,
               target.getIcon(),
               start == null ? -1 : start.getTime(),
               end == null ? -1 : end.getTime(),
               target.getVisibility(),
               target.getPageReference()
            );
            child.setState(state);

            //
            if (description != null)
            {
               labelMap.put(child, description);
            }

            //
            List<PageNode> targetChildren = target.getNodes();
            if (targetChildren != null)
            {
               PageNode targetPrevious = null;
               for (PageNode targetChild : targetChildren)
               {
                  add(targetChild, targetPrevious, child);
                  targetPrevious = targetChild;
               }
            }
         }
      });
   }
}