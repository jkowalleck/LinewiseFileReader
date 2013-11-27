describe("Basic Test:", function()
{
	"use strict";

	it("splitLines", function()
	{
		var lines_split = ["","Lorem","ipsum","","","dolor","sit",""];
		
		var lines_n  = lines_split.join("\n");
		var lines_r  = lines_split.join("\r")
		var lines_rn = lines_split.join("\r\n")
		
		var reader = new LinewiseFileReader();
		
		expect(reader.splitLines(lines_n)).toEqual(lines_split);
		expect(reader.splitLines(lines_r)).toEqual(lines_split);
		expect(reader.splitLines(lines_rn)).toEqual(lines_split);
	
		// @TODO
	});
		
	// @TODO
});