jQuery(function() {
	var v = jQuery("#form").validate({
		submitHandler: function(form) {
			jQuery(form).ajaxSubmit({
				target: "#result"
			});
		},
		
		rules: {
			username: "required validate",
			password: "required validate",
			confirmPassword: {
				required: true,
				validate: true,
				equalTo: "#password"
			},
			firstName: "required validate",
			lastName: "required validate",
			emailAddress: "required validate",
			captcha: "required"
		}
	});
	
	jQuery("#reset").click(function() {
		v.resetForm();
	});

	$('.jz').on("click", "#subscribe", function() {
		$("form").submit();
	});

	var msg;
	var result;
	
	$.validator.addMethod("validate", function(value, elt) {
		var validate = elt.RegisterApplication().validate();
		var param = {};
		param["name"] = $(elt).attr("name");
		param["value"] = value;
		var ajaxGet = $.ajax({
			type: "get",
			data: param,
			async: false,
		    url: validate,
		    debug: true,
		    dataType: "json",
		    success: function(data) {
		    	result = data["return"];
		    	msg = data["msg"];
		    },
		});
		return eval(result);
	}, function() { return msg; });
});