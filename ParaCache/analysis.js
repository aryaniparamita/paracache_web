var sessionstart = false;
var validBitArray = [];
var validTagArray = [];
var validDataArray = [];
var LRU = [];
var LRUIndex = [];
var setAssociative=[];
var drawingSpaceHeight = 0;
var cache = [];
var cacheType = [];
var memory = 0;
var offset = 0;
var offsetrange=0;
var tag = 0;
var block = 0;
var hit = [];
var miss = [];
var instructions = [];
var listOfInstructions = [];
var listOfInstructionsTF =[];
var cacheBit = [], memoryBit = 0, offsetBit = 0, tagBit = [];
var counter=[];
var drawTableClass = ["","","sa2table","","sa4table"];
var chartcounter = 1;
var resourceNAND = [];
var chartBody =[];
    chartBody[0]=[];
    chartBody[0]=['ID', 'Resource Needed', 'Hit Rate', 'Cache Type','Cache Size'];
function graph(){
    if (document.getElementById("curve_chart").style.visibility=='visible' )
        {
        document.getElementById("curve_chart").style.visibility='hidden';     
        }
    else{
        document.getElementById("curve_chart").style.visibility='visible'; 
    }
    loadGraph();
}
$.getScript("https://www.gstatic.com/charts/loader.js", function(){ google.charts.load('current', {'packages':['corechart']});})
function loadGraph(){
    google.charts.setOnLoadCallback(drawSeriesChart);
    function drawSeriesChart() {
          var data = google.visualization.arrayToDataTable(chartBody);
          var options = {
            title: 'Correlation between hit rate, resource needed (NAND gates), cache type ' +
                   'and cache size',
            hAxis: {title: 'Resource Needed (NAND Gates)'},
            vAxis: {title: 'Hit Rate'},
            bubble: {textStyle: {fontSize: 11}}
          };
          var chart = new google.visualization.BubbleChart(document.getElementById('curve_chart'));
          chart.draw(data, options);
        }
    }
function Initialise()
{
    listOfInstructions=[];
    document.getElementById("listOfInstructionsLabel").innerHTML = listOfInstructions.toString();
    for (var cacheLoop=1; cacheLoop<=4;cacheLoop++)
        {
            hit[cacheLoop]=0;
            miss[cacheLoop]=0;
            counter[cacheLoop]=0;
            LRUIndex[cacheLoop]=0;
            resourceNAND[cacheLoop]=0;
            listOfInstructionsTF[cacheLoop]=[];
        }
}
function loadConfiguration()
{

	var allValid = true;
    offsetBit = parseInt(document.getElementById('offsetsize').value);
    offset = Math.pow(2,offsetBit);
	memory = parseInt(document.getElementById('memorysize').value);
    Initialise();
    for (var cacheLoop = 1; cacheLoop<=4; cacheLoop++)
        {
            var cacheName = "cache" + cacheLoop + "_size";
            var e = document.getElementById(("cache"+cacheLoop+"type"));
            cacheType[cacheLoop] = e.options[e.selectedIndex].text;
                         if ((cacheType[cacheLoop]=="Direct Memory Cache")||
                            (cacheType[cacheLoop]=="Fully Associative Cache"))
                            {
                                setAssociative[cacheLoop] = 1;
                            }
            else if (cacheType[cacheLoop]=="2-Way Set Associative Cache")
                { setAssociative[cacheLoop] = 2;}
            else {setAssociative[cacheLoop] = 4;}
            //ONLY AFTER KNOW THE SET ASSOCIATIVE WE COULD DETERMINE THE INDEX
            cache[cacheLoop] = parseInt(document.getElementById(("cache" + cacheLoop + "_size")).value) / offset / setAssociative[cacheLoop];
            if (setAssociative[cacheLoop]>1)
                {
                    LRUIndex[cacheLoop]=[]
                  for (var i=0; i<cache[cacheLoop]; i++)
                      {
                          LRUIndex[cacheLoop][i]=0;
                          
                      }
                }

            
            if ((checkPowerOfTwo(cache[cacheLoop]) && checkPowerOfTwo(memory)) == false) 
                { allValid=false;
                  alert ("Cache, Memory and Offset must be in power of two");
                }
            else{
                cacheBit[cacheLoop] = logtwo(cache[cacheLoop]);
                memoryBit = logtwo(memory);
                offsetrange = offset - 1;
                if ((cacheBit[cacheLoop]>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit[cacheLoop])))
                    {    
                        validBitArray[cacheLoop]=[];
                        validTagArray[cacheLoop]=[];
                        validDataArray[cacheLoop]=[];
                        LRU[cacheLoop]=[];
                        for (var ca=0; ca<setAssociative[cacheLoop]; ca++)
                            {
				            LRU[cacheLoop][ca] = initialiseNumberedArray(setAssociative);
                            validBitArray[cacheLoop][ca] = initialiseZeroArray(cache[cacheLoop]);
                            validTagArray[cacheLoop][ca] = initialiseHypenArray(cache[cacheLoop]);
                            validDataArray[cacheLoop][ca] = initialiseZeroArray(cache[cacheLoop]);
                            }

                    }
                else{
                    allValid = false;
                    alert(("Configuration is not valid for Cache "+ cacheLoop +" Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size"));
                }
            }
        }
    if (allValid==true)
    {
        document.getElementById('submitConfig').disabled = true;
        setTable();
    }
        
}


