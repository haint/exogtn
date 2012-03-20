@Application(defaultController = org.exoplatform.juzu.register.controllers.RegisterController.class)
@Assets(scripts = {@org.juzu.plugin.asset.Script(src = "public/javascripts/jquery-1.7.1.min.js"),
   @Script(src = "public/javascripts/jquery.form.js"),
   @Script(src = "public/javascripts/jquery.validate.min.js"),
   @Script(src = "public/javascripts/register.js")}, stylesheets = {
   @Stylesheet(src = "public/stylesheets/UIFormWithTitle.css"),
   @Stylesheet(src = "public/stylesheets/UIForm.css")})
@Bindings(@Binding(value = org.exoplatform.services.organization.OrganizationService.class, implementation = GateInMetaProvider.class))
package org.exoplatform.juzu.register;
import org.juzu.plugin.binding.Bindings;
import org.juzu.plugin.binding.Binding;
import org.juzu.plugin.asset.Stylesheet;
import org.juzu.plugin.asset.Script;
import org.juzu.plugin.asset.Assets;
import org.juzu.Application;

