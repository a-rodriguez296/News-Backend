
	var Image = require("parse-image");


	Parse.Cloud.beforeSave("NewsEntity", function(request, response){

		var newsEntity = request.object;

		//Validación para solo hacer estos cambios únicamente cuando se esta creando el objeto. 
		if (newsEntity.isNew()) {


			
			
			if (!newsEntity.get("photo")) {
			    //checkin.save();
			    response.success();
			} else {
			
			        Parse.Cloud.httpRequest({
			            url: newsEntity.get("photo").url()
			        }).then(function(response){
			            var image = new Image();
			            return image.setData(response.buffer);
			        }).then(function (image){
			
			            return image.scale({ 
			                width: 128,
			                height: 128}
			                )
			        }).then(function(image){
			            return image.setFormat("JPEG");
			        }).then(function(image){
			            return image.data();
			        }).then(function(buffer){
			            var base64 = buffer.toString("base64");
			            var currentDate = new Date().getTime();
			            var cropped = new Parse.File('thumbnail' + currentDate, {base64: base64});
			            return cropped.save();
			        }).then(function(cropped){
			            newsEntity.set("photoThumbnail", cropped);
			
			        }).then(function(result){

			        	newsEntity.set("author",Parse.User.current().get('username'))
			        	newsEntity.set("state",0);
			        	newsEntity.set("average",0);
			            response.success();
			        }, function(error){
			            response.error(error);
			        });
			    }




		}
		else{
			response.success();
		}
	});


	Parse.Cloud.afterSave("Score", function(request){

		
		//Sacar la propiedad new del request
		var newsEntity = request.object.get("newsEntity");

		console.log(newsEntity);
		//Buscar todos los scores asociados a este new
		var query = new Parse.Query("Score");
		query.equalTo("newsEntity", newsEntity);
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

	function facebookRequest () {

		var fbAccessToken = Parse.User.current().get('authData')['facebook']['access_token'];

		var promiseFacebook = Parse.Cloud.httpRequest({
		    url: 'https://graph.facebook.com/me?fields=id,name,birthday,hometown,email,picture,gender,friends&access_token='+ fbAccessToken,
		    headers: {
		        Accept: 'application/json'
		    }
		});

		return promiseFacebook; 
	}

    //Función para descargar data de facebook
    Parse.Cloud.define("facebookInfo", function(request, response) {

        
        facebookRequest().then(function (httpResponse) {
        	response.success(JSON.parse(httpResponse.text));
        });       
    });


    Parse.Cloud.afterSave(Parse.User, function(request) {

        Parse.Cloud.useMasterKey();  
        //Buscar el role
        query = new Parse.Query(Parse.Role);
        query.equalTo("name", "Common User");
        query.first({
        	success: function () {
        		
		        facebookRequest().then(function (httpResponse) {
		        	var facebookObj = JSON.parse(httpResponse.text);
		        	console.log(facebookObj.name);
		        	request.object.set("username", facebookObj.name);
	        		//Cambio nombre de usuario
			        request.object.relation("users").add(request.user);
			        request.object.save();
		        });
        	},
        	error: function(error){
        	}
        });
    });


    Parse.Cloud.job("updateNews", function(request, status){

    	Parse.Cloud.useMasterKey();

    	//Buscar todas las noticias que esteén en estado 1. Esto significa que ya han sido aprovadas por el curador
    	var query = new Parse.Query("NewsEntity");
		query.equalTo("state", 1);
		query.find().then(function(results){

			for (var i = 0; i < results.length; i++) {
				
				//Cambiar el estado de las variables a 2 
				var newsEntity =  results[i];
				newsEntity.set("state", 2);

				//Grabar
				newsEntity.save();
			};

			//
			status.success("Migration completed successfully.");

		});
    });