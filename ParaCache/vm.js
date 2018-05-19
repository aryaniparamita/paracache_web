	var sessionstart = false;
	var TLBPageArray = new Array();
	var TLBFrameArray = new Array();
	var PageTableFrameArray = new Array();
	var PageTableValidArray = new Array();
	var PhysicalMemoryContentArray = new Array();
	var TLB=0, physicalpage = 0;
	var physicalpageBit, memoryBit;
	var listOfInstructions = new Array();
	var counter = -1;
	var physicalMemoryCounter = 0;
	var memory =0, physicalMemoryRows = 0;
	var pagetableHit = 0; TLBHit=0 , TLBHitBoolean=false;


function loadConfiguration()
{

	sessionstart = true;
	physicalpage = parseInt(document.getElementById('physicalpagesize').value);
	offset = parseInt(document.getElementById('offsetsize').value);
	vmemory = parseInt(document.getElementById('memorysize').value);
	TLB = parseInt(document.getElementById('TLBsize').value);
	if ((checkPowerOfTwo(physicalpage) == false)) { alert ("Cache, Memory must be in power of two");}
	else
	{
		physicalpageBit = logtwo(physicalpage);
		memoryBit = logtwo(vmemory);
		offsetBit = logtwo (offset);

		if ((physicalpageBit>=0))
		{

			memory = vmemory/offset;
			physicalMemoryRows = physicalpage/offset;
			
			
			TLBFrameArray = initialiseHypenArray(TLB);
			TLBPageArray = initialiseHypenArray(TLB);

			PageTableValidArray = initialiseZeroArray(memory);
			PageTableFrameArray = initialiseHypenArray(memory);

			PhysicalMemoryContentArray = initialiseHypenArray(physicalMemoryRows);
			drawingSpaceHeight = memory*25 + TLB *25 + 300;
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setfirsttable();
			document.getElementById('submitConfig').disabled = true;	
		}
		else{
			alert("Configuration is not valid. Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size")
		}
	}
}

function loadInstruction(){
	if (sessionstart)
	{
		var hex = document.getElementById('instruction_data').value;
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
			var afterindex = memoryBit - offsetBit;
			if (binary.substr(0,afterindex)>=0){
			document.getElementById("page").value = binary.substr(0,afterindex);
			}
			else
			{
				document.getElementById("page").value =0;
			}
			
			if (binary.substr(afterindex)>=0){
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
			TLBHitBoolean = false;
			loadInformation();
		}
	}
	else
	{
		alert ("Please Specify Cache Configuration First!");
	}
}

function loadVMTLBTable(){
	var whattowrite="<table class=tlbtable id=tlbtable><tr><td></td><td> Virtual Page# </td><td> Physical Page# </td></tr>";
	for (z = 0; z< TLB; z++) { 
    whattowrite += "<tr id=trTLB"+z+"><td id=markerTLB"+z+">"+z+"</td><td id=tlbframe"+z+"> "+TLBPageArray[z]+
					" </td><td id=tlbpage"+z+">"+ TLBFrameArray[z] +
					"</td></tr>";
	}
	whattowrite +="</table>";
	return whattowrite;
}

function loadVMPageTable(){
	var whattowrite="<table class=pagetable id=pagetable><tr><td> Index </td><td> Valid </td><td> PhysicalPage#</td></tr>";
	for (z = 0; z< memory; z++) { 
    whattowrite += "<tr id=tr"+z+"><td id=marker"+z+">"+z.toString(16).toUpperCase()+"</td><td id=ptvalid"+z+"> "+PageTableValidArray[z]+
					" </td><td id=ptframe"+z+">"+ PageTableFrameArray[z] +
					"</td></tr>";
	}
	whattowrite +="</table>";
	return whattowrite;
}

