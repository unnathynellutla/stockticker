var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var port = process.env.PORT || 3000;
const csv = require('csv-parser');
const MongoClient = require('mongodb').MongoClient;
const urll = "mongodb+srv://unellu01:aaa@cluster0.xd9qb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
	
	
http.createServer(function (req, res) 
  {
	  
	  if (req.url == "/")
	  {
		  file = 'ticker.html';
		  fs.readFile(file, function(err, txt) {
    	  res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(txt);
		  });
	  }
	  else if (req.url == "/process")
	  {
		 res.writeHead(200, {'Content-Type':'text/html'});
		 console.log("Process the form");
		 pdata = "";
		 req.on('data', data => {
           pdata += data.toString();
         });

		// when complete POST data is received
		req.on('end', () => {
			pdata = qs.parse(pdata);
			//get query from form
			var ticker = String(pdata['ticker']);
			var name = String(pdata['company']);
			if(name.length == 0 && ticker.length == 0){
				res.write("Please enter a ticker or company name");
			} 
			else if(name.length != 0){
				res.write ("The company name is: "+ name +"<br>");
				var theQuery={Company: name};
				
			} else if (ticker.length != 0){
				res.write ("The ticker is: "+ ticker +"<br>");
				var theQuery = {Ticker: ticker};
				
			}
			//connect to mongo db
			MongoClient.connect(urll, { useUnifiedTopology: true }, 
			function(err, db) {
				if(err) { res.write("Connection err: " + err); return; }
				var dbo = db.db("stocks");
				var coll = dbo.collection('companies');
				coll.find(theQuery).toArray(function(err, items) {
				  if (err) {
					res.write("Error: '" + err+"'}");
				  } 
				  else {
					if(items.length == 0){
						res.write("No Items found. Please try again.");
					} 
					else{
					res.write("<br>Stocks: <br>");
					for (i=0; i<items.length; i++)
						res.write(i+1 + ". Company: " + items[i].Company + " Ticker: " + items[i].Ticker + "<br>");	
					}
								
				  } 
				 //close db
				  db.close();
				});  	 
			});  
		});
		
	  }
	  else 
	  {
		  res.writeHead(200, {'Content-Type':'text/html'});
		  console.log("Unknown page request");
	  }
	//end writing on page
  	setTimeout(function(){res.end();}, 2000);

}).listen(8080);
