var setAssociative = 4;



//Set Associative Configuration
var rendertableText = ["","","",""];
var phpNaming = ["","Two","Three","Four"];
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;


	
function loadConfiguration()
{
	loadCommonConfiguration();

	if ((checkPowerOfTwo(cache) && checkPowerOfTwo(memory)) == false) { alert ("Cache, Memory and Offset must be in power of two");}
	else
	{
		cacheBit = logtwo(cache);
		memoryBit = logtwo(memory);
		tagBit = memoryBit - cacheBit - offsetBit;
		if ((cacheBit>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit)) && (tagBit>=2))
		{		

			for (ca=0;ca<cache;ca++)
			{
				LRU[ca]= new Array();
				LRU[ca] = initialiseNumberedArray(setAssociative);
				validBitArray[ca] = initialiseZeroArray(setAssociative);
				validTagArray[ca] = initialiseHypenArray(setAssociative);
				validDataArray[ca] = initialiseZeroArray(setAssociative);
			}

			offsetrange = offset - 1;
			drawingSpaceHeight = (cache)*25 +500;
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setmemorytable();
			setfirsttable();
            document.getElementById('submitConfig').disabled = true;	
            document.getElementById("information_text").innerHTML=printConfigurationSA4();
		}
		else{
			alert("Configuration is not valid. Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size. Cache size must be bigger or equals to 2^(4*OffsetBits).")
		}
	}
	
}

