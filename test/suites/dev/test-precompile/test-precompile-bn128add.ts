import "@moonbeam-network/api-augment";
import { deployCreateCompiledContract, describeSuite } from "@moonwall/cli";
import { createRawTransaction } from "@moonwall/util";
import { encodeFunctionData } from "viem";
import { expectEVMResult } from "../../../helpers/eth-transactions.js";

describeSuite({
  id: "D2523",
  title: "Precompiles - bn128add",
  foundationMethods: "dev",
  testCases: ({ context, it, log }) => {
    it({
      id: "T01",
      title: "should be accessible from a smart contract",
      test: async function () {
        const { abi, contractAddress } = await deployCreateCompiledContract(
          context,
          "HasherChecker"
        );

        const { result } = await context.createBlock(
          createRawTransaction(context, {
            to: contractAddress,
            data: encodeFunctionData({
              abi,
              functionName: "bn128AdditionCheck",
            }),
          })
        );

        expectEVMResult(result!.events, "Succeed");
      },
    });
  },
});
