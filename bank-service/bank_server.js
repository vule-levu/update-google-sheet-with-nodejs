
const express = require('express');
const bank_service = require('./bank_service.js'); 
const app = express();
const port = 3000;

bank_service.startGeneratingTransactions();
// Define the route handler for GET /transaction-list
app.get('/transaction-list', bank_service.getTransactionList);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle a command to stop generating transactions (e.g., from the console)
process.on('SIGINT', () => {
  bank_service.stopGeneratingTransactions();
  console.log('Generating transactions stopped.');
  process.exit();
});


