@org.juzu.Application(
   defaultController=org.exoplatform.juzu.register.controllers.RegisterController.class
)

@org.juzu.plugin.asset.Assets(
	scripts = {
		@org.juzu.plugin.asset.Script(src = "public/javascripts/jquery-1.7.1.min.js"),
		@org.juzu.plugin.asset.Script(src = "public/javascripts/register.js")
	},
	stylesheets = {
		@org.juzu.plugin.asset.Stylesheet(src = "public/stylesheets/UIFormWithTitle.css"),
		@org.juzu.plugin.asset.Stylesheet(src = "public/stylesheets/UIForm.css")
	}
)

@org.juzu.plugin.binding.Bindings(
   @org.juzu.plugin.binding.Binding(value = org.exoplatform.services.organization.OrganizationService.class, implementation = GateInMetaProvider.class)
)
package org.exoplatform.juzu.register;

