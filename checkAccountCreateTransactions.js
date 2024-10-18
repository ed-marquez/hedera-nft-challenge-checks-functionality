console.clear();
import fetch from "node-fetch";
import fs from "fs";

const network = "testnet";
const accountId = "0.0.2";
const limit = 100; // Number of transactions to fetch per request
const txType = "CRYPTOCREATEACCOUNT"; // Transaction type to filter by
const result = "success"; // Transaction result to filter by
const startTime = toUnixTimestamp(new Date("2024-02-01T18:35:20.6448Z"));

async function fetchAndSaveTransactions(accountId) {
	let url = formUrl(accountId, limit, txType, result, startTime);
	let allTransactions = []; // Array to store all transactions
	let totalTransactions = 0;

	while (url) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Error fetching data: ${response.statusText}`);
			}

			const data = await response.json();
			const transactions = data.transactions;

			// Append transactions to the allTransactions array
			if (transactions && transactions.length > 0) {
				allTransactions = allTransactions.concat(transactions);
				totalTransactions += transactions.length;
			}

			// Get the next page URL if it exists
			const nextLink = data.links?.next;
			url = nextLink ? `https://${network}.mirrornode.hedera.com${nextLink}` : null;
		} catch (error) {
			console.error("Error fetching transactions:", error);
			break; // Exit the loop in case of an error
		}
	}

	// Output the total number of transactions
	console.log(`Total transactions fetched: ${totalTransactions}`);

	// Save the concatenated transactions to a JSON file
	fs.writeFileSync("transactions.json", JSON.stringify(allTransactions, null, 2));
	console.log("All transactions saved to transactions.json");
}

// Call the function
fetchAndSaveTransactions(accountId);

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================

// Convert a date to a Unix timestamp in seconds
function toUnixTimestamp(date) {
	return Math.floor(date.getTime() / 1000);
}

// Form the Hedera Mirror Node URL dynamically
function formUrl(accountId, limit, txType, result, startTime) {
	const baseUrl = `https://${network}.mirrornode.hedera.com/`;
	const endpoint = `api/v1/transactions`;
	const accountQueryParam = `account.id=eq:${accountId}`;
	const limitQueryParam = `limit=${limit}`;
	const txTypeQueryParam = `transactiontype=${txType}`;
	const resultQueryParam = `result=${result}`;
	const timestampQueryParam = `timestamp=gte:${startTime}`;

	const url = `${baseUrl}${endpoint}?${accountQueryParam}&${limitQueryParam}&${txTypeQueryParam}&${resultQueryParam}&${timestampQueryParam}`;
	return url;
}
