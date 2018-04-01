var app = {
  inicio: function() {
    window.screen.orientation.lock('portrait');
    DIAMETRO_BOLA = 30;
    dificultad = 0;
    velocidadX = 1;
    velocidadY = 1;
    puntuacion = 0;
    vidas      = 9;
    n_bombas   = 10;

    alto = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;
    bola_x = Math.trunc(ancho/2);
    bola_y = 600;
    
    cx = [bola_x];
    cy = [bola_y];

    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function() {

    function preload() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      game.stage.backgroundColor = '#f27d0c';
      game.load.image('bola', 'assets/bolita.png');
      game.load.image('estrella', 'assets/estrella.png');
      game.load.image('bomba', 'assets/bomba.png');
      game.load.image('plat_v','assets/pv_2.png');
      game.load.image('plat_h','assets/ph_2.png');
      game.load.image('linea','assets/linea.png');
      game.load.image('agujero','assets/agujero.png');
    }

    function create() {
      var x,y;
      game.add.text(30,1,'Juego Phaser - Juan Manuel Martínez',{fontSize: '15px'});
      dificilText = game.add.text(1, 15, 'Nivel: '+dificultad, {fontSize: '20px'});
      scoreText   = game.add.text(120, 20, 'Puntos: '+puntuacion, {fontSize: '30px', fill: '#757676'});
      vidasText   = game.add.text(1, 35, 'Vidas: '+vidas,{fontSize: '20px'});
      
      linea    = game.add.sprite(0,60,'linea');
      plat_v_x = Math.trunc(ancho/2)-16;
      plat_v   = game.add.sprite(plat_v_x, 300,'plat_v');
      cx.push(plat_v_x);
      cy.push(300);
      x = app.inicioX();
      y = app.inicioY();
      plat_h   = game.add.sprite(x, y,'plat_h');
      cx.push(x);
      cy.push(y);
      x = app.inicioX();
      y = app.inicioY();
      agujero  = game.add.sprite(x, y,'agujero');
      cx.push(x);
      cy.push(y);
      bola     = game.add.sprite(bola_x, bola_y, 'bola');

      x = app.inicioX();
      y = app.inicioY();
      estrella    = game.add.sprite(x, y, 'estrella');
      cx.push(x);
      cy.push(y);
      bombas   = game.add.group();
      for (var i = 0; i < n_bombas; i++){
        x = app.inicioX();
        y = app.inicioY();
        bombas.create(x, y, 'bomba');
        cx.push(x);
        cy.push(y);
      }
      
      game.physics.arcade.enable(bola);
      game.physics.arcade.enable(estrella);
      game.physics.arcade.enable(bombas);
      game.physics.arcade.enable(linea);
      game.physics.arcade.enable(plat_v);
      game.physics.arcade.enable(plat_h);
      game.physics.arcade.enable(agujero);

      plat_v.body.collideWorldBounds = true;
      plat_v.body.immovable = true;

      plat_h.body.collideWorldBounds = true;
      plat_h.body.immovable = true;
            
      linea.body.collideWorldBounds = true;
      linea.body.immovable = true;

      agujero.body.setSize(10, 10);
      bola.body.setSize(18, 18);
      bola.body.collideWorldBounds = true;
      bola.body.onWorldBounds = new Phaser.Signal();
      bola.body.onWorldBounds.add(app.decrementaPuntuacion, this);

    }

    function update() {
      var color;
      var factorDificultad = (300 + (dificultad * 100));
      bola.body.velocity.y = (velocidadY * factorDificultad);
      bola.body.velocity.x = (velocidadX * (-1 * factorDificultad));
      
      if (bola.body.checkWorldBounds()) {game.stage.backgroundColor ='#ff0000';}
      else { switch (dificultad) {case 0:color='#f27d0c';break;
                                  case 1:color='#f4a226';break;
                                  case 2:color='#f5b041';break;
                                  case 3:color='#f8c471';break;
                                  case 4:color='#fad7a0';break;
                                  case 5:color='#fdebd0';break;
                                  default: color='#ffffff';break;
                                  };
             game.stage.backgroundColor = color;
           };
      
      
      game.physics.arcade.collide(bola, linea);
      game.physics.arcade.collide(bola, plat_v);
      game.physics.arcade.collide(bola, plat_h);
      
      game.physics.arcade.overlap(bola, estrella, app.incrementaPuntuacion, null, this);
      game.physics.arcade.overlap(bola, bombas, app.sumabomba, null, this);
      game.physics.arcade.overlap(bola, agujero, app.finJuego, null, this);
      
    }
    var estados = { preload: preload, create: create, update: update };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);
  },

  finJuego: function(){
    vidas = 0;
    vidasText.text = 'Vidas: '+vidas;
    alert("No te quedan vidas. La partida ha terminado.");
    window.screen.close();
    app.recomienza();
  },
  
  calculaDificultad: function() {
    if (puntuacion > 0) {dificultad = Math.trunc(puntuacion / 60);};
    if (dificultad < 0) {dificultad = 0;};
    dificilText.text = 'Nivel: '+dificultad;
    scoreText.text = 'Puntos: '+puntuacion;
    vidasText.text = 'Vidas: '+vidas;
  },

  sumabomba: function(bola,bomba) {
    var bbx = bomba.body.x;
    var bby = bomba.body.y;
    puntuacion -= 10;
    --vidas;
    if (vidas<0){app.finJuego();}
    app.calculaDificultad();
    for (var i = 0; i < cx.length; i++){
          if (cx[i]===bbx){cx[i]=0;}
          if (cy[i]===bby){cy[i]=0;}
        } 
    bomba.kill();
  },

  decrementaPuntuacion: function() {
    --puntuacion;
    app.calculaDificultad();
  },

  incrementaPuntuacion: function() {
    puntuacion += 30;
    app.calculaDificultad();
    estrella.body.x = app.inicioX();
    estrella.body.y = app.inicioY();
  },

  inicioX: function() {
    var x,margen;
    var correcto;
    do {x=app.numeroAleatorioHasta(ancho - DIAMETRO_BOLA);
        correcto=true;
        for (var i = 0; i < cx.length; i++){
          if (i<4){margen=25;}
          else {margen=10;}
          if (cx[i]>x-margen && cx[i]<x+margen){correcto=false;}
          if (cx[i]===0){cx[i]=x;correcto=true;}
        }
       }
    while (correcto===false);
    return x;
  },

  inicioY: function() {
    var y,margen;
    var correcto;
    do {y=app.numeroAleatorioHasta(alto - DIAMETRO_BOLA);
        correcto = true;
        for (var i = 0; i < cy.length; i++){
          if (i<4){margen=25;}
          else {margen=10;}
          if (cy[i]>y-margen && cy[i]<y+margen){correcto=false;}
          if (cy[i]===0){cy[i]=y;correcto=true;}
        }  
       }
    while (y<65 || correcto===false);
    return y;
  },

  numeroAleatorioHasta: function(limite) {
    return Math.floor(Math.random() * limite);
  },

  vigilaSensores: function() {
    function onError() {
      console.log('¡Error en vigilaSensores!');
    }
    function onSuccess(datosAceleracion) {
      app.detectaAgitacion(datosAceleracion);
      app.registraDireccion(datosAceleracion);
    }
    navigator.accelerometer.watchAcceleration(onSuccess, onError, {
      frequency: 10
    });
  },

  detectaAgitacion: function(datosAceleracion) {
    agitacionX = datosAceleracion.x > 10;
    agitacionY = datosAceleracion.y > 10;
    if (agitacionX || agitacionY) {
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function() {
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion) {
    velocidadX = datosAceleracion.x;
    velocidadY = datosAceleracion.y;
  }
};

if ('addEventListener'in document) {
  document.addEventListener('deviceready', function() {
    app.inicio();
  }, false);
}