function setTable(){
	sessionstart=true;
    var whattowrite="";
    for (cacheLoop=1;cacheLoop<=4;cacheLoop++)
        {

        whattowrite+="<div id=head3 class=head3><h4>"+ cacheLoop +". "+ cacheType[cacheLoop]+
                    "["+ cache[cacheLoop]+"] </h4></div><div id=hmiss class=hmiss><h4> HIT <label id=hitrate"+cacheLoop+" class=hitrate> - </label> MISS <label id=missrate"+cacheLoop+" class=missrate> - </label><br>"+
                    " RESOURCES <label id=resource"+cacheLoop+" class= resource> 0 </label> NAND</h4></div><br>";
       // chartBody[0].push((cacheLoop + ". " + cacheType[cacheLoop]+"[" + cache[cacheLoop]+"]"));
        whattowrite += setInstructionTable(cacheLoop);
        tagBit[cacheLoop] = memoryBit - cacheBit[cacheLoop] - offsetBit;

        for (var ca=0; ca<setAssociative[cacheLoop];ca++)
        {
            whattowrite+="<div id=\"draw\" class="+drawTableClass[setAssociative[cacheLoop]]+">";
            whattowrite+="<table class=drawtable id=cache"+cacheLoop+"table"+ca+">"+
                "<tr><td  id=marker-1> Index</td><td> Valid </td><td> Tag </td> <td> Data (Hex) </td></tr>";
            for (var z = 0; z<cache[cacheLoop]; z++) { 
            whattowrite += "<tr id=tr"+cacheLoop+"_"+ca+"_"+z+"><td id=marker"+z+">"+z+"</td><td id=valid"+cacheLoop+"_"+ca+"_"+z+"> "+validBitArray[cacheLoop][ca][z]+
                            " </td><td id=tag"+cacheLoop+"_"+ca+"_"+z+">"+ validTagArray[cacheLoop][ca][z] +
                            "</td><td id=offset"+cacheLoop+"_"+ca+"_"+z+">"+ validDataArray[cacheLoop][ca][z]+"</td></tr>";
            }
            whattowrite +="</table></div>";
        
        }
        }
    document.getElementById("tableSpace").innerHTML = whattowrite;
    for (var cacheLoop=1; cacheLoop<=4; cacheLoop++)
    {
        tagBit[cacheLoop] = memoryBit - cacheBit[cacheLoop] - offsetBit;
        if (cacheType[cacheLoop]=="Fully Associative Cache"){
        document.getElementById(("tagbit"+cacheLoop)).innerHTML= (tagBit[cacheLoop]+cacheBit[cacheLoop]) + " bit";



        }
        else{
             document.getElementById(("tagbit"+cacheLoop)).innerHTML= tagBit[cacheLoop] + " bit";
            document.getElementById(("indexbit"+cacheLoop)).innerHTML= cacheBit[cacheLoop] + " bit"; 
        }
        document.getElementById(("offsetbit"+cacheLoop)).innerHTML= offsetBit + " bit";	
        document.getElementById(("cache"+cacheLoop+"_size")).disabled = true;
        document.getElementById(("cache"+cacheLoop+"type")).disabled = true;
        document.getElementById('memorysize').disabled = true;
        document.getElementById('offsetsize').disabled = true;
        resetColouring();
    }
}
function setInstructionTable(loop)
{
    var strtowrite ="<h4><i class=\"fa fa-sign-in\" aria-hidden=\"true\"></i> Instruction Breakdown </h4><div id=\"analysisinstruction\" class=\"analysisinstruction\"><table  id=caption class=caption>";
    if (cacheType[loop]=="Fully Associative Cache")
        {
        strtowrite+="<tr><td><input type=\"text\" id=\"tagIB"+loop+"\" placeholder=\"tag\" disabled></input></td><td><input type=\"text\" id=\"offsetIB"+loop+"\" placeholder=\"offset\" disabled></input></td></tr><tr><td id=\"tagbit"+loop+"\">  &nbsp;</td><td id=\"offsetbit"+loop+"\">&nbsp;</td></tr></table></div>";
        }
    else{
        strtowrite+="<tr><td><input type=\"text\" id=\"tagIB"+loop+"\" placeholder=\"tag\" disabled></input></td><td><input type=\"text\" id=\"index"+loop+"\" name=\"index"+loop+"\" placeholder=\"index\" disabled></input></td><td><input type=\"text\" id=\"offsetIB"+loop+"\" placeholder=\"offset\" disabled></input></td></tr><tr><td id=\"tagbit"+loop+"\">  &nbsp;</td><td id=\"indexbit"+loop+"\">&nbsp;</td><td id=\"offsetbit"+loop+"\">&nbsp;</td></tr></table></div>";
        }
    strtowrite+="<br><h4> Cache Table </h4>"
    return strtowrite;
}