function loadInformation()
{	

	var validindex = parseInt(document.getElementById("index").value,2) ;
	getDrawingProperties();
	var tagpathstopX1 = document.getElementById(("valid"+phpNaming[0]+validindex)).getBoundingClientRect().right - boxXY.left;
	var tagpathstopX4 = document.getElementById(("valid"+phpNaming[3]+validindex)).getBoundingClientRect().right - boxXY.left;		
	
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
		
		var findtherow = "tr"+phpNaming[0]+validindex;
		v2 = document.getElementById(findtherow).getBoundingClientRect().top - boxXY.top + 10;
		window.scroll(0,v2);
		var path = "M "+indexMid+","+topBoundAddressEvaluated+" V "+topBoundCacheTable+" H 10 V "+ v2 + "H 40";
		arrowcache = "<svg width = 100% height=100%><path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";
		document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
		highlight("tr","yellow");
	}
		
	else if (step==2){
		document.getElementById("information_text").innerHTML ="Valid bit will be obtained and analysed.";
		document.getElementById("information_text").style.backgroundColor="green";
		highlight("valid","green");
	}	
	else if (step==3){
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="Following is the analysis diagram.";
		document.getElementById("information_text").style.backgroundColor="";	
		window.scroll(0,(drawingSpaceHeight-400));	

		var min250 = drawingSpaceHeight - 250;
		var min200 = drawingSpaceHeight-200;
		var andWidth = 70;	
		var lineforBothGateXmid = 0.5*document.getElementById("tableSpace").offsetWidth;	


			//TAG HORIZONTAL LINE FROM INSTRUCTION BREAK DOWN TO min190
			var min290 = drawingSpaceHeight - 290;
			var XY83 = 0.83*document.getElementById("tableSpace").offsetWidth;
			var pathHorizontalLineFromInstructionBreakDown = "M 60,"+topBoundAddressEvaluated+" V "+(topBoundCacheTable-3)+", H 0 V "+v2 +"V "+min290 +" H "+XY83 ;
			arrowcache += "<path d='"+pathHorizontalLineFromInstructionBreakDown+"' stroke='black' stroke-width='1.25' fill='none'/>";	


			for (comp=0;comp<setAssociative; comp++)
			{
				//TAG
				var findthetag = "tag"+phpNaming[comp]+validindex ;
				document.getElementById(findthetag).style.backgroundColor ="green";
				var validXY = document.getElementById(("valid"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left - 30;
				var path2 = "M "+validXY+","+v2+" V "+min200;
				arrowcache += "<path d='"+path2+"' stroke='green' stroke-width='1.25' fill='none'/>";		
			
				
				//DATA VERTICAL LINE
				var dataXY = document.getElementById(("tag"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left - 30;
				if (dataXY >= (validXY+50)){dataXY = validXY+50;}
				var pathDataVerticalLine = "M "+dataXY+","+v2+" V "+min200;
				arrowcache += "<path d='"+pathDataVerticalLine+"' stroke='blue' stroke-width='1.25' fill='none'/>";
				
				//COMPARE WITH REQUESTED TAG LINE
				var compareLineXY = (0.08+0.25*comp)*document.getElementById("tableSpace").offsetWidth;
				var pathDataVerticalLine = "M "+compareLineXY+","+min290+" V "+ min250 + "H "+dataXY;
				arrowcache += "<path d='"+pathDataVerticalLine+"' stroke='black' stroke-width='1.25' fill='none'/>";	

				//LINE AFTER AND OPERATION IS DONE
				var pathAndLine = "M "+(validXY+25)+","+(drawingSpaceHeight-180)+" V "+ (drawingSpaceHeight-120);
				arrowcache += "<path d='"+pathAndLine+"' stroke='red' stroke-width='1.25' fill='none'/>";
			
				//AND IMAGE
				arrowcache += "<image xlink:href='img/and.png'  x="+(validXY-10)+" y="+(min200-20)+" height="+andWidth+" width="+andWidth+" ></image>";		
				
				//LINE to OR GATES
				var line1 = "M "+ (lineforBothGateXmid-20 + comp*13) +" , " +  (drawingSpaceHeight-120) + " V " + (drawingSpaceHeight-85);
				arrowcache += "<path d='"+line1+"' stroke='red' stroke-width='1.25' fill='none'/>";	
				
			}
			
			//DRAW LINE FROM  AND GATES
			var pathforBothGate = "M "+ (tagpathstopX1-5) +","+(drawingSpaceHeight-120)+
								  "H "+ (tagpathstopX4-5);
			arrowcache += "<path d='"+pathforBothGate+"' stroke='red' stroke-width='1.25' fill='none'/>";	
			
			
			//OR IMAGE
				var compareY = drawingSpaceHeight -90;
				arrowcache += "<image xlink:href='img/or.png'  x="+(lineforBothGateXmid-40)+" y="+compareY+
								" height=40 width=80 ></image>";	
								
			document.getElementById("drawingSpace").innerHTML = arrowcache;
	}
	else if (step==4)
	{		
		if (cacheReplacementPolicy == "Random")	{LRUIndex = LRU[validindex][Math.floor(Math.random() * LRU[validindex].length)]; }	
		if (validBitArray[validindex].indexOf(1)==-1)
		{
			document.getElementById("information_text").innerHTML ="Valid bit is 0, therefore CACHE MISS is obtained. Cache is updated with the new dataset";
			document.getElementById("information_text").style.backgroundColor="#F09999";
					
			var newarrowcache = arrowcache.replace (/and.png/g,"and_miss.png");
				if (cacheReplacementPolicy != "Random")
				{
					LRUIndex = LRU[validindex].shift();
					LRU[validindex].push(LRUIndex);
				}
					validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "B. "+block+" W. 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();

		}
		else{

			document.getElementById("information_text").innerHTML="Valid bit is 1, therefore we should look into the both cache table. ";
		for (comp=0;comp<setAssociative; comp++)
				{
					if (validBitArray[validindex][comp]==1)
					{
						//COMPARE IMAGE
						var compareX = document.getElementById(("tag"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left - 45;
						var compareY = drawingSpaceHeight - 275;
						arrowcache += "<image xlink:href='img/compare.png'  x="+compareX+" y="+compareY+
									" height=40 width=40 ></image>";
					}
				}			
		
			if ((validTagArray[validindex].indexOf(document.getElementById("tag").value)!=-1) )
			{
				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag for first table is the same. Therefore, CACHE HIT";
				document.getElementById("information_text").style.backgroundColor="#55F055";				


				hit++;
				hitBoolean = true;
				if(cacheReplacementPolicy=="LRU")
				{
						var indexOfTag = validTagArray[validindex].indexOf((document.getElementById("tag").value));
						var index = LRU[validindex].indexOf(indexOfTag);
						LRUIndex = indexOfTag;

							if (index>-1)
								{
									LRU[validindex].splice(index, 1);
								}
								LRU[validindex].push(LRUIndex);
								
				}
							if (validTagArray[validindex][0]==document.getElementById("tag").value)
							{
                                indexHighlight = 0;
								var newarrowcache = arrowcache.replace ("and.png","and_hit.png");
								var newarrowcache = newarrowcache.replace (/and.png/g,"and_miss.png");			
							
							}
							else if (validTagArray[validindex][1]==document.getElementById("tag").value)
							{
                                indexHighlight = 1;
								var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
								var newarrowcache2 = newarrowcache.replace ("and.png","and_hit.png");
								var newarrowcache= newarrowcache2.replace(/and.png/g,"and_miss.png");
							}
							else if (validTagArray[validindex][2]==document.getElementById("tag").value){
                                indexHighlight = 2;
								var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace ("and.png","and_hit.png");	
								var newarrowcache= newarrowcache.replace("and.png","and_miss.png");
							}
							else if (validTagArray[validindex][3]==document.getElementById("tag").value)
							{
                                indexHighlight = 3;
								var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace("and.png","and_miss.png");
								var newarrowcache= newarrowcache.replace ("and.png","and_hit.png");
							}

			}
			else{
				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag is NOT the same. Therefore, CACHE MISS";		
				document.getElementById("information_text").style.backgroundColor="#FFcc55";				
				var newarrowcache = arrowcache.replace (/and.png/g,"and_miss.png");
				LRUIndex = LRU[validindex].shift();
				LRU[validindex].push(LRUIndex);
				
				validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "B. "+block+" W. 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();
			}
					

			
		}

		document.getElementById("drawingSpace").innerHTML = newarrowcache;	
		
	}	
	else if (step==5){
			document.getElementById("information_text").innerHTML="OR gate is updated from cache blocks result.";	
		    newarrowcache = document.getElementById("drawingSpace").innerHTML;	
			
				if (!hitBoolean){
					var finalarrowcache = newarrowcache.replace("or.png","or_miss.png");
				}
				else{
					var finalarrowcache = newarrowcache.replace("or.png","or_hit.png");
				}
		
		document.getElementById("drawingSpace").innerHTML = finalarrowcache;	
		
	}
	else if (step==6){

		document.getElementById("information_text").innerHTML = "Cache table is updated accordingly. <br>"+ 
																"Block "+ block.toUpperCase() +" with offset "+
																"0 to " + offsetrange + " is in cache";
									



		document.getElementById("drawingSpace").innerHTML = "";
		loadTableSetAssociative();

		document.getElementById("index").style.backgroundColor ="";
		document.getElementById("tag").style.backgroundColor ="blue";

	

		if (!hitBoolean)
		{
			document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="#FF4444";	
			document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true);		indexHighlight = LRUIndex;	
		}	
        
		//Highlight Updated Row
		var findtherow = "tr"+phpNaming[indexHighlight]+validindex;
		document.getElementById(findtherow).style.backgroundColor ="blue";	
		document.getElementById("information_text").style.backgroundColor="blue";	


	}
	
	else{
		document.getElementById("information_text").innerHTML ="The cycle has been completed.<br> Please submit another instructions";
		document.getElementById("information_text").style.backgroundColor="";
		document.getElementById("tag").style.backgroundColor ="";
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="";	
		window.scroll(0,0);
		
		var findtherow = "tr"+phpNaming[LRUIndex]+validindex;
		document.getElementById(findtherow).style.backgroundColor ="";	

        if (hitBoolean==true)
                {
                    listOfInstructionsTF.push(1);
                }
            else{
                listOfInstructionsTF.push(0);
            }
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
		document.getElementById('hitmiss').style.backgroundColor="yellow";
		document.getElementById('genRandom').style.backgroundColor="blue";	
		document.getElementById('instruction_data').focus();			

		step+=-1;
	}

	step++;

	}
}
function LRUController(){

			document.getElementById('nextReplace').innerHTML=  " - ";
			document.getElementById('lastReplace').innerHTML=  " - ";			
	

}