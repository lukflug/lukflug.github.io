
function makeJavadocTable (dirname,software) {
  var request=new XMLHttpRequest();
  request.open("get","https://api.github.com/repos/lukflug/lukflug.github.io/contents/javadoc/"+dirname);
  request.responseType="text";
  request.onload=function() {
    var table="<tr><th>Version</th></tr>";
    var list=JSON.parse(request.responseText);
    list.sort((a,b)=>-a.name.localeCompare(b.name,"en",{numeric:true}));
    for (var i=0;i<list.length;i++) {
      table+="<tr><td><a href=\""+list[i].path+"/overview-summary.html\">"+software+" Version "+list[i].name+" JavaDoc</a></td></tr>";
    }
    document.getElementById("javadoctable").innerHTML=table;
  }
  request.send();
}