function loadVMPhysicalMemoryTable(){
	var whattowrite="<table class=physicalmemory id=physicalmemory><tr><td> Physical Page# </td><td> Content </td></tr>";
	for (z = 0; z< physicalMemoryRows; z++) { 
    whattowrite += "<tr id=trpp"+z+"><td>"+z.toString(16).toUpperCase()+
					"</td> <td id=ppframe"+z+">"+ PhysicalMemoryContentArray[z] +
					"</td></tr>";
	}
	whattowrite +="</table>";
	return whattowrite;
}
function setfirsttable(){

	
	LoadTLBTable();
	
	//CONFIGURATION
	document.getElementById("pagebit").innerHTML= (memoryBit-offsetBit) + " bit";
	document.getElementById("offsetbit").innerHTML= offsetBit + " bit";	
	document.getElementById('physicalpagesize').disabled = true;
	document.getElementById('offsetsize').disabled = true;
	document.getElementById('memorysize').disabled = true;
	document.getElementById('TLBsize').disabled = true;

}
function LoadTLBTable()
{
	document.getElementById("TLBTable").innerHTML = loadVMTLBTable();
	document.getElementById("PageTable").innerHTML = loadVMPageTable();	
	document.getElementById("PhysicalMemory").innerHTML = loadVMPhysicalMemoryTable();		
}