function breakInstruction()
{
    instructions=[];
    var string = document.getElementById("analysisInstructionTA").value;
    var src = string.split(",");
    var okay = true;
    for (var i=0;i<src.length;i++)
    {
        var number = parseInt(src[i],16).toString(16).toUpperCase();
        var binary = parseInt(number,16).toString(2);
        var instructionInt = parseInt(number,16).toString(10);
        if (instructionInt<0 || instructionInt>memory ||isNaN(instructionInt))
        {
            alert("List of Instruction should be in HEX. Ensure you have submitted the configuration and try again.");
            document.getElementById("analysisInstructionTA").focus();
            okay =false;
            break;
        }
        else{
            instructions.push(number);
        }
            
    }
    if (okay){
            document.getElementById('submit').disabled = true;	
            loadInstruction(instructions[0]);
    }
}
function loadInstruction(hex)
{
	if (sessionstart)
	{
		var binary = parseInt(hex,16).toString(2);
        var arraytoDisplay = instructions.slice(1);
		document.getElementById("analysisInstructionTA").value = arraytoDisplay.toString(16);
        while (binary.length < memoryBit){binary = "0"+ binary;}
        for (var cacheLoop=1; cacheLoop<=4;cacheLoop++){
            var afterindex = parseInt(tagBit[cacheLoop]) + parseInt(cacheBit[cacheLoop]);
            if (cacheType[cacheLoop]!="Fully Associative Cache")
                {
                    //WRITE TAG
                    if (binary.substr(0,tagBit[cacheLoop])>0){
                        document.getElementById(("tagIB"+cacheLoop)).value = binary.substr(0,tagBit[cacheLoop]);
                    }
                    else
                    {
                        document.getElementById(("tagIB"+cacheLoop)).value =0;
                    }
                    //WRITE INDEX
                    if (binary.substr(tagBit[cacheLoop],cacheBit[cacheLoop])>0){
                        document.getElementById(("index"+cacheLoop)).value = binary.substr(tagBit[cacheLoop],cacheBit[cacheLoop]);
                    }
                    else
                    {
                        document.getElementById(("index"+cacheLoop)).value =0;
                    }
                }
            else{
                if (binary.substr(0,(tagBit[cacheLoop]+cacheBit[cacheLoop]))>0){
                      document.getElementById(("tagIB"+cacheLoop)).value = binary.substr(0,(tagBit[cacheLoop]+cacheBit[cacheLoop]));}
                else{document.getElementById(("tagIB"+cacheLoop)).value=0;}

            }
            if (binary.substr(afterindex)>0){
                document.getElementById(("offsetIB"+cacheLoop)).value = binary.substr(afterindex);
            }
            else
            {
                document.getElementById(("offsetIB"+cacheLoop)).value =0;
            }
            block = parseInt(binary.substr(0,afterindex),2).toString(16);
        }
        listOfInstructions.push(hex);	
        document.getElementById('currentInstructionDiv').innerHTML = hex;
        procInstruction();

	}
	else
	{
		alert ("Please Specify Cache Configuration First!");
	}
}

