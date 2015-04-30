
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


        //Parse.Cloud.run('facebookInfo')
    });