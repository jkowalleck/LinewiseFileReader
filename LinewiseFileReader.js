/**
 * line-wise file reader 
 *
 * @author jan Kowalleck <jan.kowalleck@googlemail.com>
 */
 
LinewiseFileReader = function ()
{
	this.reset();
};

LinewiseFileReader.prototype = {
	constructor : LinewiseFileReader ,

	reset : function () 
	{
		this.lines = [];
	} ,
	
	lineSplitRE : /\r?\n/ ,
	
	read : function (file)
	{
		if ( ! file ) 
		{ 
			throw new Error("noFile");
		}
		
		var file_size = file.size;
		if ( ! file_size )
		{
			throw new Error("fileEmpty");
		}		
	
		var linewiseFileReader = this;
		linewiseFileReader.reset();
		
		var reader = new FileReader(); 
		
		var chunkStart = 0;
		var chunkSize = 1024 * 100; // 100 KB
		var readChunk = function (start)
		{
			var blob = file.slice(start, start+chunkSize);
			reader.readAsText(blob);
		}

		var getProgress = function (type) 
		{
			return new ProgressEvent(type, {
				  lengthComputable : true
				, loaded : chunkStart
				, total : file_size
				});
		};
		
		var lineSplitRE = this.lineSplitRE;
		var lastChunkRest = "";
		reader.onloadend = function (loadend)
		{
			var reader = this;

			var chunkLines = (lastChunkRest + reader.result).split(lineSplitRE);
			lastChunkRest = chunkLines.pop();
			linewiseFileReader.lines = linewiseFileReader.lines.concat(chunkLines);

			chunkStart += loadend.loaded;
			var abort = ( linewiseFileReader.onload && linewiseFileReader.onload(getProgress("load"))===false );
			if ( !abort && chunkStart < file_size  )
			{
				readChunk(chunkStart);
			}
			else
			{
				linewiseFileReader.onloadend && linewiseFileReader.onloadend(getProgress("loadend"));
			}
		};

		readChunk(chunkStart);
	} ,

	onload : null , // return false to abort loading process
	onloadend : null
};

