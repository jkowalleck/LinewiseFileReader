/**
 * line-wise file reader
 *
 * @author jan Kowalleck <jan.kowalleck@googlemail.com>
 */

LinewiseFileReader = function ( bufferSize ) {
	this.reset();

	bufferSize && this.setBufferSize(bufferSize);
};

LinewiseFileReader.prototype = {
	constructor : LinewiseFileReader ,

	reset : function () {
		this.error = null;
		this.lines = [];
	} ,

	lineSplitRE : /\r\n|\n|\r/ ,
	splitLines : function (string) {
		return string.split(this.lineSplitRE);
	} ,

	bufferSize : 1024 * 1024 , // 1 MByte
	setBufferSize : function (bufferSize) {
		this.bufferSize = Math.max(1024, bufferSize);
	} ,

	read : function (file) {
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

		var chunkStart = 0;
		var getProgress = function (type, offset) {
			return new ProgressEvent(type, {
				  lengthComputable : true
				, loaded : chunkStart + ( offset || 0 )
				, total : file_size
				});
		};

		var reader = new FileReader();

		reader.onload = function (load) {
			linewiseFileReader.onload && linewiseFileReader.onload(getProgress("load", load.loaded));
		};

		var lastTrailingOpenLine = "";
		reader.onloadend = function (loadend) {
			// trigger onerror, onabort OR onload
			// and in the end: trigger onloadend

			if ( this.error )
			{
				linewiseFileReader,error = this.error;
				linewiseFileReader.onerror && linewiseFileReader.onerror(getProgress("error"));
			}
			else
			{
				var reader = this;

				var chunkLines = linewiseFileReader.splitLines(lastTrailingOpenLine + reader.result);
				chunkStart += loadend.loaded;

				var notDone = ( chunkStart < file_size );

				if ( notDone )
				{
					lastTrailingOpenLine = chunkLines.pop();
				}
				linewiseFileReader.lines = linewiseFileReader.lines.concat(chunkLines);

				var abort = ( linewiseFileReader.onload && linewiseFileReader.onload(getProgress("load"))===false );
				if ( !abort && notDone )
				{
					linewiseFileReader.readChunk(reader, file, chunkStart);
					return;
				}
			}

			linewiseFileReader.onloadend && linewiseFileReader.onloadend(getProgress("loadend"));
		};

		this.readChunk(reader, file, chunkStart);
	} ,

	readChunk : function (reader, file, start) {
		var blob = file.slice(start, start+this.bufferSize);
		reader.readAsText(blob);
	} ,

	onerror : null ,
	onload : null , // return false to abort loading process
	onloadend : null
};

