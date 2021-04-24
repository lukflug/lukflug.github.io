var content=[[1,0,0,0,1,1,1,1],[1,0,0,0,1,0,0,0],[1,0,0,0,1,0,0,0],[1,0,0,0,1,1,1,1],[1,0,0,0,1,0,0,0],[1,0,0,0,1,0,0,0],[1,0,0,0,1,0,0,0],[1,1,1,1,1,0,0,0]]
var canvas=document.getElementById("logo");
var context=canvas.getContext("2d");
var img=new Image;
img.onload=redraw;
img.src="logo_base.png";

var shape=getQueryValue("shape");
if (shape!=null&&shape.length==16) {
	for (var i=0;i<8;i++) {
		var test=parseInt(shape.substr(i*2,2),16);
		for (var j=0;j<8;j++) content[i][j]=(test>>j)&1;
	}
}
if (getQueryValue("base")!=null) document.forms["Logo Generator"]["base"].value="#"+getQueryValue("base");
if (getQueryValue("left")!=null) document.forms["Logo Generator"]["left"].value="#"+getQueryValue("left");
if (getQueryValue("right")!=null) document.forms["Logo Generator"]["right"].value="#"+getQueryValue("right");

function redraw() {
	context.fillStyle=document.forms["Logo Generator"]["base"].value;
	context.fillRect(0,0,canvas.width,canvas.height);
	context.globalCompositeOperation="destination-in";
	context.drawImage(img,0,0);
	context.globalCompositeOperation="source-over";
	context.fillStyle=document.forms["Logo Generator"]["left"].value;
	for (var i=0;i<8;i++) {
		for (var j=0;j<4;j++) {
			if (content[i][j]!=0) context.fillRect(132+32*j,102+32*i,32,32);
		}
	}
	context.fillStyle=document.forms["Logo Generator"]["right"].value;
	for (var i=0;i<8;i++) {
		for (var j=4;j<8;j++) {
			if (content[i][j]!=0) context.fillRect(132+32*j,102+32*i,32,32);
		}
	}
	document.getElementById("meta-image").content = canvas.toDataURL();
	document.getElementById("icon-image").href = canvas.toDataURL();
}

canvas.addEventListener("mousedown",function(event) {
	var x=event.clientX-canvas.getBoundingClientRect().left;
	var y=event.clientY-canvas.getBoundingClientRect().top;
	if (x>=132&&y>=102&&x<132+256&&y<102+256) {
		var i=Math.floor((x-132)/32),j=Math.floor((y-102)/32);
		content[j][i]=1-content[j][i];
		redraw();
	}
});

document.getElementById("form").addEventListener("change",function() {
	redraw();
});

async function generateLink() {
	var shape="";
	for (var i=0;i<8;i++) {
		var test=0;
		for (var j=7;j>=0;j--) test=(test<<1)+content[i][j];
		var temp=test.toString(16);
		if (temp.length==1) shape+="0"+temp;
		else shape+=temp;
	}
	var base=document.forms["Logo Generator"]["base"].value.substring(1);
	var left=document.forms["Logo Generator"]["left"].value.substring(1);
	var right=document.forms["Logo Generator"]["right"].value.substring(1);
	await navigator.clipboard.writeText("https://lukflug.github.io/logo-generator.html?shape="+shape+"&base="+base+"&left="+left+"&right="+right);
}
