var sessionstart = false;
var validBitArray = new Array();
var validTagArray = new Array();
var validDataArray = new Array();
var drawingSpaceHeight = 0;
var cache = 0;
var memory = 0;
var offset = 0;
var offsetrange=0;
var tag = 0;
var block = 0;
var step = 0;
var arrowcache,v2;
var hit=0;
var listOfInstructions = new Array();
var listOfInstructionsTF = new Array();
var indexforcache=0;
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;
var LRU = new Array();
var LRUIndex=0;
var cacheReplacementPolicy ="FIFO";

function loadConfiguration()
{
	offsetBit = parseInt(document.getElementById('offsetsize').value);
    offset = Math.pow(2,offsetBit);    
	cache = parseInt(document.getElementById('cachesize').value)/ offset;
		memory = parseInt(document.getElementById('memorysize').value);

	if ((checkPowerOfTwo(cache) && checkPowerOfTwo(memory)) == false) { alert ("Cache, Memory and Offset must be in power of two");}
	else
	{
		cacheBit = logtwo(cache);
		memoryBit = logtwo(memory);
		if ((cacheBit>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit)))
		{
			validBitArray = initialiseZeroArray(cache);
			validTagArray = initialiseHypenArray(cache);
			validDataArray = initialiseZeroArray(cache);
			LRU = initialiseNumberedArray(cache);
			LRUController();
			offsetrange = offset - 1;
			drawingSpaceHeight = cache*25 +400;
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setmemorytable();
			setfirsttable();
			document.getElementById('submitConfig').disabled = true;
            document.getElementById("information_text").innerHTML=" Offset = " + offsetBit+ " bits"+
                "<br> Instruction Length = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Block = "+memoryBit +" bits - " +offsetBit+" bits = "+ (memoryBit-offsetBit)+ " bits"+
                "<br><br> Please submit Instruction.";
		}
		else
		{
			alert("Configuration is not valid. Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size");
		}
	}
	
}
function setfirsttable(){
	sessionstart=true;
	document.getElementById("tableSpace").innerHTML = loadTable();
	tagBit = memoryBit - offsetBit;
	document.getElementById("tagbit").innerHTML= tagBit + " bit";
	document.getElementById("offsetbit").innerHTML= offsetBit + " bit";		
	document.getElementById('cachesize').disabled = true;
	document.getElementById('memorysize').disabled = true;
	document.getElementById('offsetsize').disabled = true;
	resetColouring();

}


