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
package org.exoplatform.juzu.register.controllers;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import nl.captcha.Captcha;
import nl.captcha.servlet.CaptchaServletUtil;

import org.exoplatform.juzu.register.Flash;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.services.organization.Query;
import org.exoplatform.services.organization.User;
import org.exoplatform.services.organization.UserHandler;
import org.exoplatform.webui.exception.MessageException;
import org.exoplatform.webui.form.UIFormStringInput;
import org.exoplatform.webui.form.validator.EmailAddressValidator;
import org.exoplatform.webui.form.validator.NaturalLanguageValidator;
import org.exoplatform.webui.form.validator.PasswordStringLengthValidator;
import org.exoplatform.webui.form.validator.UsernameValidator;
import org.exoplatform.webui.form.validator.Validator;
import org.juzu.Controller;
import org.juzu.Path;
import org.juzu.Resource;
import org.juzu.Response;
import org.juzu.View;
import org.juzu.io.CharStream;
import org.juzu.plugin.ajax.Ajax;
import org.juzu.template.Template;

/**
 * @author <a href="mailto:haithanh0809@gmail.com">Hai Thanh Nguyen</a>
 * @version $Id$
 * 
 */
public class RegisterController extends Controller
{

   @Inject
   @Path("main.gtmpl")
   Template main;

   @Inject
   @Path("message.gtmpl")
   org.exoplatform.juzu.register.templates.message message;

   @Inject
   OrganizationService organizationService;

   @Inject
   Flash flash;

   private Map<String, Validator> validators;

   public RegisterController()
   {
      validators = new HashMap<String, Validator>();
      validators.put(FieldNameConstant.USER_NAME, new UsernameValidator(3, 30));
      validators.put(FieldNameConstant.PASSWORD, new PasswordStringLengthValidator(6, 30));
      validators.put(FieldNameConstant.NAME, new NaturalLanguageValidator());
      validators.put(FieldNameConstant.EMAIL_ADDRESS, new EmailAddressValidator());
   }

   @View
   public void index()
   {
      main.render();
   }

   private Response.Resource<CharStream> createJSON(final Map<String, String> data)
   {
      Response.Resource<CharStream> json = new Response.Resource<CharStream>()
      {

         @Override
         public String getMimeType()
         {
            return "application/json";
         }

         @Override
         public int getStatus()
         {
            return 200;
         }

         @Override
         public Class<CharStream> getKind()
         {
            return CharStream.class;
         }

         @Override
         public void send(CharStream stream) throws IOException
         {
            stream.append("{");
            for (Map.Entry<String, String> entry : data.entrySet())
            {
               stream.append("\"" + entry.getKey() + "\"");
               stream.append(":");
               stream.append("\"" + entry.getValue() + "\"");
               stream.append(",");
            }
            stream.append("}");
         }
      };
      return json;
   }

   @Resource
   public Response serveImage()
   {
      Captcha captcha = new Captcha.Builder(200, 50).addText().gimp().addNoise().addBackground().build();
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      CaptchaServletUtil.writeImage(baos, captcha.getImage());

      flash.setCaptcha(captcha.getAnswer());
      return Response.ok("image/png", new ByteArrayInputStream(baos.toByteArray()));
   }

   @Ajax
   @Resource
   public Response validate(String name, String value) throws Exception
   {
      Validator validator = null;
      if (name.equals("password") || name.equals("confirmPassword"))
      {
         validator = validators.get(FieldNameConstant.PASSWORD);
      }
      else if (name.equals("firstName") || name.equals("lastName"))
      {
         validator = validators.get(FieldNameConstant.NAME);
      }
      else
      {
         validator = validators.get(name);
      }

      if (validator == null)
         return null;

      UIFormStringInput input = new UIFormStringInput(name, value);
      Map<String, String> result = new HashMap<String, String>();
      result.put("msg", "");
      result.put("return", "true");

      UserHandler userHandler = organizationService.getUserHandler();

      if (name.equals(FieldNameConstant.USER_NAME) && userHandler.findUserByName(value) != null)
      {
         result.put("msg", "This username already exists, please enter another one");
         result.put("return", "false");
      }
      else if (name.equals(FieldNameConstant.EMAIL_ADDRESS))
      {
         Query query = new Query();
         query.setEmail(value);
         if (userHandler.findUsersByQuery(query).getSize() > 0)
         {
            result.put("msg", "Email " + value + " already existed");
            result.put("return", "false");
         }
      }

      try
      {
         validator.validate(input);
      }
      catch (MessageException e)
      {
         result.put("msg", e.getDetailMessage().getMessageKey());
         result.put("return", "false");
      }
      return createJSON(result);
   }

   @Ajax
   @Resource
   public Response saveUser(String username, String password, String confirmPassword, String firstName,
      String lastName, String emailAddress, String captcha)
   {
      try
      {
         if (!captcha.equals(flash.getCaptcha()))
         {
            return Response.ok("<strong>Captcha is incorrect</strong>");
         }

         UserHandler userHandler = organizationService.getUserHandler();

         User user = userHandler.createUserInstance(username);
         user.setPassword(password);
         user.setFirstName(firstName);
         user.setLastName(lastName);
         user.setEmail(emailAddress);

         userHandler.createUser(user, true);// Broadcast user creaton event
         return Response.ok("<script type='text/javascript'>alert('Username " + username
            + " create successfully');window.location.href='/'</script>");
      }
      catch (Exception e)
      {
         e.printStackTrace();
         return Response.ok(e.getMessage());
      }
   }
}
