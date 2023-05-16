// TODO: Refactor these into moonwall util once they have matured

import { DevModeContext } from "@moonwall/cli";
import { ALITH_ADDRESS, ALITH_PRIVATE_KEY } from "@moonwall/util";
import { TransactionSerializable } from "viem";
import { privateKeyToAccount } from "viem/accounts";

type InputAmountFormats = number | bigint | string | `0x${string}`;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

type TransferOptions =
  | (Omit<TransactionSerializable, "to" | "value"> & {
      privateKey?: `0x${string}`;
    })
  | undefined;

type TransactionOptions =
  | TransactionSerializable & {
      privateKey?: `0x${string}`;
    };

export const TransactionTypes = ["eip1559", "eip2930", "legacy"] as const;
export type TransactionType = (typeof TransactionTypes)[number];

/**
 * createRawTransfer function creates and signs a transfer, as a hex string, that can be submitted to the network via public client."
 *
 * @export
 * @template TOptions - Optional parameters of Viem's TransferOptions
 * @param {DevModeContext} context - the DevModeContext instance
 * @param {`0x${string}`} to - the destination address of the transfer
 * @param {InputAmountFormats} value - the amount to transfer. It accepts different formats including number, bigint, string or hexadecimal strings
 * @param {TOptions} [options] - (optional) additional transaction options
 * @returns {Promise<string>} - the signed raw transaction in hexadecimal string format
 */
export async function createRawTransfer<TOptions extends TransferOptions>(
  context: DevModeContext,
  to: `0x${string}`,
  value: InputAmountFormats,
  options?: TOptions
): Promise<string> {
  const transferAmount = typeof value === "bigint" ? value : BigInt(value);
  return await createRawTransaction(context, { ...options, to, value: transferAmount });
}

/**
 * createRawTransaction function creates and signs a raw transaction, as a hex string, that can be submitted to the network via public client."
 *
 * @export
 * @template TOptions - Optional parameters of Viem's TransactionOptions
 * @param {DevModeContext} context - the DevModeContext instance
 * @param {TOptions} options - transaction options including type, privateKey, value, to, chainId, gasPrice, estimatedGas, accessList, data
 * @returns {Promise<string>} - the signed raw transaction in hexadecimal string format
 */
export async function createRawTransaction<TOptions extends DeepPartial<TransactionOptions>>(
  context: DevModeContext,
  options: TOptions
): Promise<string> {
  const type = !!options && !!options.type ? options.type : "eip1559";
  const privateKey = !!options && !!options.privateKey ? options.privateKey : ALITH_PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  const value = options && options.value ? options.value : 0n;
  const to = options && options.to ? options.to : "0x0000000000000000000000000000000000000000";
  const chainId = await context.viemClient("public").getChainId();
  const txnCount = await context
    .viemClient("public")
    .getTransactionCount({ address: account.address });
  const gasPrice = await context.viemClient("public").getGasPrice();
  const estimatedGas = await context.viemClient("public").estimateGas({ account, to, value });
  const accessList = options && options.accessList ? options.accessList : [];
  const data = options && options.data ? options.data : "0x";

  const txnBlob: TransactionSerializable =
    type === "eip1559"
      ? {
          to,
          value,
          maxFeePerGas: options && options.maxFeePerGas ? options.maxFeePerGas : gasPrice,
          maxPriorityFeePerGas:
            options && options.maxPriorityFeePerGas ? options.maxPriorityFeePerGas : gasPrice,
          gas: options && options.gas ? options.gas : estimatedGas,
          nonce: options && options.nonce ? options.nonce : txnCount,
          data,
          chainId,
          type,
        }
      : type === "legacy"
      ? {
          to,
          value,
          gasPrice: options && options.gasPrice ? options.gasPrice : gasPrice,
          gas: options && options.gas ? options.gas : estimatedGas,
          nonce: options && options.nonce ? options.nonce : txnCount,
          data,
        }
      : type === "eip2930"
      ? {
          to,
          value,
          gasPrice: options && options.gasPrice ? options.gasPrice : gasPrice,
          gas: options && options.gas ? options.gas : estimatedGas,
          nonce: options && options.nonce ? options.nonce : txnCount,
          data,
          chainId,
          type,
        }
      : {};

  if (type !== "legacy" && accessList.length > 0) {
    // @ts-expect-error
    txnBlob["accessList"] = accessList;
  }

  return await account.signTransaction(txnBlob);
}

/**
 * checkBalance function checks the balance of a given account.
 * 
 * @export
 * @param {DevModeContext} context - the DevModeContext instance
 * @param {`0x${string}`} [account=ALITH_ADDRESS] - the account address whose balance is to be checked. If no account is provided, it defaults to ALITH_ADDRESS
 * @returns {Promise<bigint>} - returns a Promise that resolves to the account's balance as a BigInt
 */
export async function checkBalance(
  context: DevModeContext,
  account: `0x${string}` = ALITH_ADDRESS
): Promise<bigint> {
  return await context.viemClient("public").getBalance({ address: account });
}
