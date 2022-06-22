initSidebarItems({"enum":[["UtilityAvailableCalls",""]],"struct":[["AbsoluteAndRelativeReserve","This struct offers uses RelativeReserveProvider to output relative views of multilocations However, additionally accepts a MultiLocation that aims at representing the chain part (parent: 1, Parachain(paraId)) of the absolute representation of our chain. If a token reserve matches against this absolute view, we return  Some(MultiLocation::here()) This helps users by preventing errors when they try to transfer a token through xtokens to our chain (either inserting the relative or the absolute value)."],["Account20Hash",""],["AccountIdToMultiLocation","Instructs how to convert a 20 byte accountId into a MultiLocation"],["AllowDescendOriginFromLocal","Allows execution from `origin` if it is contained in `T` (i.e. `T::Contains(origin)`) taking payments into account and if it starts with DescendOrigin."],["AsAssetType","Converter struct implementing `AssetIdConversion` converting a numeric asset ID (must be `TryFrom/TryInto<u128>`) into a MultiLocation Value and vice versa through an intermediate generic type AssetType. The trait bounds enforce is that the AssetTypeGetter trait is also implemented for AssetIdInfoGetter"],["FirstAssetTrader",""],["SignedToAccountId20",""],["XcmFeesToAccount","XCM fee depositor to which we implement the TakeRevenue trait It receives a fungibles::Mutate implemented argument, a matcher to convert MultiAsset into AssetId and amount, and the fee receiver account"]],"trait":[["AccountIdToCurrencyId","This trait ensure we can convert AccountIds to CurrencyIds We will require Runtime to have this trait implemented"],["AssetTypeGetter",""],["UnitsToWeightRatio",""],["UtilityEncodeCall",""],["XcmTransact",""]]});