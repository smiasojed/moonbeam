import "@moonbeam-network/api-augment";
import { describeSuite, expect } from "@moonwall/cli";
import { BALTATHAR_SESSION_ADDRESS, CHARLETH_SESSION_ADDRESS, alith } from "@moonwall/util";
import { getMappingInfo } from "../../../helpers/common.js";

describeSuite({
  id: "D0214",
  title: "Author Mapping - unregistered cannot rotate",
  foundationMethods: "dev",
  testCases: ({ context, log, it }) => {
    it({
      id: "T01",
      title: "should fail rotating account ids if not registered",
      test: async function () {
        await context.createBlock(
          context
            .polkadotJs()
            .tx.authorMapping.updateAssociation(
              BALTATHAR_SESSION_ADDRESS,
              CHARLETH_SESSION_ADDRESS
            ),
          { allowFailures: true, signer: alith }
        );
        expect(await getMappingInfo(context, BALTATHAR_SESSION_ADDRESS)).to.eq(null);
        expect(await getMappingInfo(context, CHARLETH_SESSION_ADDRESS)).to.eq(null);

        await context.createBlock();
      },
    });
  },
});