function loadInformation()
{	

	var indexOfPageTLB = TLBPageArray.indexOf((document.getElementById("page").value));
	var pageTableIndex = parseInt(document.getElementById("page").value,2) ;
	var boxXY = document.getElementById("sidebar").getBoundingClientRect();
	var markerTLB = "markerTLB"+(counter+1)%TLB;

	if (document.getElementById("instruction_data").disabled==false)
	{
		alert("Please submit the Load Instruction");
	}
	else{
	if (step==0){
		
		document.getElementById("information_text").innerHTML ="The instruction has been converted from hex to binary and allocated to tag, index, and offset respectively";
		document.getElementById("information_text").style.backgroundColor="#BBBBFF";
		document.getElementById("next").disabled=false;
		document.getElementById("fastforward").disabled=false;
		document.getElementById(markerTLB).style.backgroundColor="blue";
	}
	else if (step==1){	
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="Index requested will be searched in whole TLB";
		document.getElementById("information_text").style.backgroundColor="Yellow";
		document.getElementById("page").style.backgroundColor ="yellow";
		var indexXY = document.getElementById("page").getBoundingClientRect();

		var indexMid = 0.5*((indexXY.right + indexXY.left)/2 - boxXY.right);
		var TLBXY = document.getElementById("tlbtable").getBoundingClientRect();
		arrowcache = "<svg width = 100% height=100%>";
		for (x = 1; x <= TLB; x++) { 
			var TLBrow = document.getElementById(("trTLB"+(x-1))).getBoundingClientRect();
			var path = "M "+indexMid+",0 V "+ (TLBrow.top - 240) + " H "+ (TLBXY.left - boxXY.right);
			arrowcache += "<path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";		
		}
		document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
	}
		
	else if (step==2){
		if (indexOfPageTLB== -1)
		{
			document.getElementById("information_text").innerHTML ="There is no valid page in TLB.";
			document.getElementById("information_text").style.backgroundColor="#F0CCCC";	
			if (counter < (TLB-1))
			{counter++;}
			else
			{counter=0;}
			
		}
		else
		{
			window.scroll(0,0);
			document.getElementById("information_text").innerHTML ="Valid page is found in the TLB. Frame and Offset is updated.";	
			document.getElementById("information_text").style.backgroundColor="#55F055";				
			document.getElementById(("trTLB"+indexOfPageTLB)).style.backgroundColor ="yellow";	
			document.getElementById("middlebox_frame").innerHTML = TLBFrameArray[indexOfPageTLB] ;			
			document.getElementById("middlebox_offset").innerHTML = document.getElementById("offset").value ;
			document.getElementById("middlebox_frame").style.backgroundColor = "yellow";			
			document.getElementById("middlebox_offset").style.backgroundColor = "green";		
			var TLBFrameArraySelectedXY = document.getElementById(("tlbpage"+indexOfPageTLB)).getBoundingClientRect();
			var OffsetRequestedXY = document.getElementById(("offset")).getBoundingClientRect();
			var MiddleBoxFrameXY = document.getElementById(("middlebox_frame")).getBoundingClientRect();
			var physicalMemoryXY = document.getElementById(("trpp"+TLBFrameArray[indexOfPageTLB])).getBoundingClientRect();
			var TLBTableXY = document.getElementById("TLBTable").getBoundingClientRect();
			//LINE FROM SELECTED TLB TO MIDDLEBOX_FRAME
			var path = "M "+(0.9*(0.5*(TLBFrameArraySelectedXY.left+TLBFrameArraySelectedXY.right)- boxXY.right))
							+","+(TLBFrameArraySelectedXY.bottom-250)+" V "+(TLBTableXY.bottom-220);
			arrowcache += "<path d='"+path+"' stroke='black' stroke-width='1.25' fill='none'/>";		
			
			//LINE FROM OFFSET TO MIDDLEBOX_OFFSET
			var path = "M "+(1.1*(0.5*(OffsetRequestedXY.left+OffsetRequestedXY.right)- boxXY.right))+","+0+" V "+(TLBTableXY.bottom-220);
			arrowcache += "<path d='"+path+"' stroke='black' stroke-width='1.25' fill='none'/>";				

			
			document.getElementById(("trpp"+TLBFrameArray[indexOfPageTLB])).style.backgroundColor = "yellow";
			document.getElementById("offset").style.backgroundColor="green";
			
			TLBHitBoolean = true;
			TLBHit++;
			document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";

		}	
		


	}	
	else if (step==3){
		if (!TLBHitBoolean){
			document.getElementById("information_text").innerHTML ="Page is continue to be searched in Page Table.";
			var indexXY = document.getElementById("page").getBoundingClientRect();
			var indexMid = 0.05*((indexXY.right + indexXY.left)/2 - boxXY.right);
			var pageTableXY = document.getElementById(("tr"+pageTableIndex)).getBoundingClientRect();
			window.scroll(0,(pageTableXY.top-180));
			var path = "M "+indexMid+",0 V "+ ((pageTableXY.top-230)) + " H "+ (pageTableXY.left-boxXY.right);
			arrowcache += "<path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";		
			document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
			document.getElementById(("tr"+pageTableIndex)).style.backgroundColor ="blue";	
		}
		else{
			document.getElementById("information_text").innerHTML ="Frame and Offset is obtained through physical memory.";
			document.getElementById("information_text").style.backgroundColor="#55F055";	
			//LINE FROM MIDDLEBOX_FRAME TO PHYSICAL MEMORY
			


			var MiddleBoxFrameXY = document.getElementById(("middlebox_frame")).getBoundingClientRect();
			var physicalMemoryXY = document.getElementById(("trpp"+TLBFrameArray[indexOfPageTLB])).getBoundingClientRect();
			var TLBTableXY = document.getElementById("TLBTable").getBoundingClientRect();			
			
			
			
			
			
			
			var path = "M "+(0.97*(0.5*(MiddleBoxFrameXY.left+MiddleBoxFrameXY.right)- boxXY.right))+","+
						(TLBTableXY.bottom-170) +" V "+(physicalMemoryXY.top-180)+" H "+ (physicalMemoryXY.left-boxXY.right);
			arrowcache += "<path d='"+path+"' stroke='black' stroke-width='1.25' fill='none'/>";
			document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
			step = 100;			
		}	
		
	
	}
	else if (step==4)
	{
		if (PageTableValidArray[pageTableIndex]==0)
		{
			document.getElementById("information_text").innerHTML ="Page requested is not found in Page Table. Data will be loaded from Secondary Memory. TLB, Page Table and Physical Memory is updated accordingly";	
			document.getElementById("information_text").style.backgroundColor="#F0CCCC";	
			TLBPageArray[counter]= document.getElementById("page").value;
			TLBFrameArray[counter] =physicalMemoryCounter.toString(16).toUpperCase(); 
			
			PageTableValidArray[pageTableIndex]=1;
			PageTableFrameArray[pageTableIndex]= physicalMemoryCounter;
			PhysicalMemoryContentArray[physicalMemoryCounter] = "Block "+document.getElementById("page").value+" Words : 0 - " + (offset-1) ;
			physicalMemoryCounter = (physicalMemoryCounter+1) %physicalMemoryRows;
			LoadTLBTable();	
			
		
		
		}
		else{
			document.getElementById("information_text").innerHTML ="Page requested is found in Page Table. Let's fetch the data from Physical Memory. Page is updated in TLB as well.";
			document.getElementById("information_text").style.backgroundColor="#F09999";	
			document.getElementById(("tr"+pageTableIndex)).style.backgroundColor ="blue";	
			document.getElementById(("trpp"+PageTableFrameArray[pageTableIndex])).style.backgroundColor = "yellow";			
			pagetableHit++;
			
			
			//UPDATE TLB AND MIDDLE BOX
			window.scroll(0,0);
			document.getElementById("middlebox_frame").innerHTML =PageTableFrameArray[pageTableIndex] ;			
			document.getElementById("middlebox_offset").innerHTML = document.getElementById("offset").value ;
			document.getElementById("middlebox_frame").style.backgroundColor = "yellow";			
			document.getElementById("middlebox_offset").style.backgroundColor = "yellow";		
			
			
			var PageTableFrameArraySelectedXY = document.getElementById(("tr"+pageTableIndex)).getBoundingClientRect();
			var OffsetRequestedXY = document.getElementById(("offset")).getBoundingClientRect();
			var MiddleBoxFrameXY = document.getElementById(("middlebox_frame")).getBoundingClientRect();
			var physicalMemoryXY = document.getElementById(("trpp"+PageTableFrameArray[pageTableIndex])).getBoundingClientRect();
			var TLBTableXY = document.getElementById("TLBTable").getBoundingClientRect();
	
			//LINE FROM SELECTED PAGE TABLE ROW TO MIDDLEBOX
			var path = "M "+(PageTableFrameArraySelectedXY.right - boxXY.right -20)+" , "+ (PageTableFrameArraySelectedXY.top-170) + 
					  " H " + (PageTableFrameArraySelectedXY.right - boxXY.right) +" V "+(TLBTableXY.bottom-170);
			arrowcache += "<path d='"+path+"' stroke='black' stroke-width='1.25' fill='none'/>";
			
			//LINE FROM OFFSET TO MIDDLEBOX_OFFSET
			var path = "M "+(1.1*(0.5*(OffsetRequestedXY.left+OffsetRequestedXY.right)- boxXY.right))+","+0+" V "+(TLBTableXY.bottom-170);
			arrowcache += "<path d='"+path+"' stroke='black' stroke-width='1.25' fill='none'/>";				
			document.getElementById("offset").style.backgroundColor="yellow";			

			
			//LINE FROM MIDDLEBOX_FRAME TO PHYSICAL MEMORY
			var path = "M "+(0.97*(0.5*(MiddleBoxFrameXY.left+MiddleBoxFrameXY.right)- boxXY.right))+","+
						(TLBTableXY.bottom-170) +" V "+(physicalMemoryXY.top-180)+" H "+ (physicalMemoryXY.left-boxXY.right);
			arrowcache += "<path d='"+path+"' stroke='black' stroke-width='1.25' fill='none'/>";			
			TLBHitBoolean = true;
			TLBHit++;
			document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
			
			TLBPageArray[counter]= document.getElementById("page").value;
			TLBFrameArray[counter] =PageTableFrameArray[pageTableIndex]; 
			document.getElementById("TLBTable").innerHTML = loadVMTLBTable();
			document.getElementById(("trTLB"+counter)).style.backgroundColor ="yellow";
		}
	}
	else{
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="The cycle has been completed.<br> Please submit another instructions";
		document.getElementById("information_text").style.backgroundColor="";	
		document.getElementById("drawingSpace").innerHTML ="";
		document.getElementById('instruction_data').disabled = false;
		document.getElementById('submit').disabled = false;	
		document.getElementById(("tr"+pageTableIndex)).style.backgroundColor ="";	
		if (indexOfPageTLB!=-1){
			document.getElementById(("trpp"+TLBFrameArray[indexOfPageTLB])).style.backgroundColor = "";
			document.getElementById(("trTLB"+indexOfPageTLB)).style.backgroundColor ="";			
		}
	
		resetColouring();
		
		var listofPrevIns="<ul>";
		for (p=0;p<listOfInstructions.length;p++)
		{
			listofPrevIns +="<li> "+listOfInstructions[p].toUpperCase()+" </li>"; 
		}
		listofPrevIns +="</ul>";
		document.getElementById('listOfInstructionsLabel').innerHTML = listofPrevIns;
		var hitRate = (TLBHit+pagetableHit) / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" ;
		
		
		step=-1;
	}

	step++;

	}
}
