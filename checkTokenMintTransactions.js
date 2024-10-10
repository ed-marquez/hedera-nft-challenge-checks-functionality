console.clear();
import fetch from "node-fetch";

const accountId = "0.0.2212547";
const limit = 100; // Number of transactions to fetch per request
const txType = "TOKENMINT"; // Transaction type to filter by
const result = "success"; // Transaction result to filter by
const startTime = toUnixTimestamp(new Date("2024-06-01"));
// const currentTime = toUnixTimestamp(new Date());

// Function to check if there's a successful token mint transaction within the time window
async function checkTokenMintTransactions(accountId) {
	let url = formUrl(accountId, limit, txType, result, startTime);

	while (url) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Error fetching data: ${response.statusText}`);
			}

			const data = await response.json();
			const transactions = data.transactions;

			// Check if there's at least one successful transaction of type TOKENMINT
			if (transactions && transactions.length > 0) {
				return true;
			}

			// Get the next page if it exists
			const nextLink = data.links?.next;
			url = nextLink ? `https://testnet.mirrornode.hedera.com${nextLink}` : null;
		} catch (error) {
			console.error("Error fetching transactions:", error);
			return false; // Return false in case of any errors
		}
	}

	return false; // If no successful transactions are found after paginating
}

// Call the function and print the result
checkTokenMintTransactions(accountId).then((result) => {
	console.log(result); // true if there is a transaction, false otherwise
});

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================

// Convert a date to a Unix timestamp in seconds
function toUnixTimestamp(date) {
	return Math.floor(date.getTime() / 1000);
}

// Form the Hedera Mirror Node URL dynamically
function formUrl(accountId, limit, txType, result, startTime) {
	const baseUrl = "https://testnet.mirrornode.hedera.com/";
	const endpoint = "api/v1/transactions";
	const accountQueryParam = `account.id=eq:${accountId}`;
	const limitQueryParam = `limit=${limit}`;
	const txTypeQueryParam = `transactiontype=${txType}`;
	const resultQueryParam = `result=${result}`;
	const timestampQueryParam = `timestamp=gte:${startTime}`;

	const url = `${baseUrl}${endpoint}?${accountQueryParam}&${limitQueryParam}&${txTypeQueryParam}&${resultQueryParam}&${timestampQueryParam}`;
	return url;
}
