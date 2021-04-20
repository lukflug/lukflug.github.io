
function makeJavadocTable (dirname,software) {
  var request=new XMLHttpRequest();
	request.open("get","/index.txt");
	request.responseType="text";
	request.onload=function() {
		var table="<tr><th>Version</th></tr>";
		var path="javadoc/"+dirname;
		var list=request.responseText.split("\n");
		var files=[]
		for (var i=0;i<list.length;i++) {
			if (list[i]=="") continue;
			var filePath=list[i].substring(list[i].indexOf("\t")+1);
			if (filePath.substring(0,path.length+1)==path+"/") {
				var relPath=filePath.substring(path.length+1);
				if (relPath.indexOf("/")>=0) {
					var name=relPath.substring(0,relPath.indexOf("/"));
					if (name!=files[files.length-1]) files.push(name);
				}
			}
		}
		files.sort((a,b)=>-a.localeCompare(b,"en",{numeric:true}));
		for (var i=0;i<files.length;i++) {
			table+="<tr><td><a href=\"/"+path+"/"+files[i]+"/overview-summary.html\">"+software+" Version "+files[i]+" JavaDoc</a></td></tr>";
		}
		document.getElementById("javadoctable").innerHTML=table;
	}
	request.send();
}
