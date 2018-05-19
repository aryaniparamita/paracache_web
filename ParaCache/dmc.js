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
var arrowcache,v2;
var hit=0;
var step=0;
var listOfInstructions = new Array();
var listOfInstructionsTF = new Array();
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;
var instructionType = 0;

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
            tagBit = memoryBit - cacheBit - offsetBit;
			validBitArray = initialiseZeroArray(cache);
			validTagArray = initialiseHypenArray(cache);
			validDataArray = initialiseZeroArray(cache);
			offsetrange = offset - 1;
			drawingSpaceHeight = cache*25 +400;
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setmemorytable();
			setfirsttable();
			document.getElementById('submitConfig').disabled = true;
            document.getElementById("information_text").innerHTML=printConfiguration();
		}
		else{
			alert("Configuration is not valid. Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size")
		}
	}
}


function setfirsttable(){
	sessionstart=true;
	document.getElementById("tableSpace").innerHTML = loadTable();
	document.getElementById("tagbit").innerHTML= tagBit + " bit";
	document.getElementById("indexbit").innerHTML= cacheBit + " bit";
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

	var validIndex =  parseInt(document.getElementById("index").value,2) ;
	var boxXY = document.getElementById("sidebar").getBoundingClientRect();
	var validXY = document.getElementById(("valid"+validIndex)).getBoundingClientRect().right - boxXY.right - 30;	
	
	
	if (document.getElementById("instruction_data").disabled==false)
	{
		document.getElementById('instruction_data').focus();	
		alert("Please submit the Load Instruction");
	}
	else{
	if (step==0){
		document.getElementById("information_text").innerHTML ="The instruction has been converted from hex to binary and allocated to tag, index, and offset respectively";
		document.getElementById("information_text").style.backgroundColor="#F0CCCC";
		document.getElementById("tag").style.backgroundColor="#F0CCCC";
		document.getElementById("index").style.backgroundColor="#F0CCCC";
		document.getElementById("offset").style.backgroundColor="#F0CCCC";
		document.getElementById("next").disabled=false;
		document.getElementById("fastforward").disabled=false;
		
	}
	else if (step==1){	
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="Index requested will be searched in cache as highlighted in yellow";
		document.getElementById("tag").style.backgroundColor ="";
		document.getElementById("index").style.backgroundColor="Yellow";
		document.getElementById("offset").style.backgroundColor="";
		document.getElementById("information_text").style.backgroundColor="Yellow";
		var findtherow = "tr"+validIndex ;
		v2 = document.getElementById(findtherow).getBoundingClientRect().top-210;
		window.scroll(0,v2);	
		var indexXY = document.getElementById("index").getBoundingClientRect();
        console.log(indexXY.right);
        console.log(indexXY.left);
        console.log(boxXY.right);
		var indexMid = (indexXY.right + indexXY.left)/2 - boxXY.right;
		var path = "M "+indexMid+",0 V 110 H 10 V "+ v2 + "H 40";
		arrowcache = "<svg width = 100% height=100%><path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";
		document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";

		document.getElementById(findtherow).style.backgroundColor ="yellow";	
	

	}
		
	else if (step==2){
		document.getElementById("information_text").innerHTML ="Valid bit will be obtained and analysed.";
		document.getElementById("information_text").style.backgroundColor="green";
		document.getElementById(("valid"+validIndex)).style.backgroundColor ="green";

	}	
	else if (step==3){
		document.getElementById("information_text").innerHTML ="Following is the analysis diagram.";
		document.getElementById("information_text").style.backgroundColor="";
		document.getElementById(("tag"+validIndex)).style.backgroundColor ="blue";	
		window.scroll(0,(drawingSpaceHeight-200));
		var tagpathheight = drawingSpaceHeight - 150;
		var validtagV = drawingSpaceHeight - 100;
		var andWidth = 70;
			//TAG VERTICAL LINE

			var path2 = "M "+validXY+","+v2+" V "+(drawingSpaceHeight-100);
			arrowcache += "<path d='"+path2+"' stroke='green' stroke-width='1.25' fill='none'/>";

			
			//DATA VERTICAL LINE
			var path3 = "M "+(validXY+50)+","+v2+" V "+(drawingSpaceHeight-100);
			arrowcache += "<path d='"+path3+"' stroke='blue' stroke-width='1.25' fill='none'/>";
			
			//INSTRUCTION BREAKDOWN TAG
			var tagpath = "M 20,0 V 90 "+ v2 + "V "+tagpathheight+" H "+(validXY+50);
			arrowcache += "<path d='"+tagpath+"' stroke='black' stroke-width='1.25' fill='none'/>";
			
			//AND IMAGE
			arrowcache += "<image xlink:href='img/and.png'  x="+(validXY-10)+" y="+(validtagV-20)+" height="+andWidth+" width="+andWidth+" ></image>";	
					
			
			
			document.getElementById("drawingSpace").innerHTML = arrowcache;
	}
	else if (step==4)
	{	

		if (validBitArray[validIndex]==0)
		{
			document.getElementById("information_text").innerHTML ="Valid bit is 0, therefore CACHE MISS is obtained. Cache is updated with the new dataset";
            listOfInstructionsTF.push(0); document.getElementById("information_text").style.backgroundColor="#F09999";
			var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
			document.getElementById("drawingSpace").innerHTML = newarrowcache;
			
		
		}
		else{
			document.getElementById("information_text").innerHTML="Valid bit is 1, therefore we should look into the tag. ";

			//COMPARE IMAGE
			var compareY = drawingSpaceHeight - 175;
			arrowcache += "<image xlink:href='img/compare.png'  x="+(validXY+25)+" y="+compareY+
							" height=50 width=50 ></image>";
			document.getElementById("drawingSpace").innerHTML = arrowcache;
			if (validTagArray[validIndex]==document.getElementById("tag").value)
			{
				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag is the same. Therefore, CACHE HIT";
				document.getElementById("information_text").style.backgroundColor="#55F055";				

				var newarrowcache = arrowcache.replace ("img/and.png","img/and_hit.png");
				document.getElementById("drawingSpace").innerHTML = newarrowcache;
				hit++;
                listOfInstructionsTF.push(1);
			}
			else{
				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag is NOT the same. Therefore, CACHE MISS";	                listOfInstructionsTF.push(0);                document.getElementById("information_text").style.backgroundColor="#FFcc55";				
				var newarrowcache = arrowcache.replace ("img/and.png","img/and_miss.png");
				document.getElementById("drawingSpace").innerHTML = newarrowcache;			}
		}
		
		
	}	
	else if (step==5){
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML = "Cache table is updated accordingly. <br>"+ 
																"Block "+ block.toUpperCase() +" with offset "+
																"0 to " + offsetrange + " is transferred to cache";
		document.getElementById("information_text").style.backgroundColor="#2222FF";
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="#2222FF";
		document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true);
		validBitArray[validIndex]=1;
		validTagArray[validIndex]=document.getElementById("tag").value ;
		validDataArray[validIndex]= ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();
		document.getElementById("drawingSpace").innerHTML = "";
		document.getElementById("tableSpace").innerHTML = loadTable();
		resetColouring();
		document.getElementById("index").style.backgroundColor ="";
		document.getElementById("tag").style.backgroundColor ="blue";
		document.getElementById(("tr"+validIndex)).style.backgroundColor ="blue";	


	}
	
	else{
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="The cycle has been completed.<br> Please submit another instructions";
		document.getElementById("information_text").style.backgroundColor="";
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="";


		document.getElementById("tag").style.backgroundColor ="";
		var findtherow = "tr"+validIndex ;
		document.getElementById(findtherow).style.backgroundColor ="";	
		document.getElementById('instruction_data').disabled = false;
		document.getElementById('submit').disabled = false;	
		var listofPrevIns="<ul>";
		for (p=0;p<listOfInstructions.length;p++)
		{
            if (listOfInstructionsTF[p]==0)
                {
                    var cacheResult = "Miss";
                }
            else {
                var cacheResult = "Hit";
            }
			listofPrevIns +="<li> "+listOfInstructions[p].toUpperCase()+" [" + cacheResult+"] </li>"; 
		}
		listofPrevIns +="</ul>";
		document.getElementById('listOfInstructionsLabel').innerHTML = listofPrevIns;
		var hitRate = hit / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" ;
		document.getElementById('hitmiss').style.backgroundColor="yellow";
		document.getElementById('genRandom').style.backgroundColor="blue";	
		document.getElementById('instruction_data').focus();		
		step=-1;
	}

	step++;

	}
}

