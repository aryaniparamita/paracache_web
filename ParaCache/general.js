
function checkPowerOfTwo(arbitaryNumber)
{
	if (Math.pow(2,(Math.log(arbitaryNumber)/Math.log(2)))==arbitaryNumber)
	{
		return true;
	}
	else
	{
		return false;
	}
}
function logtwo(arbitaryNumber)
{
	return (Math.log(arbitaryNumber)/ Math.log(2));
}	
function initialiseHypenArray (numrows) {
		var validTagArray = new Array ();
		for (i=0; i<numrows; i++){
			validTagArray[i]="-";
		}
		return validTagArray;
}
function initialiseZeroArray (numrows) {
		var validDataArray = new Array ();
		for (i=0; i<numrows; i++){
			validDataArray[i]=0;
		}
		return validDataArray;
}
function initialiseNumberedArray (numrows) {
		var validTagArray = new Array ();
		for (i=0; i<numrows; i++){
			validTagArray[i]=i;
		}
		return validTagArray;
}
function loadTable(){
	var whattowrite="<table class=drawtable id=cachetable><tr><td  id=marker-1> Index</td><td> Valid </td><td> Tag </td> <td> Data (Hex) </td></tr>";
	for (z = 0; z< cache; z++) { 
    whattowrite += "<tr id=tr"+z+"><td id=marker"+z+">"+z+"</td><td id=valid"+z+"> "+validBitArray[z]+
					" </td><td id=tag"+z+">"+ validTagArray[z] +
					"</td><td id=offset"+z+">"+ validDataArray[z]+"</td></tr>";
	}
	whattowrite +="</table>";
	return whattowrite;


}
function setmemorytable(){
	var writeTable ="<table>";
	for (var rows=0; rows< Math.pow(2,(memoryBit-offsetBit)); rows++)
	{
		writeTable +="<tr id= memoryRow"+rows+">";
		for (var cells=0; cells<offset; cells++)
		{
			writeTable+="<td id= memory"+rows+cells+"> B. "+rows.toString(16).toUpperCase()+" W. " + cells.toString(16).toUpperCase() +"</td>";
		}
		writeTable +="</tr>";
	}
	writeTable+="</table>";
	document.getElementById("memoryblocks").innerHTML = writeTable;
	
}

function generateRandomNumber()
{
	var checkCacheSize = document.getElementById('cachesize');

	if (document.getElementById("instruction_data").disabled==true)
	{
		alert("Please Finish the previous instruction first!");
	}
	else if (checkCacheSize!= null) 
	{
		if (checkCacheSize.disabled==false){alert("Please specify configuration first!");}
		else {
			
			var random = Math.floor(Math.random() * memory).toString(16);
			document.getElementById('instruction_data').value = random;
		}
	}
	else{
	var random = Math.floor(Math.random() * memory).toString(16);
	document.getElementById('instruction_data').value = random;
	}
}
function fastForward()
{
	if (document.getElementById("instruction_data").disabled==false)
	{
		alert("Please submit the Load Instruction");
	}
	else{
	while (step>0 && document.getElementById("instruction_data").disabled==true)
	{
		loadInformation(step);
	}
	}

}
function resetColouring(){
	if (document.getElementById("page"))
	{
		document.getElementById("page").style.backgroundColor ="";
	}
	if (document.getElementById("offset"))
	{
		document.getElementById("offset").style.backgroundColor ="";

	}
	if (document.getElementById("middlebox_frame"))
	{
		document.getElementById("middlebox_frame").style.backgroundColor ="";
		document.getElementById("middlebox_frame").innerHTML ="Frame";
	}	
	if (document.getElementById("middlebox_offset"))
	{
		document.getElementById("middlebox_offset").style.backgroundColor ="";
		document.getElementById("middlebox_offset").innerHTML ="Offset";
	}
	if (document.getElementById("tag"))
	{
		document.getElementById("tag").style.backgroundColor ="";
	}	
	if (document.getElementById("index"))
	{
		document.getElementById("index").style.backgroundColor ="";
	}	
		
	if (document.getElementById("drawingSpace"))
	{
		document.getElementById("drawingSpace").innerHTML="";
	}
}


function adjustLRU(){
	cacheReplacementPolicy = $("input[name=ReplacementPolicy]:checked").val();
	LRUController();
}

function resetStatistic()
{
	
}
function resetConfiguration()
{
	location.reload();
	
}
function printConfiguration()
{
    return(" Offset = " + offsetBit+ " bits"+
                "<br> Index bits = log<sub>2</sub>("+(cache*offset)+"/"+ offset+") = "+ cacheBit + " bits"+
                "<br> Instruction Length = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Tag = "+ memoryBit + " bits - " + offsetBit + " bits - " + cacheBit +" bits = " +tagBit+" bits"+
                "<br> Block = "+tagBit +" bits + " +cacheBit+" bits = "+ (tagBit+cacheBit)+ " bits"+
                "<br><br> Please submit Instruction.");
}
function printConfigurationSA2()
{
    return(" Offset = " + offsetBit+ " bits"+
                "<br> Index bits = log<sub>2</sub>("+(cache*offset*2)+"/"+ offset+"/2) = "+ cacheBit + " bits"+
                "<br> Instruction Length = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Tag = "+ memoryBit + " bits - " + offsetBit + " bits - " + cacheBit +" bits = " +tagBit+" bits"+
                "<br> Block = "+tagBit +" bits + " +cacheBit+" bits = "+ (tagBit+cacheBit)+ " bits"+
                "<br><br> Please submit Instruction.");
}
function printConfigurationSA4()
{
    return(" Offset = " + offsetBit+ " bits"+
                "<br> Index bits = log<sub>2</sub>("+(cache*offset*4)+"/"+ offset+"/4) = "+ cacheBit + " bits"+
                "<br> Instruction Length = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Tag = "+ memoryBit + " bits - " + offsetBit + " bits - " + cacheBit +" bits = " +tagBit+" bits"+
                "<br> Block = "+tagBit +" bits + " +cacheBit+" bits = "+ (tagBit+cacheBit)+ " bits"+
                "<br><br> Please submit Instruction.");
}
