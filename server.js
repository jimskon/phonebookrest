
const express = require('express'),
    bodyParser = require("body-parser"),
    morgan = require("morgan");
const app = express();
port = 8082;


//Phone object constructor
var Phone = function(phone){
    this.first = phone.first;
    this.last = phone.last;
    this.phone = phone.phone;
    this.type = phone.type;
    this.RecNum = phone.RecNum;
};

const mysql = require('mysql');
// connection configurations
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'skon',
    password: 'Book$worm',
    database: 'skon'
});

// connect to database
connection.connect();
app.use(express.static('./public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(morgan('short'))

app.get('/phone/all', (req, res) => {
    console.log("Get all!");
    queryString = "SELECT * FROM PhoneBook";
    connection.query(queryString, function (err, rows, fields) {
	if(err) {
	    console.log("error: ", err);
	    result(err, null);
	}
	res.json(rows);
    });
})

app.get('/phone/last/:name', (req, res) => {
    const name = req.params.name;
    console.log("Get last:",name);
    queryString = "SELECT * FROM PhoneBook WHERE Last like '%"+name+"%'";
    connection.query(queryString,  function (err, rows, fields) {
	if(err) {
	    console.log("error: ", err.message);
	    result(err, null);
	}
	res.json(rows);
    });
})

app.get('/phone/first/:name', (req, res) => {
    const name = req.params.name;
    console.log("Get first:",name);
    queryString = "SELECT * FROM PhoneBook WHERE First like '%"+name+"%'";
    connection.query(queryString,  function (err, rows, fields) {
	if(err) {
	    console.log("error: ", err.message);
	    result(err, null);
	}
	res.json(rows);
    });
})

app.get('/phone/type/:type', (req, res) => {
    const type = req.params.type;
    console.log("Get type:",type);
    queryString = "SELECT * FROM PhoneBook WHERE Type like '%"+type+"%'";
    connection.query(queryString,  function (err, rows, fields) {
	if(err) {
	    console.log("error: ", err.message);
	    result(err, null);
	}
	res.json(rows);
    });
})

app.post('/phone/add', (req, result) => {
    var aPhone = req.body;
    console.log("Post Add phone!",aPhone.First);
    connection.query("INSERT INTO PhoneBook(First, Last, Phone, Type) VALUES ('"+aPhone.First+"','"+aPhone.Last+"','"+aPhone.Phone+"','"+aPhone.Type+"')", function (err, res, fields) {
	if (err) {
	    console.log("Error: ",err.message);
	    result.json(err.message);
	} else {
	    console.log(res.insertId);
	    result.json(res.insertID);
	}
    })
		  
})

app.put('/phone/update', (req, result) => {
    var aPhone = req.body;
    console.log("put!",aPhone.Type);
    queryString = "UPDATE PhoneBook SET First='"+aPhone.First+"', Last='"+aPhone.Last+"', Phone='"+aPhone.Phone+"', Type='"+aPhone.Type+"' WHERE RecNum='"+aPhone.RecNum+"'";
    
    connection.query(queryString, function (err, res, fields) {
			 if (err) {
			     console.log("Error: ",err.message);
			     result.json(err.message);
			 } else {
			     console.log(res.insertId);
			     result.json(res.insertID);
			 }
		     })

})
app.listen(port);
console.log('API server started on: ' + port);


