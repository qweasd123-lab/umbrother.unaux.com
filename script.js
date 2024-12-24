let itemNumber = 0;
let grandTotal = 0;

// Set display size based on user selection
function setDisplaySize(size) {
    document.body.className = size;
}

// Add item to the table
function addItem() {
    const itemName = document.getElementById('itemName').value;
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value);
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const currencySymbol = document.getElementById('currency').value; // Get selected currency

    if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice)) {
        alert('Please fill all fields correctly.');
        return;
    }

    const itemTotal = itemQuantity * itemPrice;
    grandTotal += itemTotal;

    const tableBody = document.getElementById('itemTableBody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${++itemNumber}</td>
        <td>${itemName}</td>
        <td>${itemQuantity}</td>
        <td>${currencySymbol} ${itemPrice.toFixed(2)}</td>
        <td>${currencySymbol} ${itemTotal.toFixed(2)}</td>
        <td>
            <button onclick="editItem(this)">Edit</button>
            <button onclick="deleteItem(this)">Delete</button>
        </td>
    `;

    tableBody.appendChild(row);

    document.getElementById('fullTotal').textContent = `${currencySymbol} ${grandTotal.toFixed(2)}`;

    // Clear inputs and focus on the first field
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemName').focus();
}

// Edit the item
function editItem(button) {
    const row = button.parentElement.parentElement; // Get the row of the clicked button
    const cells = row.getElementsByTagName('td');
    const itemName = cells[1].textContent;
    const itemQuantity = parseInt(cells[2].textContent);
    const itemPrice = parseFloat(cells[3].textContent.replace(/[^\d.-]/g, '')); // Remove currency symbols

    // Set the values into the input fields
    document.getElementById('itemName').value = itemName;
    document.getElementById('itemQuantity').value = itemQuantity;
    document.getElementById('itemPrice').value = itemPrice;

    // Remove the row from the table for re-editing
    row.remove();
    grandTotal -= itemQuantity * itemPrice;
    document.getElementById('fullTotal').textContent = `${document.getElementById('currency').value} ${grandTotal.toFixed(2)}`;
}

// Delete the item
function deleteItem(button) {
    const row = button.parentElement.parentElement; // Get the row of the clicked button
    const cells = row.getElementsByTagName('td');
    const itemQuantity = parseInt(cells[2].textContent);
    const itemPrice = parseFloat(cells[3].textContent.replace(/[^\d.-]/g, '')); // Remove currency symbols

    // Subtract the item total from grandTotal
    grandTotal -= itemQuantity * itemPrice;
    document.getElementById('fullTotal').textContent = `${document.getElementById('currency').value} ${grandTotal.toFixed(2)}`;

    // Remove the row from the table
    row.remove();
}

// Handle the Enter key press to move to the next field or add item
function handleKeyPress(event, nextFieldId) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission on Enter key
        const nextField = document.getElementById(nextFieldId);

        if (nextFieldId === 'addItem') {
            addItem(); // Call addItem if it's the last field
        } else {
            nextField.focus(); // Move to the next field
        }
    }
}

// Download the table content as a PDF
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Get selected currency
    const currencySymbol = document.getElementById('currency').value;

    // Add logo to the PDF with margins
    const logoUrl = 'Logoo.png'; // Assuming the logo is located in the same directory as the script
    const logoWidth = 30; // Set the width of the logo
    const logoHeight = 30; // Set the height of the logo

    // Set margins for the top, left, and right
    const marginLeft = 10; // Left margin (from the left side of the page)
    const marginTop = 5; // Top margin (from the top of the page)
    const marginRight = 5; // Right margin

    // Adding the logo with margins, positioning it with a left margin and top margin
    pdf.addImage(logoUrl, 'PNG', marginLeft, marginTop, logoWidth, logoHeight);

    // Add a title to the PDF with margins
    const title = "BILL REPORT";
    const pageWidth = pdf.internal.pageSize.width; // Full width of the page
    const titleWidth = pdf.getStringUnitWidth(title) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2; // Calculate the x position to center the title

    // Set font style for the title
    pdf.setFont('Algerian', 'bold'); // Apply Helvetica font and make it bold
    pdf.setFontSize(22); // Increase font size for better visibility

    // Set the title font color to #003FF7
    pdf.setTextColor(0, 63, 247); // RGB values for #003FF7

    // Set the margin from the top (add more space if needed)
    const marginTopForTitle = marginTop + 15; // You can increase this value for more space
    pdf.text(title, titleX, marginTopForTitle); // Adjust the y position to leave space after the logo

    // Extract table headers
    const headers = ["No.", "Item Name", "Quantity", "Price", "Total"];
    const rows = [];

    // Extract table rows from the HTML table
    const tableRows = document.querySelectorAll("#itemTableBody tr");
    tableRows.forEach((row) => {
        const cols = row.querySelectorAll("td");
        const rowData = [];
        cols.forEach((col) => {
            rowData.push(col.textContent.trim());
        });
        rows.push(rowData);
    });

    // Add the Full Total row with currency
    rows.push(["", "", "", "Full Total", `${currencySymbol} ${grandTotal.toFixed(2)}`]);

    // Use jsPDF autotable to create a table in the PDF
    pdf.autoTable({
        startY: marginTopForTitle + 20, // Start the table below the title and provide extra margin
        head: [headers],
        body: rows,
        didParseCell: (data) => {
            if (data.row.index === rows.length - 1) { // Check if it's the "Full Total" row
                data.cell.styles.fontStyle = 'bold'; // Make the text bold
                data.cell.styles.fontSize = 13; // Set font size for the "Full Total" row
            }
        },
    });

    // Add the signature label on the right side with margin
    const signatureY = pdf.internal.pageSize.height - 30; // Position near the bottom of the page
    const signatureText = "Signature";

    // Define the margin space from the right edge
    const rightMargin = 20;  // Adjust the value to set how far from the right edge you want the signature to appear

    // Calculate the position of the "Signature" label on the right, considering the margin
    const signatureWidth = pdf.getStringUnitWidth(signatureText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    const signatureX = pageWidth - rightMargin - signatureWidth; // Right-aligned with margin

    pdf.setFontSize(12);
    pdf.text(signatureText, signatureX, signatureY); // Position "Signature:" on the right

    // Draw the line under the "Signature:" label
    const lineStartX = signatureX + signatureWidth + 5; // Start of the line (right of "Signature:")
    const lineEndX = pdf.internal.pageSize.width - rightMargin; // End of the line (right margin)
    const lineY = signatureY + 5; // Position of the line below the "Signature:" text
    pdf.line(lineStartX, lineY, lineEndX, lineY); // Draw the line

    // Save the generated PDF
    pdf.save("billing_output.pdf");
}

// Reset the form and table
function resetForm() {
    // Clear all input fields
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemPrice').value = '';

    // Reset the grand total
    grandTotal = 0;
    document.getElementById('fullTotal').textContent = `${document.getElementById('currency').value} ${grandTotal.toFixed(2)}`;

    // Clear the item table
    const tableBody = document.getElementById('itemTableBody');
    tableBody.innerHTML = '';  // Remove all rows in the table

    // Reset item number
    itemNumber = 0;

    // Focus on the first field
    document.getElementById('itemName').focus();
}
