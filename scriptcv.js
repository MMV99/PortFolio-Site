var q=document.getElementById('matrix'),
    s=window.screen,
    w, h;
        p=Array(256).join(1).split(''); // Initialize based on initial screen size
        c=q.getContext('2d'),
        m=Math;

function resizeCanvas() {
    w = q.width = window.innerWidth;
    h = q.height = window.innerHeight;

    // Adjust length of 'p' array based on screen width
    p = Array(Math.ceil(w / 10)).join(1).split(''); 

    // Optional: Adjust font size
    c.font = '12px monospace'; 
}

setInterval(function(){

  // adjust background color
  c.fillStyle='rgba(0,0,0,0.02)';
  c.fillRect(0,0,w,h);

  //adjust ripple color
  c.fillStyle='rgba(0,255,0,1)';

  p=p.map(function(v,i){
     r=m.random();
    var str = String.fromCharCode(m.floor(2720+r*33));
    c.fillText(str,i*10,v);
    v+=10;
    var ret = v>768+r*1e4?0:v
    return ret;
  });
},33);

// adjust matrix to fit the screen
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 
