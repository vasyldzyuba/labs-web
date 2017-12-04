//Підключаємо бібліотеки
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const port = 8000;
// підключаємо мюлтер для тороби з файлами
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/news-img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname);
    }
});

var upload = multer({
    storage: storage
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));

app.use(express.static(__dirname + '/public'));
//створюємо конекшн до бд
const connection = mysql.createConnection({
    host: 'localhost'
    , user: 'root'
    , password: '123456'
    , database: 'website'
});
//створюємо таблички в бд
var initDb = function () {
    connection.query('' +
	 'CREATE TABLE IF NOT EXISTS news (' +
	 'id int(11) NOT NULL AUTO_INCREMENT,' +
	 'img varchar(50), ' +
	 'headline varchar(50),' +
	 'text varchar(500),' +
	 'PRIMARY KEY(id) )',
	function (err) {
        if (err) throw err;
        console.log('CREATE TABLE IF NOT EXISTS news')
    });
};
initDb();
var initDb2 = function () {
    connection.query('' +
	 'CREATE TABLE IF NOT EXISTS reviews (' +
	 'id int(11) NOT NULL AUTO_INCREMENT,' +
	 'name varchar(50), ' +
	 'date varchar(50),' +
	 'text varchar(1000),' +
	 'PRIMARY KEY(id) )',
	function (err) {
        if (err) throw err;
        console.log('CREATE TABLE IF NOT EXISTS reviews')
    });
};
initDb2();
//пост запит який дістає з бд відгуки
app.post('/read-reviews', function (req, res) {
    connection.query('SELECT * FROM reviews', function (err, responce) {
        if (err) throw err;
        console.log('get all reviews, length: ' + responce.length);
        res.status(200).send(responce);
    });
});
//пост запит який записує в бд відгуки
app.post('/addreviews', function (req, res) {
	connection.query('INSERT INTO reviews SET ?', req.body, function (err, result) {
		if (err) throw err;
		console.log('reviews added to database with id: ' + result.insertId);
	});
	res.sendStatus(200);
})
//пост запит який дістає з бд новини
app.post('/read-news', function (req, res) {
    connection.query('SELECT * FROM news', function (err, responce) {
        if (err) throw err;
        console.log('get all news, length: ' + responce.length);
        res.status(200).send(responce);
    });
});
//пост запит який записує в бд новини
app.post('/addnews', function (req, res) {
	var cd = [];
	connection.query('INSERT INTO news SET ?', req.body, function (err, result) {
		if (err) throw err;
		console.log('news added to database with id: ' + result.insertId);
		var obk = {
			id: result.insertId
		};
		cd.push(obk);
		console.log(cd);
		res.status(200).send(cd);
	});
//	console.log(cd);
	
	
	
})
//пост для додавання зображення
app.post('/images', upload.any(), function (req, res, next) {
    res.sendStatus(200);
})
//пост для додавання шляху до картинки в бд
app.post('/addnameofimg:cId', function (req, res) {
    connection.query('UPDATE news SET img ='+req.params.cId+' WHERE id = ?', req.params.cId, function (err) {
        if (err) throw err;
    });
    res.sendStatus(200);
});

//Усі адреси контролюються клієнтським ангуляром
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
//Запуск серверу
app.listen(port, function (err) {
    if (err) throw err;
    console.log('Server start on port 8000!');
});