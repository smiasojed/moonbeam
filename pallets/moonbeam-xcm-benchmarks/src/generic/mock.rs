// Copyright 2019-2022 PureStake Inc.
// This file is part of Moonbeam.

// Moonbeam is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Moonbeam is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
//! A mock runtime for XCM benchmarking.

use crate::{generic, mock::*, *};
use frame_benchmarking::BenchmarkError;
use frame_support::{
	parameter_types,
	traits::{Everything, OriginTrait},
};
use parity_scale_codec::Decode;
use sp_core::H256;
use sp_runtime::{
	testing::Header,
	traits::{BlakeTwo256, IdentityLookup, TrailingZeroInput},
	BuildStorage,
};
use xcm::latest::prelude::*;
use xcm_builder::{
	test_utils::{
		Assets, TestAssetExchanger, TestAssetLocker, TestAssetTrap, TestSubscriptionService,
		TestUniversalAliases,
	},
	AllowUnpaidExecutionFrom,
};
use xcm_executor::traits::ConvertOrigin;

type UncheckedExtrinsic = frame_system::mocking::MockUncheckedExtrinsic<Test>;
type Block = frame_system::mocking::MockBlock<Test>;

frame_support::construct_runtime!(
	pub enum Test where
		Block = Block,
		NodeBlock = Block,
		UncheckedExtrinsic = UncheckedExtrinsic,
	{
		System: frame_system::{Pallet, Call, Config, Storage, Event<T>},
		PolkadotXcmBenchmarks: pallet_xcm_benchmarks::generic::{Pallet},
		XcmGenericBenchmarks: generic::{Pallet},
	}
);

parameter_types! {
	pub const BlockHashCount: u64 = 250;
	pub UniversalLocation: InteriorMultiLocation = Here;
}

impl frame_system::Config for Test {
	type BaseCallFilter = Everything;
	type BlockWeights = ();
	type BlockLength = ();
	type DbWeight = ();
	type RuntimeOrigin = RuntimeOrigin;
	type Index = u64;
	type BlockNumber = u64;
	type Hash = H256;
	type RuntimeCall = RuntimeCall;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type RuntimeEvent = RuntimeEvent;
	type BlockHashCount = BlockHashCount;
	type Version = ();
	type PalletInfo = PalletInfo;
	type AccountData = pallet_balances::AccountData<u64>;
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
	type SS58Prefix = ();
	type OnSetCode = ();
	type MaxConsumers = frame_support::traits::ConstU32<16>;
}

/// The benchmarks in this pallet should never need an asset transactor to begin with.
pub struct NoAssetTransactor;
impl xcm_executor::traits::TransactAsset for NoAssetTransactor {
	fn deposit_asset(_: &MultiAsset, _: &MultiLocation, _: &XcmContext) -> Result<(), XcmError> {
		unreachable!();
	}

	fn withdraw_asset(
		_: &MultiAsset,
		_: &MultiLocation,
		_: Option<&XcmContext>,
	) -> Result<Assets, XcmError> {
		unreachable!();
	}
}

parameter_types! {
	pub const MaxInstructions: u32 = 100;
	pub const MaxAssetsIntoHolding: u32 = 64;
}

pub struct XcmConfig;
impl xcm_executor::Config for XcmConfig {
	type RuntimeCall = RuntimeCall;
	type XcmSender = DevNull;
	type AssetTransactor = NoAssetTransactor;
	type OriginConverter = AlwaysSignedByDefault<RuntimeOrigin>;
	type IsReserve = AllAssetLocationsPass;
	type IsTeleporter = ();
	type UniversalLocation = UniversalLocation;
	type Barrier = AllowUnpaidExecutionFrom<Everything>;
	type Weigher = xcm_builder::FixedWeightBounds<UnitWeightCost, RuntimeCall, MaxInstructions>;
	type Trader = xcm_builder::FixedRateOfFungible<WeightPrice, ()>;
	type ResponseHandler = DevNull;
	type AssetTrap = TestAssetTrap;
	type AssetLocker = TestAssetLocker;
	type AssetExchanger = TestAssetExchanger;
	type AssetClaims = TestAssetTrap;
	type SubscriptionService = TestSubscriptionService;
	type PalletInstancesInfo = AllPalletsWithSystem;
	type MaxAssetsIntoHolding = MaxAssetsIntoHolding;
	type FeeManager = ();
	// No bridges yet...
	type MessageExporter = ();
	type UniversalAliases = TestUniversalAliases;
	type CallDispatcher = RuntimeCall;
	type SafeCallFilter = Everything;
	type AssetIsBurnable = Everything;
}

impl pallet_xcm_benchmarks::Config for Test {
	type XcmConfig = XcmConfig;
	type AccountIdConverter = AccountIdConverter;
	fn valid_destination() -> Result<MultiLocation, BenchmarkError> {
		let valid_destination: MultiLocation = Junction::AccountId32 {
			network: None,
			id: [0u8; 32],
		}
		.into();

		Ok(valid_destination)
	}
	fn worst_case_holding(_depositable_count: u32) -> MultiAssets {
		crate::mock::mock_worst_case_holding()
	}
}

impl pallet_xcm_benchmarks::generic::Config for Test {
	type RuntimeCall = RuntimeCall;

	fn worst_case_response() -> (u64, Response) {
		let assets: MultiAssets = (Concrete(Here.into()), 100).into();
		(0, Response::Assets(assets))
	}

	fn worst_case_asset_exchange() -> Result<(MultiAssets, MultiAssets), BenchmarkError> {
		Err(BenchmarkError::Skip)
	}

	fn universal_alias() -> Result<Junction, BenchmarkError> {
		Err(BenchmarkError::Skip)
	}

	fn transact_origin_and_runtime_call() -> Result<(MultiLocation, RuntimeCall), BenchmarkError> {
		Ok((
			Default::default(),
			frame_system::Call::remark_with_event { remark: vec![] }.into(),
		))
	}

	fn subscribe_origin() -> Result<MultiLocation, BenchmarkError> {
		Ok(Default::default())
	}

	fn claimable_asset() -> Result<(MultiLocation, MultiLocation, MultiAssets), BenchmarkError> {
		let assets: MultiAssets = (Concrete(Here.into()), 100).into();
		let ticket = MultiLocation {
			parents: 0,
			interior: X1(GeneralIndex(0)),
		};
		Ok((Default::default(), ticket, assets))
	}

	fn unlockable_asset() -> Result<(MultiLocation, MultiLocation, MultiAsset), BenchmarkError> {
		Err(BenchmarkError::Skip)
	}
}

impl generic::Config for Test {}
impl Config for Test {}

pub fn new_test_ext() -> sp_io::TestExternalities {
	let t = GenesisConfig {
		..Default::default()
	}
	.build_storage()
	.unwrap();
	t.into()
}

pub struct AlwaysSignedByDefault<Origin>(core::marker::PhantomData<Origin>);
impl<Origin> ConvertOrigin<Origin> for AlwaysSignedByDefault<Origin>
where
	Origin: OriginTrait,
	<Origin as OriginTrait>::AccountId: Decode,
{
	fn convert_origin(
		_origin: impl Into<MultiLocation>,
		_kind: OriginKind,
	) -> Result<Origin, MultiLocation> {
		Ok(Origin::signed(
			<Origin as OriginTrait>::AccountId::decode(&mut TrailingZeroInput::zeroes())
				.expect("infinite length input; no invalid inputs for type; qed"),
		))
	}
}
