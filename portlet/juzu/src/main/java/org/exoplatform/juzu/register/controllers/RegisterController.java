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
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

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
import org.juzu.Action;
import org.juzu.Controller;
import org.juzu.Path;
import org.juzu.Resource;
import org.juzu.Response;
import org.juzu.View;
import org.juzu.plugin.ajax.Ajax;
import org.juzu.template.Template;

/**
 * @author <a href="mailto:haithanh0809@gmail.com">Hai Thanh Nguyen</a>
 * @version $Id$
 *
 */
public class RegisterController extends Controller
{

	@Inject @Path("register.gtmpl")
	Template register;
	
	@Inject @Path("message.gtmpl")
	org.exoplatform.juzu.register.templates.message message;

	@Inject
	OrganizationService organizationService;

	@Inject
	Flash flash;

	private Map<String, Validator> validators;
	
	public RegisterController() {
		 validators = new HashMap<String, Validator>();
		 validators.put(FieldNameConstant.USER_NAME, new UsernameValidator(3, 30));
		 validators.put(FieldNameConstant.PASSWORD, new PasswordStringLengthValidator(6, 30));
		 validators.put(FieldNameConstant.NAME, new NaturalLanguageValidator());
		 validators.put(FieldNameConstant.EMAIL_ADDRESS, new EmailAddressValidator());
	}

	@View
	public void index() 
	{
		register.render();
	}

	@Resource
	public Response serveImage()
	{
		Captcha captcha = new Captcha.Builder(200, 50).addText().gimp().addNoise().addBackground().build();
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		CaptchaServletUtil.writeImage(baos, captcha.getImage());

		flash.setCaptcha(captcha.getAnswer());
		System.out.println("captcha answer: " + flash.getCaptcha());
		return Response.ok("image/png", new ByteArrayInputStream(baos.toByteArray()));
	}
	
	//@Ajax
	//@Resource
	public void checkUsername(String username) throws Exception {
		UserHandler userHandler = organizationService.getUserHandler();
		String msg = "This username is available";
		if (userHandler.findUserByName(username) != null)
		{
			msg = "This username already exists, please enter another one";
		}
		
		message.with().msg(msg).render();
	}
	
	@Ajax
	@Resource
	public void validateField(String name, String value, String madatory) throws Exception
	{
		if(Boolean.parseBoolean(madatory) && value.trim().isEmpty()) {
			message.with().msg("Field is required").render();
		} else if(name.equals(FieldNameConstant.USER_NAME)) {
			checkUsername(value);
		}
		
		Validator validator = validators.get(name);
		UIFormStringInput input = new UIFormStringInput(name, value);
		
		try {
			validator.validate(input);
			flash.setValid(true);
		}
		catch (MessageException e) {
			flash.setValid(false);
			message.with().msg(e.getDetailMessage().getMessageKey()).render();
		}
	}

	@Action
	public Response saveUser(String username, String password, String confirmPassword, String firstName, String lastName, String emailAddress, String captcha) throws Exception {
		UserHandler userHandler = organizationService.getUserHandler();
		
		if(!flash.isValid()) 
		{
			flash.setError("Some input field is incorrect");
			return RegisterController_.index();
		}
		
		if(!confirmPassword.equals(password)) {
			flash.setError("UIAccountForm.msg.password-is-not-match");
			return RegisterController_.index();
		}

		//Check if user name already existed
		if (userHandler.findUserByName(username) != null)
		{
			flash.setError("This username already exists, please enter another one");
			return RegisterController_.index();
		}

		//Check if mail address is already used
		Query query = new Query();
		query.setEmail(emailAddress);
		if (userHandler.findUsersByQuery(query).getSize() > 0)
		{
			flash.setError("Email " + emailAddress + " already existed");
			return RegisterController_.index();
		}

			User user = userHandler.createUserInstance(username);
			user.setPassword(password);
			user.setFirstName(firstName);
			user.setLastName(lastName);
			user.setEmail(emailAddress);

			userHandler.createUser(user, true);//Broadcast user creaton event
			flash.setSuccess("Username " + username + " create successfully");
			return RegisterController_.index();
	}
}
