const fs = require("fs"); // A Node.js module for interacting with the file system (reading and writing files).
const cheerio = require("cheerio"); // A lightweight library for parsing and manipulating HTML, similar to jQuery.
const readline = require("readline"); // Needed for prompting for a file path. Provides an interface for reading data from a readable stream (e.g., process.stdin).

// Create an interface to read input from the terminal
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
  });

// prompt for a file path.
rl.question("Type an HTML file path: ", (filePath) => {

	try {
		// Load the HTML file
		const html = fs.readFileSync(filePath, "utf8"); // Reads the HTML file example.html in UTF-8 encoding. Replace with your HTML file path
		const $ = cheerio.load(html); // Loads the HTML content into Cheerio, which allows you to query and manipulate the HTML structure.

		// Select the table
		// $("table"): Selects the <table> element in the HTML file. You can modify the selector (e.g., $("table.my-table")) to target specific tables.
		const table = $("table"); // Adjust selector if needed

		// Make sure all cells have double quotes and inner quotes are escaped.
		const escapeAndQuote = (value) => `"${value.replace(/"/g, '""')}"`;

		let csv = ""; // init csv string.

		// Iterate through table rows
		// Finds all table rows (<tr> elements) inside the selected table.
		table.find("tr").each((_, row) => {
			// Loops through each row of the table.
			// "_" is a placeholder for unused variables.
		   const cells = $(row) // $(row): Wraps the current row in a Cheerio object to manipulate it.
		   	.find("th, td") // Selects all header (<th>) and data (<td>) cells in the current row.
			.map((_, cell) => {
				const cellValue = $(cell).text().trim(); // Extracts and trims the text from each cell.
				return escapeAndQuote(cellValue)
			})
			.get(); // Converts the Cheerio collection to a standard JavaScript array.
		   csv += cells.join(",") + "\n"; // Joins all cell values with commas, creating a single CSV row. Appends the CSV row to the csv string, followed by a newline.
		});

		// Add BOM to the beginning of the CSV content
		const bom = "\uFEFF"; // BOM character for UTF-8
		// \uFEFF is a special Unicode character that signifies the file is encoded in UTF-8.
		// Write CSV to a file
		fs.writeFileSync("output.csv", bom + csv); // Writes the accumulated csv string to a file, with BOM, named output.csv.
		console.log("CSV file has been saved as output.csv");
	} catch (error) {
		// You have to provide (error) variable in catch to properly handle an error.
		console.error("Error: Something went wrong. Check the file path.", error.message);
	} finally {
		rl.close(); // Close the readline interface
	}
});