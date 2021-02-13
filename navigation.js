
var path=getQueryValue("path");
if (path==null||path=="") path="/";
if (path.length>1&&path.endsWith("/")) path=path.substring(0,path.length-1);
document.getElementById("location").innerHTML=path;
document.getElementsByTagName("title")[0].innerHTML="Index of "+path+" - lukflug's website";

var superDirs=path.split("/");
var superDir="";
for (var i=0;i<superDirs.length-1;i++) {
  if (superDirs[i]!="") superDir+="/"+superDirs[i];
}

var request=new XMLHttpRequest();
request.open("get","https://api.github.com/repos/lukflug/lukflug.github.io/contents"+path);
request.responseType="text";
request.onload=function() {
  var list=JSON.parse(request.responseText);
  var table="<tr><th>Filename</th><th>Size</th></tr>";
  if (path!="/") table+="<tr><td><a href=\"?path="+superDir+"\">../</a></td><td>-</td></tr>";
  for (var i=0;i<list.length;i++) {
    if (list[i].type=="dir") table+="<tr><td><a href=\"?path=/"+list[i].path+"\">"+list[i].name+"/</a></td><td>-</td></tr>";
    else table+="<tr><td><a href=\""+list[i].path+"\">"+list[i].name+"</a></td><td>"+list[i].size+"</td></tr>";
  }
  document.getElementById("directorytable").innerHTML=table;
};
request.send();
