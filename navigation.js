
var path=getQueryValue("path");
if (path==null) path="";
else if (path.endsWith("/")) path=path.substring(0,path.length-1);
document.getElementById("location").innerHTML="/"+path;
document.getElementsByTagName("title")[0].innerHTML="Index of /"+path+" - lukflug's website";

var request=new XMLHttpRequest();
request.open("get","/index.txt");
request.responseType="text";
request.onload=function() {
	var superDir="";
	if (path.lastIndexOf("/")>=0) superDir=path.substring(0,path.lastIndexOf("/"));
	var lastDirectory=null;
	var list=request.responseText.split("\n");
	var table="<tr><th>Filename</th><th>Size</th></tr>";
	if (path!="") table+="<tr><td><a href=\"?path="+superDir+"\">../</a></td><td>-</td></tr>";
	for (var i=0;i<list.length;i++) {
		if (list[i]=="") continue;
		var filePath=list[i].substring(list[i].indexOf("\t")+1);
		if (path==""||filePath.substring(0,path.length+1)==path+"/") {
			var relPath=filePath.substring(path.length+1);
			if (path=="") relPath=filePath;
			var name=relPath;
			if (relPath.indexOf("/")>=0) name=relPath.substring(0,relPath.indexOf("/"));
			var size=list[i].substring(list[i].lastIndexOf(" ")+1,list[i].indexOf("\t"));
			if (relPath.indexOf("/")<0) table+="<tr><td><a href=\""+filePath+"\">"+name+"</a></td><td>"+size+"</td></tr>";
			else if (lastDirectory!=name) {
				table+="<tr><td><a href=\"?path="+(path==""?"":path+"/")+name+"\">"+name+"/</a></td><td>-</td></tr>";
				lastDirectory=name;
			}
			//if (list[i].type=="dir") table+="<tr><td><a href=\"?path=/"+list[i].path+"\">"+list[i].name+"/</a></td><td>-</td></tr>";
			//else table+="<tr><td><a href=\""+list[i].path+"\">"+list[i].name+"</a></td><td>"+list[i].size+"</td></tr>";
		}
	}
	document.getElementById("directorytable").innerHTML=table;
};
request.send();
