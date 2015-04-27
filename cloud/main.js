
	// Use Parse.Cloud.define to define as many cloud functions as you want.
	// For example:

	Parse.Cloud.beforeSave("NewsEntity", function(request, response){

		var newsEntity = request.object;
		newsEntity.set("state",0);
		newsEntity.set("average",0);
		response.success();

	});


	Parse.Cloud.afterSave("Score", function(request){

		
		//Sacar la propiedad new del request
		var newsEntity = request.object.get("new");

		console.log(newsEntity);
		//Buscar todos los scores asociados a este new
		var query = new Parse.Query("Score");
		query.equalTo("new", newsEntity);
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
	      newsEntity.set("average",average);

	      //Guardar valor nuevo
	      newsEntity.save();
		 },function(error){

		 });
	}); 