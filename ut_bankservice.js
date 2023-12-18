const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it, before, after } = require('mocha');
const bankservice = require('./bank_service.js');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Bank Service', () => {
  // Run this block of code before the tests
  before(() => {
    // Create a test transactions-test.json file with initial data
    const initialTransactions = [
        {
          "OrderId": "20231121000195",
          "AccountNumber": "286534519307",
          "InOut": "out",
          "MerchantName": "BAA",
          "CreatedAt": "2022-12-15T07:57:01.228Z",
          "UpdatedAt": "2023-11-20T21:12:36.255Z",
          "Status": 2,
          "Amount": "410.00",
          "Description": "Sent money to Robyn Schmidt"
        },
        {
          "OrderId": "20231121000196",
          "AccountNumber": "348106342391",
          "InOut": "in",
          "MerchantName": "BAD",
          "CreatedAt": "2023-04-26T20:34:03.212Z",
          "UpdatedAt": "2023-11-20T17:23:07.607Z",
          "Status": 0,
          "Amount": "274.00",
          "Description": "Received money from Ms. Dave Leannon"
        },
        {
          "OrderId": "20231121000197",
          "AccountNumber": "971290200692",
          "InOut": "out",
          "MerchantName": "BAC",
          "CreatedAt": "2023-10-02T23:40:52.040Z",
          "UpdatedAt": "2023-11-20T17:18:14.130Z",
          "Status": 2,
          "Amount": "354.00",
          "Description": "Sent money to Terrence Monahan"
        },
        {
          "OrderId": "20231121000198",
          "AccountNumber": "139494460308",
          "InOut": "out",
          "MerchantName": "BAB",
          "CreatedAt": "2023-01-24T00:17:44.874Z",
          "UpdatedAt": "2023-11-20T16:31:24.690Z",
          "Status": 1,
          "Amount": "886.00",
          "Description": "Sent money to Karen Ziemann MD"
        },
        {
          "OrderId": "20231121000199",
          "AccountNumber": "862046339153",
          "InOut": "in",
          "MerchantName": "BAE",
          "CreatedAt": "2023-04-03T00:22:39.706Z",
          "UpdatedAt": "2023-11-21T05:01:42.768Z",
          "Status": 0,
          "Amount": "841.00",
          "Description": "Received money from Lillie Kris"
        },
        {
          "OrderId": "20231121000200",
          "AccountNumber": "864154144516",
          "InOut": "in",
          "MerchantName": "BAE",
          "CreatedAt": "2023-10-07T10:51:35.014Z",
          "UpdatedAt": "2023-11-20T21:43:31.602Z",
          "Status": 0,
          "Amount": "49.00",
          "Description": "Received money from Rachael Vandervort"
        },
        {
          "OrderId": "20231121000201",
          "AccountNumber": "171531683439",
          "InOut": "in",
          "MerchantName": "BAA",
          "CreatedAt": "2023-06-28T21:32:29.527Z",
          "UpdatedAt": "2023-11-21T04:23:02.495Z",
          "Status": 2,
          "Amount": "607.00",
          "Description": "Received money from Marco Hartmann"
        },
        {
          "OrderId": "20231121000202",
          "AccountNumber": "339490271895",
          "InOut": "in",
          "MerchantName": "BAB",
          "CreatedAt": "2023-03-30T11:22:46.435Z",
          "UpdatedAt": "2023-11-21T09:21:01.472Z",
          "Status": 1,
          "Amount": "923.00",
          "Description": "Received money from Paula Funk I"
        },
        {
          "OrderId": "20231121000203",
          "AccountNumber": "325633275415",
          "InOut": "in",
          "MerchantName": "BAA",
          "CreatedAt": "2023-05-16T05:12:51.102Z",
          "UpdatedAt": "2023-11-21T07:41:38.033Z",
          "Status": 2,
          "Amount": "373.00",
          "Description": "Received money from Miguel Nikolaus"
        },
        {
          "OrderId": "20231121000204",
          "AccountNumber": "129407054628",
          "InOut": "out",
          "MerchantName": "BAE",
          "CreatedAt": "2023-07-06T14:08:03.920Z",
          "UpdatedAt": "2023-11-20T22:34:56.154Z",
          "Status": 1,
          "Amount": "932.00",
          "Description": "Sent money to Lee Sipes"
        },
        {
          "OrderId": "20231121000205",
          "AccountNumber": "811111169424",
          "InOut": "in",
          "MerchantName": "BAA",
          "CreatedAt": "2023-08-11T12:29:24.805Z",
          "UpdatedAt": "2023-11-20T16:28:56.566Z",
          "Status": 1,
          "Amount": "825.00",
          "Description": "Received money from Robert Okuneva"
        },
        {
          "OrderId": "20231121000206",
          "AccountNumber": "995871830754",
          "InOut": "out",
          "MerchantName": "BAD",
          "CreatedAt": "2023-01-10T09:53:03.951Z",
          "UpdatedAt": "2023-11-21T08:15:23.287Z",
          "Status": 1,
          "Amount": "192.00",
          "Description": "Sent money to Desiree Rempel"
        },
        {
          "OrderId": "20231121000207",
          "AccountNumber": "369764431472",
          "InOut": "in",
          "MerchantName": "BAE",
          "CreatedAt": "2023-04-30T10:37:21.427Z",
          "UpdatedAt": "2023-11-20T15:18:42.887Z",
          "Status": 0,
          "Amount": "647.00",
          "Description": "Received money from Lynette Reynolds"
        },
        {
          "OrderId": "20231121000208",
          "AccountNumber": "703350010188",
          "InOut": "out",
          "MerchantName": "BAE",
          "CreatedAt": "2023-05-11T09:28:23.834Z",
          "UpdatedAt": "2023-11-20T12:04:57.905Z",
          "Status": 1,
          "Amount": "130.00",
          "Description": "Sent money to Kelvin Bartoletti"
        },
        {
          "OrderId": "20231121000209",
          "AccountNumber": "637743495148",
          "InOut": "in",
          "MerchantName": "BAE",
          "CreatedAt": "2023-03-29T22:42:59.068Z",
          "UpdatedAt": "2023-11-20T17:54:22.720Z",
          "Status": 2,
          "Amount": "114.00",
          "Description": "Received money from Beth Mosciski"
        },
        {
          "OrderId": "20231121000210",
          "AccountNumber": "414796611736",
          "InOut": "in",
          "MerchantName": "BAE",
          "CreatedAt": "2023-08-08T23:34:07.673Z",
          "UpdatedAt": "2023-11-21T09:43:51.419Z",
          "Status": 1,
          "Amount": "483.00",
          "Description": "Received money from Debra Huels"
        },
        {
          "OrderId": "20231121000211",
          "AccountNumber": "435617903573",
          "InOut": "in",
          "MerchantName": "BAE",
          "CreatedAt": "2023-01-20T06:20:33.960Z",
          "UpdatedAt": "2023-11-21T00:38:49.162Z",
          "Status": 1,
          "Amount": "2.00",
          "Description": "Received money from Felicia Borer"
        },
        {
          "OrderId": "20231121000212",
          "AccountNumber": "647067484632",
          "InOut": "in",
          "MerchantName": "BAD",
          "CreatedAt": "2023-03-30T21:15:03.075Z",
          "UpdatedAt": "2023-11-21T01:35:46.088Z",
          "Status": 0,
          "Amount": "479.00",
          "Description": "Received money from Shelia Flatley"
        },
        {
          "OrderId": "20231121000213",
          "AccountNumber": "553009749064",
          "InOut": "out",
          "MerchantName": "BAA",
          "CreatedAt": "2023-02-18T05:05:01.409Z",
          "UpdatedAt": "2023-11-21T05:44:49.034Z",
          "Status": 1,
          "Amount": "948.00",
          "Description": "Sent money to Amy Ledner"
        }
      ];
    fs.writeFileSync('transactions-test.json', JSON.stringify(initialTransactions));
  });

  // Run this block of code after the tests
  after(() => {
    // Clean up the test transactions-test.json file
    // fs.unlinkSync('transactions-test.json');
  });

  describe('generateAndWriteFakeTransactions', () => {
    it('should generate and write a fake transaction to transactions-test.json', async () => {
      await bankservice.generateAndWriteFakeTransactions();

      // Read the transactions-test.json file
      const data = fs.readFileSync('transactions-test.json', 'utf8');
      const transactions = JSON.parse(data);

      // Verify that a transaction was written to the file
      expect(transactions).to.have.lengthOf(19);
      expect(transactions[0]).to.have.property('OrderId');
      expect(transactions[0]).to.have.property('AccountNumber');
      // Add more assertions as needed
    });
  });
  
  // Add more test cases as needed
});