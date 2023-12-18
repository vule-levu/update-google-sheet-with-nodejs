const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());

// Database to store transactions
const transactions = [];

// Webhook endpoint to receive new transactions from the Bank Service
app.post('/transactions', (req, res) => {
  const transaction = req.body;
  console.log('Received new transaction:', transaction);
  // Store the transaction in the database
  transactions.push(transaction);
  // Send the transaction to the Sheet Service with retry attempts
  sendTransactionToSheet(transaction)
    .then(() => {
      console.log('Transaction sent to Sheet Service');
    })
    .catch(error => {
      console.error('Error sending transaction to Sheet Service:', error.message);
    });
  res.sendStatus(200);
});

// API endpoint to update transaction status to approved
app.put('/transactions/:id/approve', (req, res) => {
  const transactionId = req.params.id;
  const transaction = transactions.find(t => t.OrderId === transactionId);
  if (transaction) {
    transaction.Status = 'approved';
    updateTransactionStatusInSheet(transaction)
      .then(() => {
        console.log('Transaction status updated to "approved" in the spreadsheet');
        res.sendStatus(200);
      })
      .catch(error => {
        console.error('Error updating transaction status in Sheet Service:', error.message);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(404);
  }
});

// Function to update transaction status in the Sheet Service
function updateTransactionStatusInSheet(transaction) {
  const sheetUrl = `http://sheet-service:3002/transactions/${transaction.OrderId}/status`;
  const payload = {
    status: 'approved'
  };
  return axios.put(sheetUrl, payload);
}

// Function to send a transaction to the Sheet Service with retry attempts
function sendTransactionToSheet(transaction, retryAttempts = 3) {
  return new Promise((resolve, reject) => {
    sendTransaction(transaction)
      .then(resolve)
      .catch(error => {
        console.error('Error sending transaction to Sheet Service:', error.message);
        if (retryAttempts > 0) {
          console.log('Retrying transaction (${retryAttempts} attempts left)...');
          setTimeout(() => {
            sendTransactionToSheet(transaction, retryAttempts - 1)
              .then(resolve)
              .catch(reject);
          }, 1000);
        } else {
          reject(new Error('Retry attempts exhausted'));
        }
      });
  });
}

function sendTransaction(transaction) {
  const sheetServiceUrl = 'http://sheet-service:3002'; // Update the URL
  return axios.post(`${sheetServiceUrl}/transactions`, transaction);
}
// Function to send a transaction to the Sheet Service
function sendTransaction(transaction) {
  return axios.post('http://sheet-service:3002/webhook', transaction);
}

app.listen(3001, () => {
  console.log('Transaction Service started on port 3001');
});
