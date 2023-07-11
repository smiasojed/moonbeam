import "@moonbeam-network/api-augment";
import { DevModeContext, describeSuite, expect, fetchCompiledContract } from "@moonwall/cli";
import {
  ALITH_ADDRESS,
  BALTATHAR_ADDRESS,
  BALTATHAR_PRIVATE_KEY,
  BALTATHAR_SESSION_ADDRESS,
  CONTRACT_PROXY_TYPE_AUTHOR_MAPPING,
  PRECOMPILE_AUTHOR_MAPPING_ADDRESS,
} from "@moonwall/util";
import { encodeFunctionData } from "viem";
import { expectEVMResult } from "../../../helpers/eth-transactions.js";

export async function getMappingInfo(
  context: DevModeContext,
  authorId: string
): Promise<void | { account: string; deposit: BigInt }> {
  const mapping = await context.polkadotJs().query.authorMapping.mappingWithDeposit(authorId);
  if (mapping.isSome) {
    return {
      account: mapping.unwrap().account.toString(),
      deposit: mapping.unwrap().deposit.toBigInt(),
    };
  }
}

describeSuite({
  id: "D2540",
  title: "Proxy : Author Mapping - simple association",
  foundationMethods: "dev",
  testCases: ({ context, it, log }) => {
    it({
      id: "T01",
      title: "should succeed in adding an association",
      test: async function () {
        const rawTx = await context.writePrecompile!({
          precompileName: "Proxy",
          functionName: "addProxy",
          args: [BALTATHAR_ADDRESS, CONTRACT_PROXY_TYPE_AUTHOR_MAPPING, 0],
          rawTxOnly: true,
        });

        const { result } = await context.createBlock(rawTx);
        expectEVMResult(result!.events, "Succeed");

        const { abi } = fetchCompiledContract("AuthorMapping");
        const rawTx2 = await context.writePrecompile!({
          precompileName: "Proxy",
          functionName: "proxy",
          args: [
            ALITH_ADDRESS,
            PRECOMPILE_AUTHOR_MAPPING_ADDRESS,
            encodeFunctionData({
              abi,
              functionName: "addAssociation",
              args: [BALTATHAR_SESSION_ADDRESS],
            }),
          ],
          privateKey: BALTATHAR_PRIVATE_KEY,
          rawTxOnly: true,
        });
        const { result: result2 } = await context.createBlock(rawTx2);

        expectEVMResult(result2!.events, "Succeed");

        expect((await getMappingInfo(context, BALTATHAR_SESSION_ADDRESS))!.account).toBe(
          ALITH_ADDRESS
        );
      },
    });
  },
});
