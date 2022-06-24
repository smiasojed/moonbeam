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
// along with Moonbeam.  If not, see <http://www.gnu.org/licenses/>.
//! VRF Runtime API

sp_api::decl_runtime_apis! {
	pub trait VrfRuntimeApi {
		fn get_relay_slot_number() -> sp_consensus_babe::Slot;
		fn get_relay_storage_root() -> Block::Hash;
		fn vrf_key_lookup(nimbus_id: nimbus_primitives::NimbusId) -> Option<crate::VrfId>;
	}
}