function loadInstruction()
{
	if (sessionstart)
	{
		var hex = document.getElementById('instruction_data').value;
        if (hex=="")
            {
                pushNoToLoad();
                hex = document.getElementById('instruction_data').value;
            }
		var binary = parseInt(hex,16).toString(2);
		var instructionInt = parseInt(hex,16).toString(10);

		
		if (instructionInt<0 || instructionInt>(memory-1) ||isNaN(instructionInt))
		{
			document.getElementById('instruction_data').value = 0;
			alert("Instruction is not valid. Please try again");
		}
		else{

			while (binary.length < memoryBit)
			{
				binary = "0"+ binary;
			}
			var afterindex = parseInt(tagBit);
			if (binary.substr(0,tagBit)>0){
			document.getElementById("tag").value = binary.substr(0,tagBit);
			}
				else
			{
				document.getElementById("tag").value =0;
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
function loadInformation()
{	
	var indexOfTag = validTagArray.indexOf((document.getElementById("tag").value));

	if (document.getElementById("instruction_data").disabled==false)
	{
		alert("Please submit the Load Instruction");
		document.getElementById('instruction_data').focus();	
	}
	else{
	if (step==0){
		
		document.getElementById("information_text").innerHTML ="The instruction has been converted from hex to binary and allocated to tag, index, and offset respectively";
		document.getElementById("information_text").style.backgroundColor="#F0CCCC";
		document.getElementById("tag").style.backgroundColor="#F0CCCC";
		document.getElementById("offset").style.backgroundColor="#F0CCCC";
		document.getElementById("next").disabled=false;
		document.getElementById("fastforward").disabled=false;
	}
	else if (step==1){	
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="Index requested will be searched in whole cache";
		document.getElementById("tag").style.backgroundColor ="yellow";
		document.getElementById("offset").style.backgroundColor="";
		document.getElementById("information_text").style.backgroundColor="Yellow";
		var indexXY = document.getElementById("tag").getBoundingClientRect();
		var boxXY = document.getElementById("drawingSpace").getBoundingClientRect();
		var topBoundAddressEvaluated = document.getElementById("addressevaluated").getBoundingClientRect().top;
		var topBoundCacheTable = document.getElementById("container").getBoundingClientRect().top-boxXY.top;
		var indexMid = (indexXY.right + indexXY.left)/2 - boxXY.left;
		arrowcache = "<svg width = 100% height=100%>";
		
		for (x = 1; x <= cache; x++) { 
		    var targettedTR = document.getElementById(("tr"+(x-1))).getBoundingClientRect();
			var path = "M "+indexMid+","+topBoundAddressEvaluated +"V "+topBoundCacheTable+" H 10 V "+ (targettedTR.top-50-5) + " H "+(targettedTR.left - boxXY.left);
			arrowcache += "<path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";		
		}
		document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
	}
		
	else if (step==2){

		if (indexOfTag== -1)
		{
	
			document.getElementById("information_text").innerHTML ="No cache contains "+document.getElementById("tag").value+" as value, therefore cache MISS is obtained.";
			document.getElementById("information_text").style.backgroundColor="#F09999";
			
			if (cacheReplacementPolicy!="Random")
			{
				LRUIndex = LRU.shift();
				LRU.push(LRUIndex);
			}
            listOfInstructionsTF.push(0);
			
		}
		else
		{
			document.getElementById("information_text").innerHTML ="Valid tag is found in the cache.";		
			document.getElementById(("tr"+indexOfTag)).style.backgroundColor ="green";	
			document.getElementById("information_text").style.backgroundColor="green";
			
			if (cacheReplacementPolicy =="LRU")
			{
				var index = LRU.indexOf(indexOfTag);
				LRUIndex = indexOfTag;

				if (index>-1)
				{
					LRU.splice(index, 1);
				}
				LRU.push(indexOfTag);
			}

			
			hit++;
            listOfInstructionsTF.push(1);
		}	
		if (cacheReplacementPolicy == "Random")
		{
			LRUIndex = LRU[Math.floor(Math.random() * LRU.length)];
		}


	}	
	else if (step==3){
		if (indexOfTag== -1)
		{
			document.getElementById("information_text").innerHTML ="The new cache data is imported to cache.";
			document.getElementById("information_text").style.backgroundColor="#FFcc55";			
			validBitArray[LRUIndex]=1;
			validTagArray[LRUIndex]=document.getElementById("tag").value ;
			var stringDataArray = "Block "+block+" Word 0 - "+ offsetrange ;
			validDataArray[LRUIndex]= stringDataArray.toUpperCase();

			document.getElementById("tableSpace").innerHTML = loadTable();

			resetColouring();
			document.getElementById(("tr"+LRUIndex)).style.backgroundColor ="blue";
			
		}
		else{
			document.getElementById("information_text").innerHTML ="Data is loaded from cache with index "+ indexOfTag;
			document.getElementById("information_text").style.backgroundColor="#55F055";
		}
		document.getElementById("drawingSpace").innerHTML = "";
		document.getElementById("tag").style.backgroundColor ="blue";
		var blockDec = parseInt(block,16);
		document.getElementById(("memoryRow"+blockDec)).style.backgroundColor="blue";
		document.getElementById(("memoryRow"+blockDec)).scrollIntoView(true);
		
	
	}
	else{
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="The cycle has been completed.<br> Please submit another instructions";
		document.getElementById("information_text").style.backgroundColor="";
		document.getElementById("tag").style.backgroundColor ="";
		var blockDec = parseInt(block,16);
		document.getElementById(("memoryRow"+blockDec)).style.backgroundColor="";
		var findtherow = "tr"+LRUIndex;
		document.getElementById(findtherow).style.backgroundColor ="";	
		document.getElementById('instruction_data').disabled = false;
		document.getElementById('submit').disabled = false;	
		var listofPrevIns="<ul>";
		for (p=0;p<listOfInstructions.length;p++)
		{
            var cacheResult;
            if (listOfInstructionsTF[p]==0)
                {
                    cacheResult="Miss";
                }
            else{
                cacheResult="Hit";
            }
			listofPrevIns +="<li> "+listOfInstructions[p].toUpperCase()+" ["+cacheResult+"] </li>"; 
		
		}
		listofPrevIns +="</ul>";
		document.getElementById('listOfInstructionsLabel').innerHTML = listofPrevIns;
		var hitRate = hit / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" ;

		step=-1;
		LRUController();
		document.getElementById('hitmiss').style.backgroundColor="yellow";
		document.getElementById('genRandom').style.backgroundColor="blue";	
		document.getElementById('instruction_data').focus();	
        pushNoToLoad();
	}

	step++;

	}
}
function LRUController(){
		if (cacheReplacementPolicy !="Random")
		{
			document.getElementById('nextReplace').innerHTML=  LRU[0];
			document.getElementById('lastReplace').innerHTML=  LRU[(LRU.length-1)];
		}
		else
		{
			document.getElementById('nextReplace').innerHTML=  " - ";
			document.getElementById('lastReplace').innerHTML=  " - ";			
		}

}