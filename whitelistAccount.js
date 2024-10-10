console.clear();
import dotenv from "dotenv";
dotenv.config();

const { AccountId, PrivateKey, Client, Hbar, ContractExecuteTransaction, ContractFunctionParameters } = require("@hashgraph/sdk");

// CONFIGURE ACCOUNTS AND CLIENT, AND GENERATE  accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY_HEX);
const network = process.env.NETWORK;

const client = Client.forNetwork(network).setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(50));
client.setDefaultMaxQueryPayment(new Hbar(1));

// Account ID to whitelist for the contract
const mainnetAccountIdToWhitelist = "0.0.615421"; // Placeholder for the mainnet account ID to whitelist

async function whitelistAccount(mainnetAccountIdToWhitelist) {
	// ========================================================================
	// NEED TO CONFIRM THE CONTRACT ID AND FUNCTION NAME
	// ========================================================================
	const contractId = "0.0.12345"; // Lazy Super Heros Contract ID
	const contractFunction = "whiteList"; // Contract function to call
	const gasLimit = 250000;
	// ========================================================================

	const contractParams = new ContractFunctionParameters().addString(mainnetAccountIdToWhitelist);
	const contractExecuteTx = new ContractExecuteTransaction().setContractId(contractId).setGas(gasLimit).setFunction(contractFunction, contractParams);

	try {
		// Submit the transaction and get the receipt
		const contractExecuteSubmit = await contractExecuteTx.execute(client);
		const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
		const contractExecuteStatus = contractExecuteRx.status;

		// Construct the Hashscan URL
		const hashscanUrl = `https://hashscan.io/testnet/transaction/${contractExecuteSubmit.transactionId}`;

		// Check if the status is SUCCESS
		if (contractExecuteStatus.toString() === "SUCCESS") {
			return {
				status: contractExecuteStatus.toString(),
				url: hashscanUrl,
			};
		} else {
			console.log(`Transaction failed with status: ${contractExecuteStatus}`);
			return {
				status: contractExecuteStatus.toString(),
				message: "Transaction did not succeed",
			};
		}
	} catch (error) {
		console.error("Error executing contract transaction:", error);
		return {
			status: "ERROR",
			message: error.message,
		};
	}
}
whitelistAccount(mainnetAccountIdToWhitelist);
