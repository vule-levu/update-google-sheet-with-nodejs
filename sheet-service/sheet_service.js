const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');

app.use(bodyParser.json());

// Google Sheets credentials and document ID
const credentials = require('./credentials.json');
const docId = '1kLTKYF9yjrP8QX6UbjMJDHz6N7QXD3UlhbKHiXdJz2Y';

// Initialize the Google Spreadsheet
const doc = new GoogleSpreadsheet(docId);

async function hasHeaders(sheet) {
    try {
        await sheet.loadHeaderRow()
        return true;
    } catch (error) {
        return false;
    }
}

// Load the credentials and authenticate Google Sheets API
async function initializeSheet() {
  try {
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    console.log('Google Sheet is ready');

    
  } catch (error) {
    console.error('Error initializing Google Sheet:', error.message);
  }
}

// Append new incoming transactions to the sheet
async function appendTransactionToSheet(transaction) {
    try {
      if (!transaction) {
        console.log('Transaction data is null. Skipping...');
        return;
      }
      const sheet = doc.sheetsByIndex[0];  
      // Load all rows in the sheet
      await sheet.loadHeaderRow();
      await sheet.loadCells();
  
      const rows = await sheet.getRows({
        offset: 1,  // Skip the header row
      });
      // Check if the transaction already exists in the sheet to avoid duplicates
      
      let duplicateTransaction = false;
      for (const row of rows) {
          const idCellValue = row['OrderId'];
          if (idCellValue && idCellValue.trim() === transaction.OrderId.trim()) {
              duplicateTransaction = true;
              break;
          }
      }
  
      if (duplicateTransaction) {
        console.log('Duplicate transaction. Skipping...');
        return;
      }
  
      // Append the transaction to the sheet
      const newRow = await sheet.addRow({
        OrderId: transaction.OrderId,
        AccountNumber:transaction.AccountNumber,
        InOut: transaction.InOut,
        MerchantName:transaction.MerchantName,
        CreatedAt:transaction.CreatedAt,
        UpdatedAt:transaction.UpdatedAt,
        Status: transaction.Status,
        Amount: transaction.Amount,
        Description: transaction.Description        
      });
  
    } catch (error) {
      console.error('Error appending transaction to the sheet:', error.message);
    }
  }
// API endpoint to update the status of a transaction in the sheet
app.put('/transactions/:id/status', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { status } = req.body;
    const sheet = doc.sheetsByIndex[0];

    // Find the row corresponding to the transaction ID
    const rows = await sheet.getRows();
    const transactionRow = rows.find(row => row.OrderId === transactionId);

    if (transactionRow) {
      // Update the status cell of the transaction
      transactionRow.Status = status;
      await transactionRow.save();
      console.log('Transaction status updated in the sheet');
      res.sendStatus(200);
    } else {
      console.log('Transaction not found in the sheet');
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error updating transaction status in the sheet:', error.message);
    res.sendStatus(500);
  }
});

// Webhook endpoint to receive new transactions from the Transaction Service
let isProcessing=false;
app.post('/webhook', (req, res) => {
  if(isProcessing)
  {
    res.sendStatus(409);
    return;
  }
  isProcessing=true;
  const transaction = req.body;
  console.log('Received new transaction:', transaction);
  appendTransactionToSheet(transaction);

  const delay=2000;
  setTimeout(()=>{
    isProcessing=false;
  },delay);
  res.sendStatus(200);
});

// Initialize the Google Sheet and start the server
initializeSheet().then(() => {
  app.listen(3002, () => {
    console.log('Sheet Service started on port 3002');
  });
});