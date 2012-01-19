/**
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
package org.exoplatform.portal.resource;

import org.exoplatform.web.application.JavascriptManager;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * @author <a href="mailto:ndkhoi168@gmail.com">Nguyen Duc Khoi</a>
 * Jan 19, 2012
 */
public class TestJavascriptManager extends AbstractWebResourceTest
{
   private JavascriptManager jsManager;

   @Override
   protected void setUp() throws Exception
   {
      jsManager = new JavascriptManager();
   }

   public void testAddEventListener()
   {
      String eventHandler = "eXo.core.onclick";
      String eventName = "click";
      String elementId = "eventId";
      String expected = "eXo.addEvent('eventId', 'click', eXo.core.onclick); \n";
      jsManager.addEventListener(elementId, eventName, eventHandler);
      assertEquals(expected);
   }
   
   public void testAddEventListerWithData()
   {
      Map<String, String> data = new LinkedHashMap<String, String>();
      data.put("key1", "value1");
      data.put("key2", "value2");
      String eventHandler = "eXo.core.onclick";
      String eventName = "click";
      String elementId = "eventId";
      String expected = "eXo.addEvent('eventId', 'click', eXo.core.onclick, {key1:value1, key2:value2}); \n";
      jsManager.addEventListener(elementId, eventName, eventHandler, data);
      assertEquals(expected);
   }
   
   public void testAddEventListerWithJSONData()
   {
      String eventHandler = "eXo.core.onclick";
      String eventName = "click";
      String elementId = "eventId";
      String jsonData = "{key1:value1, key2:value2}";
      String expected = "eXo.addEvent('eventId', 'click', eXo.core.onclick, {key1:value1, key2:value2}); \n";
      jsManager.addEventListener(elementId, eventName, eventHandler, jsonData);
      assertEquals(expected);
   }
   
   private void assertEquals(String expected)
   {
      Writer writer = new StringWriter();
      try
      {
         jsManager.writeJavascript(writer);
         assertEquals(expected, writer.toString());
      }
      catch (IOException e)
      {
         e.printStackTrace();
      }
   }
}
