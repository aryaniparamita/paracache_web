var sessionstart = false;
var hitBoolean = false;

var validBitArray = new Array();
var validTagArray = new Array();
var validDataArray = new Array ();	


var drawingSpaceHeight = 0;
var cache = 0;
var memory = 0;
var offset = 0;
var offsetrange=0;
var tag = 0;
var block = 0;
var i = 0;
var arrowcache,v2;
var hit=0;
var listOfInstructions = new Array();
var listOfInstructionsTF = new Array();
var step=0;
var instructionType=0;   //SA2
var indexHighlight = 0;  //SA4

var LRU = new Array();
var LRUIndex=0;
var cacheReplacementPolicy ="FIFO";


//Drawing Properties
var topBoundAddressEvaluated, topBoundCacheTable, boxXY, indexXY, indexMid;

function loadCommonConfiguration()
{
	offsetBit = parseInt(document.getElementById('offsetsize').value);
    offset = Math.pow(2,offsetBit);    
	cache = parseInt(document.getElementById('cachesize').value)/ offset/setAssociative;
	memory = parseInt(document.getElementById('memorysize').value);
}
function loadTableSetAssociative(){
	
	//RENDER BOTH TABLE
	for (table=0; table<setAssociative; table++)
	{
		rendertableText[table]="<table class=drawtable id=cachetable"+table+"><tr><td> Index </td> <td> Valid </td><td> Tag </td> <td> Data (Hex) </td></tr>";
		for (j=0; j<cache;j++)
		{
			rendertableText[table]+="<tr id=tr"+phpNaming[table]+j+"><td id=index"+phpNaming[table]+j+"> "+ j +
					" </td><td id=valid"+phpNaming[table]+j+"> "+validBitArray[j][table]+
					" </td><td id=tag"+phpNaming[table]+j+">"+ validTagArray[j][table] +
					"</td><td id=offset"+phpNaming[table]+j+">"+ validDataArray[j][table]+"</td></tr>";
		}
		rendertableText[table] +="</table>";
		var targettedTableFinalName = "draw" + phpNaming[table];
		document.getElementById(targettedTableFinalName).innerHTML = rendertableText[table];
	}
	resetColouring();
}


function setfirsttable(){
	sessionstart=true; 
	loadTableSetAssociative();
	
	//CONFIGURATION

	document.getElementById("tagbit").innerHTML= tagBit + " bit";
	document.getElementById("indexbit").innerHTML= cacheBit + " bit";
	document.getElementById("offsetbit").innerHTML= offsetBit + " bit";	
	document.getElementById('cachesize').disabled = true;
	document.getElementById('memorysize').disabled = true;
	document.getElementById('offsetsize').disabled = true;

}

function loadInstruction()
{
	if (sessionstart)
	{
		var hex = document.getElementById('instruction_data').value;
		var binary = parseInt(hex,16).toString(2);
		var instructionInt = parseInt(hex,16).toString(10);

		
		if (instructionInt<0 || instructionInt>memory ||isNaN(instructionInt))
		{
			document.getElementById('instruction_data').value = 0;
			alert("Instruction is not valid. Please try again");
		}
		else{

			while (binary.length < memoryBit)
			{
				binary = "0"+ binary;
			}
			var afterindex = parseInt(tagBit) + parseInt(cacheBit);
			if (binary.substr(0,tagBit)>0){
			document.getElementById("tag").value = binary.substr(0,tagBit);
			}
				else
			{
				document.getElementById("tag").value =0;
			}
			if (binary.substr(tagBit,cacheBit)>0){
			document.getElementById("index").value = binary.substr(tagBit,cacheBit);
			}
				else
			{
				document.getElementById("index").value =0;
			}
			if (binary.substr(afterindex)>0){
			document.getElementById("offset").value = binary.substr(afterindex);
			}
			else
			{
				document.getElementById("offset").value =0;
			}
			block = parseInt(binary.substr(0,afterindex),2).toString(16);
			step = 0;
			hitBoolean = false;

			document.getElementById('instruction_data').disabled = true;
			document.getElementById('submit').disabled = true;	
			listOfInstructions.push(hex);
			document.getElementById('hitmiss').style.backgroundColor="";
			document.getElementById('genRandom').style.backgroundColor="";	
			document.getElementById('instruction_data').focus();
            loadInformation();                

		}
	}
	else
	{
		alert ("Please Specify Cache Configuration First!");
	}
}


function highlight(attr,color){
	var validindex = parseInt(document.getElementById("index").value,2) ;
	for (table=0; table<setAssociative;table++)
	{
		var findthevalid = attr+phpNaming[table]+validindex;
		document.getElementById(findthevalid).style.backgroundColor =color;
	}
}
function getDrawingProperties(){
	boxXY = document.getElementById("drawingSpace").getBoundingClientRect();
	topBoundAddressEvaluated = document.getElementById("addressevaluated").getBoundingClientRect().top;
	topBoundCacheTable = document.getElementById("container").getBoundingClientRect().top - boxXY.top;
	indexXY = document.getElementById("index").getBoundingClientRect();
	indexMid = (indexXY.right + indexXY.left)/2 - boxXY.left;
}