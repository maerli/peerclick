let MSG = {
		item:{
			'paraResponder':'Item ainda não respondido',
			'jaRespondido':'Este item já foi Respondido, espere o próximo item...',
			'responderNovamente':'Responder este item novamente'
		}
	}
	function $(id){
			return document.querySelector(id);
		}

	function solve(text){
		$('.solve').innerHTML = MSG.item[text];
	}


	function setUser(item){
		var store = sessionStorage.setItem('answer',item);
	}
	function getUser(str){
		return sessionStorage.getItem('answer');
	}

	addEventListener('load',function(){

		var vowel = '';


		function send(vowel){
			socket.emit('answer',{'user':getUser(),'vowel':vowel});
			it = true;
			button.disabled = true;
		}
		var clicked;
		it = true;
		var spans = document.querySelectorAll('span');
		for(var i = 0;i < spans.length;i++){
			spans[i].addEventListener('click',function(){
				button.disabled = it;
				vowel = this.id;
				if(clicked){
					clicked.style.backgroundColor = 'blue';
				}
				this.style.backgroundColor = 'gray';
				clicked = this;
			});
		}

		var button = document.querySelector('button');
		button.addEventListener('click',function(){
			send(vowel);
			solve('jaRespondido');
		});

		//quando usuario se conecta pela primeira vez
		if(getUser() == null){
		}

		socket = io.connect(location.host);
		socket.emit('init',getUser());
		socket.on('reload',function(item){
			reload(clicked,item);
			it = false;
		});

		socket.on('user',function(user){
			if(getUser() == null){
				setUser(user);
			}
			socket.emit('check',getUser());
		})
		socket.on('change_number',function(data){
			var spn = document.querySelectorAll('.box');
			for(let i = 0;i<5;i++){
				if(data > i){
					spn[i].style.display = 'inline-block';
				}else{
					spn[i].style.display = 'none';
				}
			}
		});
		socket.on('check',function(data){
			if(data.isclicked){
				reload(clicked,data.item);
			}else{
				solve('jaRespondido');
			}
			it = !data.isclicked;
		});

		function ponte(data){
			let letters = ['a','b','c','d','e'];
			return data.map(function(x,y){
				if(y == 0){
					return x;
				}else{
					return letters[y - 1] + ')' +  x;
			}}).join('<br><br>');
		}
		function reload(clicked,item){
			if(clicked){
				clicked.style.backgroundColor = 'blue';
			}
			if(itens[item]){
						$('#item').innerHTML = ponte(itens[item]);
			}
			button.disabled = true;
			solve('paraResponder');
		}

	});
