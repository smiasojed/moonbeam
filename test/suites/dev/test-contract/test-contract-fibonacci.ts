import "@moonbeam-network/api-augment";
import {
  TransactionTypes,
  describeSuite,
  expect,
  deployCreateCompiledContract,
} from "@moonwall/cli";

describeSuite({
  id: "D0606",
  title: "Fibonacci",
  foundationMethods: "dev",
  testCases: ({ context, it, log }) => {
    for (const txnType of TransactionTypes) {
      it({
        id: `T0${TransactionTypes.indexOf(txnType) + 1}`,
        title: "should be able to call fibonacci",
        test: async function () {
          //TODO: replace this with txnType deploy fn when available
          const { contract } = await deployCreateCompiledContract(context, "Fibonacci");

          expect(await contract.read.fib2([0])).toBe(0n);
          expect(await contract.read.fib2([1])).toBe(1n);
          expect(await contract.read.fib2([2])).toBe(1n);
          expect(await contract.read.fib2([3])).toBe(2n);
          expect(await contract.read.fib2([4])).toBe(3n);
          expect(await contract.read.fib2([5])).toBe(5n);
          expect(await contract.read.fib2([20])).toBe(6765n);

          // the largest Fib number supportable by a uint256 is 370.
          // actual value:
          // 94611056096305838013295371573764256526437182762229865607320618320601813254535
          expect(await contract.read.fib2([370])).toBe(
            94611056096305838013295371573764256526437182762229865607320618320601813254535n
          );
        },
      });

      it({
        id: `T0${TransactionTypes.indexOf(txnType) + 4}`,
        title: "should be able to call fibonacci[370] in txn",
        test: async function () {
          const { abi, contractAddress } = await deployCreateCompiledContract(context, "Fibonacci");

          const hash = await context.viem("wallet").writeContract({
            abi,
            address: contractAddress,
            functionName: "fib2",
            args: [370],
            value: 0n,
          });

          await context.createBlock();
          const receipt = await context.viem("public").getTransactionReceipt({ hash });
          expect(receipt.status).toBe("success");
        },
      });
    }
  },
});
