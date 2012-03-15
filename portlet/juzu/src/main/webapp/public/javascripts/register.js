$(function() {

	var validate = function(elt, madatory) {
		var validate = elt.RegisterApplication().validateField();
		elt.$find("." + $(elt).attr("id") + "_validate").load(validate, {name : $(elt).attr("class"), value : $(elt).val(), madatory: madatory})
	}
	
	$('.jz').on("blur", "#username", function() {
		console.log("hehe");
		validate(this, true);
	});
	
	$('.jz').on("blur", "#password", function() {
		validate(this, true);
	});
	
	$('.jz').on("blur", "#confirmPassword", function() {
		validate(this, true);
	});
	
	$('.jz').on("blur", "#firstName", function() {
		validate(this, true);
	});
	
	$('.jz').on("blur", "#lastName", function() {
		validate(this, true);
	});
	
	$('.jz').on("blur", "#emailAddress", function() {
		validate(this, true);
	});
	
	$('.jz').on("click", "#subscribe", function() {
		$("form").submit();
	});
});