!function(c){function a(d){if(b[d])return b[d].exports;var e=b[d]={exports:{},id:d,loaded:!1};return c[d].call(e.exports,e,e.exports,a),e.loaded=!0,e.exports}var b={};return a.m=c,a.c=b,a.p="",a(0)}([function(d,e,a){var b=(a(1),a(2)),c=a(6);document.addEventListener("DOMContentLoaded",function(){var a=document.getElementById("canvas"),e=document.getElementById("skier"),f=document.getElementById("obstacles"),g=a.getContext("2d"),d=new b(e,f),h=new c(d,g);a.addEventListener("mousemove",function(b){d.mousePos[0]=b.clientX-a.offsetLeft,d.mousePos[1]=b.clientY}),a.addEventListener("click",function(a){h.start()})})},function(a,c){var b={inherits:function(b,c){function a(){}a.constructor=b,a.prototype=c.prototype,b.prototype=new a},randPos:function(){for(var a=[],b=0;2>b;b++)a.push(Math.floor(500*Math.random()));return a},newTreePos:function(){var a=[];return a.push(Math.floor(500*Math.random())),a.push(500),a}};a.exports=b},function(g,h,b){var d=b(1),e=b(3),f=b(4),c=b(5),a=function(a,b){this.skierSpriteMap=a,this.obstacleSpriteMap=b,NUM_TREES=5,this.trees=[],this.skier=new e(this.skierSpriteMap),this.yeti=new c(this.skierSpriteMap),this.addTrees(),this.paused=!1,this.score=0,this.crashCount=0,this.isSkierCaught=!1,this.mousePos=[250,250]};a.prototype.reset=function(){NUM_TREES=5,this.trees=[],this.skier=new e(this.skierSpriteMap),this.yeti=new c(this.skierSpriteMap),this.addTrees(),this.paused=!1,this.score=0,this.crashCount=0,this.isSkierCaught=!1,this.mousePos=[250,250]},a.prototype.addTrees=function(b){for(var a=0;a<NUM_TREES;a++)this.trees.push(new f(d.randPos(),this.obstacleSpriteMap))},a.prototype.removeElapsed=function(){for(var a=0,b;a<this.trees.length;a++)this.trees[a].pos[1]<-50&&delete this.trees[a];b=[];for(a=0;a<this.trees.length;a++)void 0!==this.trees[a]&&b.push(this.trees[a]);this.trees=b},a.prototype.rebalanceTrees=function(){this.removeElapsed();for(var a=this.trees.length;a<NUM_TREES;a++)this.trees.push(new f(d.newTreePos(),this.obstacleSpriteMap))},a.prototype.checkCollision=function(){for(var a=0;a<this.trees.length;a++){if(Math.sqrt(Math.pow(this.trees[a].pos[0]-this.skier.pos[0],2)+Math.pow(this.trees[a].pos[1]-this.skier.pos[1],2))<20&&this.trees[a].colided===!1)return void this.colide(this.trees[a]);this.skier.ok()}},a.prototype.colide=function(a){this.skier.colide(),a.colided=!0,this.paused=!0,this.crashCount+=1,this.score-=100,setTimeout(function(){this.paused=!1}.bind(this),1e3)},a.prototype.checkCaught=function(){Math.sqrt(Math.pow(this.yeti.pos[0]-this.skier.pos[0],2)+Math.pow(this.yeti.pos[1]-this.skier.pos[1],2))<20&&this.catchSkier()},a.prototype.catchSkier=function(){this.isSkierCaught=!0,this.paused=!0,this.yeti.catchSkier(),this.skier.getCaught()},a.prototype.tallyScore=function(){this.score+=1,this.score>1e3?NUM_TREES=25:this.score>750?NUM_TREES=11:this.score>500?NUM_TREES=8:NUM_TREES=5},a.prototype.drawStats=function(a){var b="Score: "+this.score,c="Crashes: "+this.crashCount;a.fillStyle="#000000",a.font="18px 'PT Sans'",a.fillText(b,10,20),a.fillText(c,120,20),this.gameOverMessage(a)},a.prototype.gameOverMessage=function(a){var b,d,c,e;this.isSkierCaught&&(a.fillStyle="#000000",a.font="40px 'PT Sans'",b="You are Yeti food",d=a.measureText(b).width,a.fillText(b,canvas.width/2-d/2,100),a.fillStyle="#000000",a.font="18px 'PT Sans'",c="Click to play again",e=a.measureText(c).width,a.fillText(c,canvas.width/2-e/2,400))},a.prototype.moveObjects=function(){this.skier.move(this.mousePos),this.yeti.move(this.skier.pos),this.trees.forEach(function(a){a.move()})},a.prototype.step=function(){this.isSkierCaught&&(this.paused=!0),this.paused?(this.yeti.catchUp(),this.checkCaught()):(this.moveObjects(),this.tallyScore(),this.rebalanceTrees(),this.checkCollision(),this.checkCaught())},a.prototype.draw=function(a){a.clearRect(0,0,500,500),a.fillStyle="#FFFFFF",a.fillRect(0,0,500,500),this.trees.forEach(function(b){b.draw(a)}),this.skier.draw(a),this.yeti.draw(a),this.drawStats(a)},g.exports=a},function(b,c){var a=function(a){this.spriteMap=a,this.radius=20,this.color="red",this.pos=[250,250],this.state="OK",this.vel=0,this.isCaught=!1};a.prototype.getCaught=function(){this.isCaught=!0},a.prototype.colide=function(){this.state="COLIDE"},a.prototype.ok=function(){this.state="OK"},a.prototype.isColide=function(){return"COLIDE"===this.state},a.prototype.isOk=function(){return"OK"===this.state},a.prototype.pushLeft=function(){this.vel<0?this.vel+=1.5:this.vel+=.5},a.prototype.pushRight=function(){this.vel>0?this.vel-=1.5:this.vel-=.5},a.prototype.move=function(a){a[0]>=this.pos[0]+10?this.pushLeft():a[0]<=this.pos[0]-10&&this.pushRight(),this.pos[0]+this.vel>=490||this.pos[0]+this.vel<=0||(this.pos[0]+=this.vel)},a.prototype.draw=function(a){if(!this.isCaught)switch(this.state){case"OK":this.vel>2.5?a.drawImage(this.spriteMap,49,0,17,34,this.pos[0],this.pos[1],17,34):this.vel<-2.5?a.drawImage(this.spriteMap,49,37,17,34,this.pos[0],this.pos[1],17,34):a.drawImage(this.spriteMap,65,0,17,34,this.pos[0],this.pos[1],17,34);break;case"COLIDE":a.drawImage(this.spriteMap,240,0,31,31,this.pos[0],this.pos[1],31,31)}},b.exports=a},function(b,d,c){var a=(c(1),function(a,b){this.spriteMap=b,this.type=Math.floor(4*Math.random()),this.pos=a,this.vel=[0,-10],this.radius=40,this.color="green",this.colided=!1});a.prototype.draw=function(a){switch(this.type){case 0:a.drawImage(this.spriteMap,0,28,30,34,this.pos[0],this.pos[1],30,34);break;case 1:a.drawImage(this.spriteMap,95,66,32,64,this.pos[0],this.pos[1],32,64);break;case 2:a.drawImage(this.spriteMap,30,52,23,11,this.pos[0],this.pos[1],23,11);break;case 3:a.drawImage(this.spriteMap,85,138,15,32,this.pos[0],this.pos[1],15,32)}},a.prototype.move=function(){this.pos[0]+=this.vel[0],this.pos[1]+=this.vel[1]},b.exports=a},function(b,c){var a=function(a){this.spriteMap=a,this.pos=[250,-100],this.frame=0,this.frameTimer=0,this.vel=.05,this.isCaughtSkier=!1};a.prototype.pushLeft=function(){this.vel+=.05},a.prototype.pushRight=function(){this.vel-=.05},a.prototype.move=function(a){a[0]>this.pos[0]?this.pushLeft():a[0]<this.pos[0]&&this.pushRight(),this.pos[0]+=this.vel},a.prototype.catchUp=function(){this.isCaughtSkier!==!0&&(this.pos[0]+=this.vel,this.pos[1]<250&&(this.pos[1]+=1.5))},a.prototype.catchSkier=function(){this.isCaughtSkier=!0},a.prototype.incrementTimer=function(a){if(this.frameTimer>6){if(this.frameTimer=0,a)return void a();this.switchFrame()}else this.frameTimer+=1},a.prototype.switchFrame=function(){0===this.frame?this.frame=1:1===this.frame?this.frame=0:this.frame>1&&(this.frame=0)},a.prototype.draw=function(a){if(this.isCaughtSkier)return void this.eatSkier(a);if(this.incrementTimer(),this.vel>0)switch(this.frame){case 0:a.drawImage(this.spriteMap,91,112,31,40,this.pos[0],this.pos[1],31,40);break;case 1:a.drawImage(this.spriteMap,62,112,29,40,this.pos[0],this.pos[1],29,40)}else if(this.vel<0)switch(this.frame){case 0:a.drawImage(this.spriteMap,91,158,31,40,this.pos[0],this.pos[1],31,40);break;case 1:a.drawImage(this.spriteMap,62,158,29,40,this.pos[0],this.pos[1],29,40)}},a.prototype.eatSkier=function(a){switch(this.incrementTimer(function(){this.frame>6?7===this.frame?this.frame=8:8===this.frame&&(this.frame=7):this.frame+=1}.bind(this)),this.frame){case 0:a.drawImage(this.spriteMap,35,112,25,43,this.pos[0],this.pos[1],25,43);break;case 1:a.drawImage(this.spriteMap,0,112,32,43,this.pos[0],this.pos[1],32,43);break;case 2:a.drawImage(this.spriteMap,122,112,34,43,this.pos[0],this.pos[1],34,43);break;case 3:a.drawImage(this.spriteMap,156,112,31,43,this.pos[0],this.pos[1],31,43);break;case 4:a.drawImage(this.spriteMap,187,112,31,43,this.pos[0],this.pos[1],31,43);break;case 5:a.drawImage(this.spriteMap,219,112,25,43,this.pos[0],this.pos[1],25,43);break;case 6:a.drawImage(this.spriteMap,243,112,26,43,this.pos[0],this.pos[1],26,43);break;case 7:a.drawImage(this.spriteMap,35,112,25,43,this.pos[0],this.pos[1],25,43);break;case 8:a.drawImage(this.spriteMap,0,112,32,43,this.pos[0],this.pos[1],32,43)}},b.exports=a},function(b,c){var a=function(a,b){this.game=a,this.ctx=b,this.isStarted=!1};a.prototype.start=function(){if(this.isStarted){if(!this.game.isSkierCaught)return;this.game.reset()}else this.isStarted=!0,tick=setInterval(function(){this.game.draw(this.ctx),this.game.step()}.bind(this),30)},b.exports=a}])