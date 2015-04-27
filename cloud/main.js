
	// Use Parse.Cloud.define to define as many cloud functions as you want.
	// For example:

	Parse.Cloud.beforeSave("New", function(request, response){

		var newEntity = request.object;
		newEntity.set("state",0);
		response.success();

	});


	Parse.Cloud.afterSave("Score", function(request){

		
		//Sacar la propiedad new del request
		var newEntity = request.object.get("new");

		//Buscar todos los scores asociados a este new
		var query = new Parse.Query("Score");
		query.equalTo("new", newEntity);
		query.find().then(function (results){


	    	//crear una variable donde se almacenan todos los scores
	    	var sum = 0;

	      //Recorrer los scores y sacar el promedio 
	      for (var i = 0; i < results.length; ++i) {
	        sum += results[i].get("score");
	      }
	      var average =  (sum / results.length);
	      newEntity.set("average",average);

		 },function(error){

		 });
	}); 