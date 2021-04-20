
var table="<tr><th>Group ID</th><th>Artifact ID</th><th>Version</th><th>Downloads</th></tr>";

function addTableEntry(group,artifact,version,downloads) {
	table+="<tr><td>"+group+"</td><td>"+artifact+"</td><td>"+version+"</td><td>"+downloads+"</td></tr>";
}

function createLink(name,href) {
	return "<a href=\"?path=/"+href+"\">"+name+"</a>";
}

async function addVersion(groupId,artifactId,version) {
	var downloads="";
	if (!version.endsWith("-SNAPSHOT")) {
		var dirResponse=await fetch("https://api.github.com/repos/lukflug/lukflug.github.io/contents/maven/"+groupId.replaceAll(".","/")+"/"+artifactId+"/"+version);
		var directory=await dirResponse.json();
		var downloads="";
		for (var i=directory.length-1;i>=0;i--) {
		if (directory[i].type=="file"&&directory[i].name.endsWith(".jar")) {
			var displayName=directory[i].name.substring(0,directory[i].name.length-4).split("-");
			if (displayName[displayName.length-1]==version) displayName[displayName.length-1]="binary";
				downloads+="<a href=\""+directory[i].path.substring(6)+"\">"+displayName[displayName.length-1]+"</a> ";
			}
		}
	} else {
		var metaResponse=await fetch(groupId.replaceAll(".","/")+"/"+artifactId+"/"+version+"/maven-metadata.xml");
		var metadataText=await metaResponse.text();
		var metadata=new DOMParser().parseFromString(metadataText,"text/xml");
		var files=metadata.getElementsByTagName("snapshotVersion");
		for (var i=0;i<files.length;i++) {
			var classifier="binary";
			var extension;
			var value;
			var nodes=files[i].childNodes;
			for (var j=0;j<nodes.length;j++) {
				if (nodes[j].nodeType==Node.ELEMENT_NODE) {
					if (nodes[j].nodeName=="extension") extension=nodes[j].textContent;
					else if (nodes[j].nodeName=="classifier") classifier=nodes[j].textContent;
					else if (nodes[j].nodeName=="value") value=nodes[j].textContent;
				}
			}
			if (extension=="jar") {
				downloads+="<a href=\""+groupId.replaceAll(".","/")+"/"+artifactId+"/"+version+"/"+artifactId+"-"+value+(classifier=="binary"?"":"-"+classifier)+"."+extension+"\">"+classifier+"</a> ";
			}
		}
	}
	addTableEntry(createLink(groupId,groupId.replaceAll(".","/")),createLink(artifactId,groupId.replaceAll(".","/")+"/"+artifactId),version,downloads);
}

var path=getQueryValue("path");
if (path==null||path=="") path="/";
if (path.length>1&&path.endsWith("/")) path=path.substring(0,path.length-1);

(async()=>{
	var metaResponse=await fetch(path.substring(1)+"/maven-metadata.xml");
	if (metaResponse.ok) {
		// Either artifact
		var metadataText=await metaResponse.text();
		var metadata=new DOMParser().parseFromString(metadataText,"text/xml");
		var groupId=metadata.getElementsByTagName("groupId")[0].innerHTML;
		var artifactId=metadata.getElementsByTagName("artifactId")[0].innerHTML;
		var versionList=metadata.getElementsByTagName("versions")[0].childNodes;
		document.getElementById("location").innerHTML=groupId+":"+artifactId;
		for (var i=versionList.length-1;i>=0;i--) {
			if (versionList[i].nodeType==Node.ELEMENT_NODE) {
				await addVersion(groupId,artifactId,versionList[i].innerHTML);
			}
		}
	} else {
		// Either group
		document.getElementById("location").innerHTML=(path=="/"?"root":path.substring(1).replaceAll("/","."));
		var dirResponse=await fetch("https://api.github.com/repos/lukflug/lukflug.github.io/contents/maven"+path);
		var directory=await dirResponse.json();
		for (var i=0;i<directory.length;i++) {
			var groupName=directory[i].path.substring(6)
			if (directory[i].type=="dir") {
				var mavenResponse=await fetch(groupName+"/maven-metadata.xml");
				if (mavenResponse.ok) {
					var mavendataText=await mavenResponse.text();
					var mavendata=new DOMParser().parseFromString(mavendataText,"text/xml");
					var groupId=mavendata.getElementsByTagName("groupId")[0].innerHTML;
					var artifactId=mavendata.getElementsByTagName("artifactId")[0].innerHTML;
					var version="";
					if (mavendata.getElementsByTagName("release").length!=0) version=mavendata.getElementsByTagName("release")[0].innerHTML;
					await addVersion(groupId,artifactId,version);
				} else addTableEntry(createLink(groupName.replaceAll("/","."),groupName),"","","");
			}
		}
	}
	document.getElementById("loading").innerHTML="";
	document.getElementById("maventable").innerHTML=table;
})();
