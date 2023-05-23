import "@moonbeam-network/api-augment";
import { DevModeContext, describeSuite, expect } from "@moonwall/cli";
import { ALITH_ADDRESS, GLMR, alith } from "@moonwall/util";
import { verifyLatestBlockFees } from "../../../helpers/block.js";
import { RELAYCHAIN_ARBITRARY_ADDRESS_1, VESTING_PERIOD } from "../../../helpers/constants.js";
import { calculate_vested_amount, getAccountPayable } from "../../../helpers/crowdloan.js";

describeSuite({
  id: "D0702",
  title: "Crowdloan - claim updates balances",
  foundationMethods: "dev",
  testCases: ({ context, it }) => {
    it({
      id: "T01",
      title: "should show me the money after 5 blocks, after first claim was called",
      test: async function () {
        await context.createBlock(
          context
            .polkadotJs()
            .tx.sudo.sudo(
              context
                .polkadotJs()
                .tx.crowdloanRewards.initializeRewardVec([
                  [RELAYCHAIN_ARBITRARY_ADDRESS_1, alith.address, 3_000_000n * GLMR],
                ])
            )
        );

        const initBlock = await context.polkadotJs().query.crowdloanRewards.initRelayBlock();
        await context.createBlock(
          context
            .polkadotJs()
            .tx.sudo.sudo(
              context
                .polkadotJs()
                .tx.crowdloanRewards.completeInitialization(initBlock.toBigInt() + VESTING_PERIOD)
            )
        );

        const rewardInfo = await getAccountPayable(context, alith.address);
        await context.polkadotJs().tx.crowdloanRewards.claim().signAndSend(alith);
        await context.createBlock();
        await context.createBlock();
        await context.createBlock();

        const claimed = await calculate_vested_amount(
          rewardInfo!.totalReward.toBigInt(),
          rewardInfo!.claimedReward.toBigInt(),
          5n
        );

        await context.polkadotJs().tx.crowdloanRewards.claim().signAndSend(alith);
        await context.createBlock();
        const isPayable4 = await getAccountPayable(context, alith.address);
        expect(isPayable4!.claimedReward.toBigInt()).to.equal(claimed);
      },
    });
  },
});
