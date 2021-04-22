
var repoIndex;
var table="<tr><th>Group ID</th><th>Artifact ID</th><th>Version</th><th>Downloads</th></tr>";

function addTableEntry(group,artifact,version,downloads) {
	table+="<tr><td>"+group+"</td><td>"+artifact+"</td><td>"+version+"</td><td>"+downloads+"</td></tr>";
}

function createLink(name,href) {
	return "<a href=\"?path=/"+href+"\">"+name+"</a>";
}

async function addVersion(groupId,artifactId,version) {
	var downloads="";
	var metaResponse=await fetch(groupId.replaceAll(".","/")+"/"+artifactId+"/"+version+"/maven-metadata.xml");
	if (!metaResponse.ok) {
		var downloads="";
		var versionDir="maven/"+groupId.replaceAll(".","/")+"/"+artifactId+"/"+version+"/";
		for (var i=repoIndex.length-1;i>=0;i--) {
			if (repoIndex[i]=="") continue;
			var filePath=repoIndex[i].substring(repoIndex[i].indexOf("\t")+1);
			if (filePath.substring(0,versionDir.length)==versionDir&&filePath.endsWith(".jar")) {
				var fileName=filePath.substring(filePath.lastIndexOf("/")+1);
				var displayName=fileName.substring(0,fileName.length-4).split("-");
				if (displayName[displayName.length-1]==version||displayName[displayName.length-1]=="SNAPSHOT") displayName[displayName.length-1]="binary";
				downloads+="<a href=\""+filePath.substring(6)+"\">"+displayName[displayName.length-1]+"</a> ";
			}
		}
		addTableEntry(createLink(groupId,groupId.replaceAll(".","/")),createLink(artifactId,groupId.replaceAll(".","/")+"/"+artifactId),version,downloads);
	} else {
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
		addTableEntry(createLink(groupId,groupId.replaceAll(".","/")),createLink(artifactId,groupId.replaceAll(".","/")+"/"+artifactId),createLink(version,groupId.replaceAll(".","/")+"/"+artifactId+"/"+version),downloads);
	}
}

var path=getQueryValue("path");
if (path==null||path=="/") path="";
if (path.length>1&&path.endsWith("/")) path=path.substring(0,path.length-1);

(async()=>{
	var dirResponse=await fetch("/index.txt");
	var dirText=await dirResponse.text()
	repoIndex=dirText.split("\n");
	var metaResponse=await fetch(path.substring(1)+"/maven-metadata.xml");
	if (metaResponse.ok) {
		// Either artifact or snapshot
		var metadataText=await metaResponse.text();
		var metadata=new DOMParser().parseFromString(metadataText,"text/xml");
		var groupId=metadata.getElementsByTagName("groupId")[0].innerHTML;
		var artifactId=metadata.getElementsByTagName("artifactId")[0].innerHTML;
		if (metadata.getElementsByTagName("versions")[0]!=null) {
			var versionList=metadata.getElementsByTagName("versions")[0].childNodes;
			document.getElementById("location").innerHTML=groupId+":"+artifactId;
			for (var i=versionList.length-1;i>=0;i--) {
				if (versionList[i].nodeType==Node.ELEMENT_NODE) {
					await addVersion(groupId,artifactId,versionList[i].innerHTML);
				}
			}
		} else {
			var version=metadata.getElementsByTagName("version")[0].innerHTML;
			document.getElementById("location").innerHTML=groupId+":"+artifactId+":"+version;
			var versionDir="maven/"+groupId.replaceAll(".","/")+"/"+artifactId+"/"+version+"/";
			var lastVersion=null;
			var downloads="";
			for (var i=repoIndex.length-1;i>=0;i--) {
				if (repoIndex[i]=="") continue;
				var filePath=repoIndex[i].substring(repoIndex[i].indexOf("\t")+1);
				if (filePath.substring(0,versionDir.length)==versionDir&&filePath.endsWith(".jar")) {
					var fileName=filePath.substring(filePath.lastIndexOf("/")+1)
					var snapshotVersion=fileName.substring(artifactId.length+1,fileName.length-4);
					var classifier="binary";
					var parts=snapshotVersion.split("-");
					if (parts.length>3) {
						snapshotVersion=parts[0]+"-"+parts[1]+"-"+parts[2]
						classifier=parts[3];
						for (var j=4;j<parts.length;j++) classifier+="-"+parts[j];
					}
					if (lastVersion!=snapshotVersion) {
						if (lastVersion!=null) {
							addTableEntry(createLink(groupId,groupId.replaceAll(".","/")),createLink(artifactId,groupId.replaceAll(".","/")+"/"+artifactId),lastVersion,downloads);
							downloads="";
						}
						lastVersion=snapshotVersion
					}
					downloads+="<a href=\""+filePath.substring(6)+"\">"+classifier+"</a> ";
				}
			}
			addTableEntry(createLink(groupId,groupId.replaceAll(".","/")),createLink(artifactId,groupId.replaceAll(".","/")+"/"+artifactId),snapshotVersion,downloads);
		}
	} else {
		// Group
		document.getElementById("location").innerHTML=(path==""?"root":path.substring(1).replaceAll("/","."));
		var lastDirectory=null
		for (var i=0;i<repoIndex.length;i++) {
			if (repoIndex[i]=="") continue;
			var filePath=repoIndex[i].substring(repoIndex[i].indexOf("\t")+1);
			if (filePath.substring(0,path.length+6)=="maven"+path+"/") {
				var relPath=filePath.substring(path.length+6);
				if (relPath.indexOf("/")>=0) {
					var dirName=relPath.substring(0,relPath.indexOf("/"));
					if (dirName!=lastDirectory) {
						var groupName=path.length==0?dirName:path.substring(1)+"/"+dirName;
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
						lastDirectory=dirName;
					}
				}
			}
		}
	}
	document.getElementById("loading").innerHTML="";
	document.getElementById("maventable").innerHTML=table;
})();
