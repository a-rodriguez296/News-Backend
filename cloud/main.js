
	// Use Parse.Cloud.define to define as many cloud functions as you want.
	// For example:

	Parse.Cloud.beforeSave("New", function(request, response){

		var newEntity = request.object;
		newEntity.set("state",0);
		newEntity.set("average",0);
		response.success();

	});


	Parse.Cloud.afterSave("Score", function(request){

		
		//Sacar la propiedad new del request
		var newEntity = request.object.get("new");

		console.log(newEntity);
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

	      //Creación del promedio
	      var average =  (sum / results.length);

	      //Asignación del nuevo valor
	      newEntity.set("average",average);

	      //Guardar valor nuevo
	      newEntity.save();
		 },function(error){

		 });
	}); 