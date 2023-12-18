const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');
const faker = require('faker');
const axiosRetry = require('axios-retry');
axiosRetry(axios, { retries: 3 });

/**
 * fake transactions
 */

// Read the last count of orderId from lastCount.txt
function readLastCount() {
    try {
        const data = fs.readFileSync('lastCount.txt', 'utf8');
        return parseInt(data, 10);
    } catch (error) {
        console.error('Error reading last count:', error);
        return 0;
    }
}
// Write the last count of orderId to lastCount.txt
function writeLastCount(count) {
    try {
        fs.writeFileSync('lastCount.txt', count.toString(), 'utf8');
    } catch (error) {
        console.error('Error writing last count:', error);
    }
}

// Generate a transaction order ID in the specified format (yyyyMMdd + incremental)
function generateOrderID(date, count) {
    const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '');
    const incremental = String(count).padStart(6, '0');
    return formattedDate + incremental;
}

// Generate a random payment account number
function generateAccountNumber() {
    return faker.datatype.number({ min: 100000000000, max: 999999999999 }).toString();
}

// Generate a random merchant name
function generateMerchantName() {
    const merchants = ['BAA', 'BAB', 'BAC', 'BAD', 'BAE'];
    return faker.random.arrayElement(merchants);
}

// Generate a random transaction status (0: pending, 1: success, 2: cancelled)
function generateStatus() {
    return faker.datatype.number({ min: 0, max: 2 });
}

// Generate a random transaction amount as a string
function generateAmount() {
    return faker.datatype.number({ min: 1, max: 1000 }).toFixed(2);
}

// Generate a transaction description based on the in/out value and generated name
function generateDescription(inOut, generatedName) {
    const prefix = inOut === 'in' ? 'Received money from' : 'Sent money to';
    return `${prefix} ${generatedName}`;
}
  
// Generate a single fake transaction object
function generateFakeTransaction(date, lastCount) {
    const OrderId = generateOrderID(date, lastCount);
    const AccountNumber = generateAccountNumber();
    const InOut = faker.random.arrayElement(['in', 'out']);
    const MerchantName = generateMerchantName();
    const CreatedAt = faker.date.past().toISOString();
    const UpdatedAt = faker.date.recent().toISOString();
    const Status = generateStatus();
    const Amount = generateAmount();
    const GeneratedName = faker.name.findName();
    const Description = generateDescription(InOut, GeneratedName);

    return {
        OrderId,
        AccountNumber,
        InOut,
        MerchantName,
        CreatedAt,
        UpdatedAt,
        Status,
        Amount,
        Description,
    };
}
  

// Generate fake transactions and write them to a file
async function generateAndWriteFakeTransactions() {
    let currentDate = new Date();
    const lastCount=readLastCount();
    const transaction = generateFakeTransaction(currentDate, lastCount + 1);
    writeLastCount(lastCount + 1);
    
    fs.readFile('transactions.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading transactions file:', err);
            return;
        }

        let existingTransactions = [];
        if (data) {
            try {
                existingTransactions = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing existing transactions:', parseError);
            }
        }

        const updatedTransactions = [...existingTransactions, transaction];
        const updatedData = JSON.stringify(updatedTransactions, null, 2);

        fs.writeFileSync('transactions.json', updatedData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing transactions file:', err);
            }
        });
    });
    const transactionServiceEndpoint = 'http://transaction-service:3001/transactions';
    axios
        .post(transactionServiceEndpoint, transaction)
        .then(() => {
            console.log('Transaction data sent to Sheet Service successfully');
            })
        .catch((error) => {
            console.error('Error sending transaction data to Transaction Service:', error.message);
        });        
    
}

let intervalId; // Variable to store the interval ID
// Start generating and writing fake transactions every 5 seconds
function startGeneratingTransactions() {
    intervalId = setInterval(() => {
        generateAndWriteFakeTransactions(); // Generate transactions
    }, 5000); // Execute every 5 seconds
}

// Stop generating and writing fake transactions
function stopGeneratingTransactions() {
  clearInterval(intervalId);
}
  

const pageSize = 10; // Number of transactions per page

function getTransactionList(req, res) {
    fs.readFile('transactions.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading transactions file:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      const transactions = JSON.parse(data);
      const page = parseInt(req.query.page, 10) || 1; // Get the page number from the query parameter
  
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTransactions = transactions.slice(startIndex, endIndex);
  
      res.json({
        totalCount: transactions.length,
        currentPage: page,
        pageSize: pageSize,
        transactions: paginatedTransactions,
      });
    });
  }


module.exports = {
    generateAndWriteFakeTransactions,
    getTransactionList,
    startGeneratingTransactions,
    stopGeneratingTransactions
  };