function procInstruction(){
    for (var cacheLoop = 1; cacheLoop<=4; cacheLoop++)
    {
        for (var ca=0; ca<setAssociative[cacheLoop]; ca++)
        {
           for (var rows=0; rows<validBitArray[cacheLoop][ca].length; rows++)
            {
            document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+rows)).style.backgroundColor = "";   
            }
        }
    }
    for (var cacheLoop = 1; cacheLoop<=4; cacheLoop++)
        {
            if (cacheType[cacheLoop]!="Fully Associative Cache")
                {
                var indexP = parseInt(document.getElementById(("index"+cacheLoop)).value,2);                    
                }
            else
                {
                var indexP = parseInt(document.getElementById(("tagIB"+cacheLoop)).value,2);
                }

            if (cacheType[cacheLoop]=="Direct Memory Cache")
            {
                resourceNAND[cacheLoop]+=2;
                var ca=0;
                var validP = document.getElementById(("valid"+cacheLoop+"_"+ca+"_"+indexP)).value;
                if (validBitArray[cacheLoop][ca][indexP]==0)
                    {

                        miss[cacheLoop]++;
                        validBitArray[cacheLoop][ca][indexP]=1;
                        validTagArray[cacheLoop][ca][indexP]= document.getElementById(("tagIB"+cacheLoop)).value;
                        validDataArray[cacheLoop][ca][indexP] = ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();

                        document.getElementById(("valid"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML=1;
                        document.getElementById(("tag"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validTagArray[cacheLoop][ca][indexP];
                        document.getElementById(("offset"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validDataArray[cacheLoop][ca][indexP];
                        document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+indexP)).style.backgroundColor = "#F0CCCC";                            

                    }
                else 
                    {
                        resourceNAND [cacheLoop]+=4*tagBit[cacheLoop]; //Compare tags when validbit = 1
                        if (validTagArray[cacheLoop][ca][indexP]==(document.getElementById(("tagIB"+cacheLoop)).value))
                            {
                                hit[cacheLoop]++;   
                               listOfInstructionsTF[cacheLoop].push(0); document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+indexP)).style.backgroundColor = "#00AA00";  
                            }
                        else {
                            miss[cacheLoop]++;
                            listOfInstructionsTF[cacheLoop].push(0); 
                            validTagArray[cacheLoop][ca][indexP]= document.getElementById(("tagIB"+cacheLoop)).value;
                            validDataArray[cacheLoop][ca][indexP] = ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();
                            document.getElementById(("tag"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validTagArray[cacheLoop][ca][indexP];
                            document.getElementById(("offset"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validDataArray[cacheLoop][ca][indexP];
                            document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+indexP)).style.backgroundColor = "#F0CCCC";    
                        }
                    }
            }
            else if (cacheType[cacheLoop]=="Fully Associative Cache")
                {
                    var ca= 0;
                    var noValidBit = 0;
                    for (var no=0; no<validBitArray[cacheLoop][ca].length; no++)
                        {
                            if (validBitArray[cacheLoop][ca][no]==1)
                                {
                                    noValidBit++;
                                }
                        }
                    resourceNAND[cacheLoop]+=cache[cacheLoop]*2 + tagBit[cacheLoop]*4 * noValidBit;

                    var localValid = false;
                    for (var cacheLength=0; cacheLength<validTagArray[cacheLoop][ca].length; cacheLength++)
                        {
                            if (validTagArray[cacheLoop][ca][cacheLength] == indexP)
                                {
                                    localValid=true;
                                    LRUIndex[cacheLoop] = cacheLength;
                                }
                        }
                    if (localValid)
                        {
                            hit[cacheLoop]++;
                            listOfInstructionsTF.push(1); document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+LRUIndex[cacheLoop])).style.backgroundColor = "#00AA00";  
                        }
                    else{
                        validBitArray[cacheLoop][ca][counter[cacheLoop]]=1;
                        validTagArray[cacheLoop][ca][counter[cacheLoop]]=indexP;
                        validDataArray[cacheLoop][ca][counter[cacheLoop]] = ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();
                        document.getElementById(("valid"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).innerHTML=1;
                        document.getElementById(("tag"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).innerHTML = validTagArray[cacheLoop][ca][counter[cacheLoop]];
                            document.getElementById(("offset"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).innerHTML = validDataArray[cacheLoop][ca][counter[cacheLoop]];
                        document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).style.backgroundColor = "#F0CCCC";    
                        miss[cacheLoop]++;
                        listOfInstructionsTF[cacheLoop].push(0); 
                        LRUIndex[cacheLoop] = counter[cacheLoop];
                        if (counter[cacheLoop]<(cache[cacheLoop]-1))
                        {counter[cacheLoop]++;}
                        else {counter[cacheLoop]=0;}
                    }
                }
            else{ //2 AND 4 WAY SET ASSOCIATIVE
                var ca= setAssociative[cacheLoop];
                var noValidBit = 0;
                var validP =[];
                var tagP =[];
                for (var ca=0; ca<setAssociative[cacheLoop];ca++)
                    {

                        counter[cacheLoop]=[];
                        validP[ca] = validBitArray[cacheLoop][ca][indexP];
                        tagP[ca]=validTagArray[cacheLoop][ca][indexP];
                        if (validP==1)
                            {
                                noValidBit++;
                            }
                    }
                resourceNAND[cacheLoop] += ca*2 + noValidBit * 6 *tagBit[cacheLoop];
                var tagIBC = parseInt(document.getElementById(("tagIB"+cacheLoop)).value,2);  
                if (validP.indexOf(1)==-1)
                {
                    var id = LRUIndex[cacheLoop][indexP];
                    validBitArray[cacheLoop][id][indexP]=1;
                    validTagArray[cacheLoop][id][indexP]= tagIBC;
                    validDataArray[cacheLoop][id][indexP]=("B. "+block+" W. 0 - "+ offsetrange).toUpperCase();
                    document.getElementById(("valid"+cacheLoop+"_"+id+"_"+indexP)).innerHTML=1;
                    document.getElementById(("tag"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= validTagArray[cacheLoop][id][indexP];
                    document.getElementById(("offset"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= 
                        validDataArray[cacheLoop][id][indexP];
                    document.getElementById(("tr"+cacheLoop+"_"+id+"_"+indexP)).style.backgroundColor = "#F0CCCC";  
                    if (LRUIndex[cacheLoop][indexP]<setAssociative[cacheLoop])
                        {
                            LRUIndex[cacheLoop][indexP]++;
                        }
                    else { LRUIndex[cacheLoop][indexP] = 0;}
                    miss[cacheLoop]++;
                    listOfInstructionsTF[cacheLoop].push(0); 
                }
                else{
                    if (tagP.indexOf(tagIBC)==-1)
                        {
                        var id = LRUIndex[cacheLoop][indexP];
                        validBitArray[cacheLoop][id][indexP]=1;
                        validTagArray[cacheLoop][id][indexP]= tagIBC;
                        validDataArray[cacheLoop][id][indexP]=("B. "+block+" W. 0 - "+ offsetrange).toUpperCase();
                        document.getElementById(("valid"+cacheLoop+"_"+id+"_"+indexP)).innerHTML=1;
                        document.getElementById(("tag"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= tagIBC;
                        document.getElementById(("offset"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= 
                            validDataArray[cacheLoop][id][indexP];
                        document.getElementById(("tr"+cacheLoop+"_"+id+"_"+indexP)).style.backgroundColor = "#F0CCCC";   
                        if (LRUIndex[cacheLoop][indexP]<(setAssociative[cacheLoop]-1))
                        {
                            LRUIndex[cacheLoop][indexP]++;
                        }
                        else { LRUIndex[cacheLoop][indexP] = 0;}
                        
                        miss[cacheLoop]++;
                        }
                    else //TAG is FOUND in the EXISTING CACHE
                        {
                            var id = tagP.indexOf(tagIBC);
                            hit[cacheLoop]++;
                           listOfInstructionsTF[cacheLoop].push(1);  document.getElementById(("tr"+cacheLoop+"_"+id+"_"+indexP)).style.backgroundColor = "#00AA00";  
                        }
                }
            }
        //UPDATE HIT MISS RESOURCE RATE
        var listofPrevIns="<ul>";
		for (p=0;p<listOfInstructions.length;p++)
		{
            var cacheResult="";
            for (j=1; j<=4; j++)
                {
                if (listOfInstructionsTF[j][p]==0)
                {
                    cacheResult += "M";
                }
                else {
                    cacheResult += "H";
                }
                if (j!=4) {cacheResult +=" | ";}
                }
        
			listofPrevIns +="<li> "+listOfInstructions[p].toUpperCase()+" [" + cacheResult+"] </li>"; 
		}
		listofPrevIns +="</ul>";
		document.getElementById('listOfInstructionsLabel').innerHTML = listofPrevIns;
        var hitRate = hit[cacheLoop]/listOfInstructions.length;
        var missRate = miss[cacheLoop]/listOfInstructions.length;
        document.getElementById(("hitrate"+cacheLoop)).innerHTML =  Math.round(hitRate*100,2) +"%";
        document.getElementById(("missrate"+cacheLoop)).innerHTML = Math.round(missRate*100,2) +"%";
        document.getElementById(("resource"+cacheLoop)).innerHTML = resourceNAND[cacheLoop];
        }
        updateChartBody();
        if (instructions.length<2)
        {
          document.getElementById('submit').disabled = false;          
        }
}
function updateChartBody(){
     //['ID', 'Resource Needed', 'Hit Rate', 'Cache Type',     'Cache Size'],

        for (cacheLoop = 1; cacheLoop<=4; cacheLoop++)
        {
            var hitRate = Math.round(hit[cacheLoop]/listOfInstructions.length *100,2);
            chartBody[chartcounter] = [];
            chartBody[chartcounter].push("");
            chartBody[chartcounter].push(resourceNAND[cacheLoop]);
            chartBody[chartcounter].push(hitRate);
            chartBody[chartcounter].push((cacheType[cacheLoop] + cacheLoop));
            chartBody[chartcounter].push((cache[cacheLoop]*offset *setAssociative[cacheLoop]));
            chartcounter++;
        }
}
function nextInstruction(){
    
    instructions.shift();
    if (instructions.length>0)
        {
            loadInstruction(instructions[0]);
        }
    else{
        alert ("Please submit new instructions");
        document.getElementById('submit').disabled = false;   
    }
    
}
function resetInstruction(){
    document.getElementById("analysisInstructionTA").value="";
    document.getElementById('submit').disabled = false;  
    document.getElementById("currentInstructionDiv").innerHTML="";
    var temp = chartBody[0];
    chartBody =[];
    chartcounter=0;
    chartBody[0] = temp;
    chartcounter = 1;
    Initialise();
    loadConfiguration();
}
function ffInstruction(){
    if (document.getElementById('submit').disabled ==false)
        {
            alert ("Please Submit Instructions first");
        }
    else
    {
        while (instructions.length>1)
            {
                instructions.shift();
                loadInstruction(instructions[0]);
            }
        alert ("Done");
    }
}
function randomArray()
{
    var arInst =[];
    
    for (var ct=0;ct<88; ct++)
        {
          arInst.push(Math.floor(Math.random() * memory).toString(16));  
        }
    document.getElementById("analysisInstructionTA").value = arInst.toString();
    
}

function rndConfiguration()
{
    var rndOffset= Math.ceil(Math.random() * 4)
    document.getElementById('offsetsize').value = rndOffset;
    var rndMemory = Math.floor(Math.random() *15)+rndOffset;
	document.getElementById('memorysize').value = Math.pow(2,rndMemory);
    for (var cacheLoop=1; cacheLoop<=4;cacheLoop++)
        {
            var rndType =  Math.floor(Math.random() *4);
            document.getElementById(("cache"+cacheLoop+"type")).options[rndType].selected = 'selected';
            var rndCache = Math.floor(Math.random() *(rndMemory-rndOffset));
            document.getElementById(("cache"+cacheLoop+"_size")).value = Math.pow(2,rndCache);            
            
        }
      
}