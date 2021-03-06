var setAssociative = 2;


//Set Associative Configuration
var rendertableText = ["",""];
var phpNaming = ["","Two"];
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;

//Drawing
var tagpathstopX =[0 ,0];


function loadConfiguration()
{
	loadCommonConfiguration();


	if ((checkPowerOfTwo(cache) && checkPowerOfTwo(memory)) == false) { alert ("Cache, Memory and Offset must be in power of two");}
	else
	{
		cacheBit = logtwo(cache);
		memoryBit = logtwo(memory);
		tagBit = memoryBit - cacheBit - offsetBit;
		if ((cacheBit>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit)) && (tagBit>=1))
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
            document.getElementById("information_text").innerHTML=printConfigurationSA2();
		}
		else{
			alert("Configuration is not valid. Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size. Cache size must be bigger or equals to 2^(2*OffsetBits).")
		}
	}
	
}





function loadInformation()
{	

	var validindex = parseInt(document.getElementById("index").value,2) ;
	var boxXY = document.getElementById("drawingSpace").getBoundingClientRect();
				

	
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
		v2 = document.getElementById(findtherow).getBoundingClientRect().top - document.getElementById("drawingSpace").getBoundingClientRect().top + 10;
		window.scroll(0,v2);
		var indexXY = document.getElementById("index").getBoundingClientRect();
		var indexMid = (indexXY.right + indexXY.left)/2 - boxXY.left;
		

		var path = "M "+indexMid+",0 V 110 H 10 V "+ v2 + "H 40";
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

		var tagpathheight = drawingSpaceHeight - 250;
		var validtagV = drawingSpaceHeight - 200;
		var dataXYArr=[0,0];
		var andWidth = 70;
		//COLOUR THE TAG FOR BOTH TABLE
		for (table=0; table<setAssociative;table++)
		{
			//TAG
			var findthetag = "tag"+phpNaming[table]+validindex ;
			document.getElementById(findthetag).style.backgroundColor ="green";
			var validXY = document.getElementById(("valid"+phpNaming[table]+validindex)).getBoundingClientRect().right - boxXY.left-5;
			var path2 = "M "+validXY+","+v2+" V "+validtagV;
			arrowcache += "<path d='"+path2+"' stroke='green' stroke-width='1.25' fill='none'/>";		
			tag
			//DATA VERTICAL LINE
			var dataXY = document.getElementById(("tag"+phpNaming[table]+validindex)).getBoundingClientRect().right - boxXY.left;
			if (dataXY >= (validXY+50)){dataXY = validXY+50;}
			var pathDataVerticalLine = "M "+dataXY+","+v2+" V "+validtagV;
			arrowcache += "<path d='"+pathDataVerticalLine+"' stroke='blue' stroke-width='1.25' fill='none'/>";			
			dataXYArr[table]= dataXY;
			//AND IMAGE
			arrowcache += "<image xlink:href='img/and.png'  x="+(validXY-10)+" y="+(validtagV-20)+" height="+andWidth+" width="+andWidth+" ></image>";		
			tagpathstopX[table]= (validXY+dataXY)/2;
		}

			

			//INSTRUCTION BREAKDOWN TAG
			var tagBitX = (document.getElementById("tagbit").getBoundingClientRect().right +document.getElementById("tagbit").getBoundingClientRect().left  )/2 - boxXY.left;
			var tagpath = "M "+ tagBitX+",0 V 90 "+ v2 + "V "+tagpathheight+" H "+dataXYArr[0];
			arrowcache += "<path d='"+tagpath+"' stroke='black' stroke-width='1.25' fill='none'/>";
			
			
			//TAG HORIZONTAL LINE TO BRANCH
			var path4 = "M "+tagBitX+","+(tagpathheight - 40)+" H "+ 0.60*document.getElementById("tableSpace").offsetWidth + " V "+tagpathheight +" H "+(dataXYArr[1]) ;
			arrowcache += "<path d='"+path4+"' stroke='black' stroke-width='1.25' fill='none'/>";	
			
			//DRAW LINE FROM BOTH AND GATE
			var Xmid = 0.48*document.getElementById("tableSpace").offsetWidth;	

			var lineforBothGateY1 = tagpathheight+ andWidth + 50; //drawingSpaceHeight - 130
			var lineforBothGateY2 = drawingSpaceHeight - 110 ;		
			var pathforBothGate = "M "+ tagpathstopX[0] +","+ (tagpathheight+ andWidth +15) + "V " + lineforBothGateY1 + " H "+ (Xmid-35) +
								  "V "+ lineforBothGateY2 +" H" + (Xmid+35) + "V " + lineforBothGateY1+
								  "H "+ tagpathstopX[1] + "V "+ (tagpathheight+ andWidth + 15) ;
			arrowcache += "<path d='"+pathforBothGate+"' stroke='black' stroke-width='1.25' fill='none'/>";	
			
			//OR IMAGE
				arrowcache += "<image xlink:href='img/or.png'  x="+(Xmid-40)+" y="+(lineforBothGateY2-10)+
								" height="+ 45+" width="+ 80 +" ></image>";	
			
			
		
								
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
			
			var compareY = drawingSpaceHeight - 275;
			if (validBitArray[validindex][0] == 1)
			{
			//COMPARE IMAGE
			var compareX =  tagpathstopX[0] + 20  - 25;
			arrowcache += "<image xlink:href='img/compare.png'  x="+compareX+" y="+compareY+
							" height=50 width=50 ></image>";
			}
			if (validBitArray[validindex][1]==1)
			{
			//COMPARE IMAGE TABLE 2
			var compareX =  tagpathstopX[1] + 20 - 25;
			arrowcache += "<image xlink:href='img/compare.png'  x="+compareX+" y="+compareY+
							" height=50 width=50 ></image>";
							
			}				
		
			if (validTagArray[validindex][0]==document.getElementById("tag").value)
			{

				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag for first table is the same. Therefore, CACHE HIT";
				document.getElementById("information_text").style.backgroundColor="#55F055";				

				var zeroarrowcache = arrowcache.replace ("img/and.png","img/and_hit.png");
				var newarrowcache = zeroarrowcache.replace ("img/and.png","img/and_miss.png");			
				hitBoolean = true;
				hit++;

				

								var indexOfTag = validTagArray[validindex].indexOf((document.getElementById("tag").value));
								var index = LRU[validindex].indexOf(indexOfTag);
								LRUIndex = indexOfTag;
						if (cacheReplacementPolicy =="LRU")
							{
								if (index>-1)
								{
									LRU[validindex].splice(index, 1);
								}
								LRU[validindex].push(LRUIndex);
							}

			
			}
			else if (validTagArray[validindex][1]==document.getElementById("tag").value)
			{
				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag for second table is the same. Therefore, CACHE HIT";
				document.getElementById("information_text").style.backgroundColor="#FFcc55";				

				var zeroarrowcache = arrowcache.replace ("img/and.png","img/and_miss.png");
				var newarrowcache = zeroarrowcache.replace ("img/and.png","img/and_hit.png");
				hitBoolean = true;
				hit++;	
				
				

								var indexOfTag = validTagArray[validindex].indexOf((document.getElementById("tag").value));
								var index = LRU[validindex].indexOf(indexOfTag);
								LRUIndex = indexOfTag;
						if (cacheReplacementPolicy =="LRU")
							{
								if (index>-1)
								{
									LRU[validindex].splice(index, 1);
								}
								LRU[validindex].push(LRUIndex);
							}

			}			
			else{
				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag is NOT the same. Therefore, CACHE MISS";		
				var newarrowcache = arrowcache.replace (/and.png/g,"and_miss.png");
				LRUIndex = LRU[validindex].shift();
				LRU[validindex].push(LRUIndex);
				
				validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "Block "+block+" Word 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();
			}
					

			
		}

		document.getElementById("drawingSpace").innerHTML = newarrowcache;	
		
	}	
	else if (step==5){
					document.getElementById("information_text").innerHTML ="OR gate is updated from cache blocks result.";	
		    newarrowcache = document.getElementById("drawingSpace").innerHTML;	
			
				if (!hitBoolean){
					var finalarrowcache = newarrowcache.replace("img/or.png","img/or_miss.png");
				}
				else{
					var finalarrowcache = newarrowcache.replace("img/or.png","img/or_hit.png");
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
		document.getElementById("information_text").style.backgroundColor="blue";		

	

		//Highlight Updated Row
		var findtherow = "tr"+phpNaming[LRUIndex]+validindex;
		document.getElementById(findtherow).style.backgroundColor ="blue";	
		
		if (!hitBoolean)
		{
			document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="blue";	
			document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true);			
		}

	}
	
	else{
		document.getElementById("information_text").innerHTML ="The cycle has been completed.<br> Please submit another instructions";
		document.getElementById("information_text").style.backgroundColor="";	
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="";	
		document.getElementById("tag").style.backgroundColor ="";
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