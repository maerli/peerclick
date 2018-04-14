var express = require('express');
var fs = require('fs');
var ip = require('./ip');
var app = express();
var socket = require('socket.io');

//variaveis de configuração

let port = 3000;



//getIP é uma função para mostrar o endereço de IP
//do computador
console.log(`
	abra seu navegador e digite:
	${ip.getIP()}:${port}
		ou
	${ip.getIP()}:${port}/show
	`);

var optquantity = 5;
var item = 1; // item que está sendo votado
//por padrão a contagm começa a partir do item 1
var user = 1;//

/*
	Ao conectar-se ao servidor o aluno é identificado com um número
	que por padrão se inicia no 1.
	user = 1,
	a medida que outros alunos se conectam a variavel user é incrementada
*/

var users = [];
//guardar quais usuarios respoderam ao item corrente

function save(){
	//salva em 'dados.txt' no formato JSON, para futuras analises dos dados
	fs.writeFile('dados.txt',JSON.stringify(itens),'utf8',function(data){
			console.log('dados gravados com sucesso');
		});
}

function getitens(){
	return {
		'a':0,
		'b':0,
		'c':0,
		'd':0,
		'e':0,
		'item':item
	};
}

var itens = [getitens()];

app.get('/aluno',function(req,res){
	res.sendFile( __dirname + "/public/" + "index.html" );
});

app.use(express.static('public'));

var server = app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});


var io = socket(server);

io.sockets.on('connection',function(sockets){
	console.log('nova conexao' + sockets.id);
	
	sockets.emit('change',itens[itens.length - 1]);
	
	sockets.on('answer',function(data){
		if(users.indexOf(parseInt(data.user)) == -1){
			users.push(parseInt(data.user));
			itens[itens.length - 1][data.vowel] += 1;
			sockets.broadcast.emit('change',itens[itens.length - 1]);
		}
		console.log(users);
		
	});
	
	sockets.on('init',function(data){
		if(data == null){
			sockets.emit('user',user);
			user += 1;
		}else{
			sockets.emit('user',data);
		}
		sockets.emit('change_number',optquantity);
	});
	
	sockets.on('same',function(data){
		users = [];
		itens.push(getitens());
		io.sockets.emit('reload',item);
		save();
		sockets.emit('change',itens[itens.length - 1]);
	});
	
	sockets.on('check',function(data){
		sockets.emit('check',users.indexOf(parseInt(data)) == -1);
	});
	
	sockets.on('change',function(data){
		item += 1;
		users = [];
		itens.push(getitens());
		reload(io.sockets);
		save();
		io.sockets.emit('change',itens[itens.length - 1]);
		
	});
	sockets.on('change_number',function(data){
		optquantity = data;
		sockets.broadcast.emit('change_number',optquantity);
	})
	sockets.on('disconnect',function(data){
		console.log(sockets.id + ' foi disconecatado!');
	});
	

	
});

app.get('/show',function(req,res){
	res.sendFile( __dirname + "/public/" + "show.html" );
});

app.get('/change',function(req,res){
	res.send('ok');
});

function reload(b){
	b.emit('reload',itens.length);
}