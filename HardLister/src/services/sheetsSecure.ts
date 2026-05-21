/**
 * HardLister Secure Client Transport Layer
 * Enforces type contracts and attaches authorization keys before streaming.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HardGoodsItem } from '../types/hardgoods';

const SHARED_SECRET_KEY = 'HL_SECURE_HMAC_PASSTHROUGH_TOKEN';

export async function secureDispatchToCloud(item: HardGoodsItem) {
  try {
    const targetEndpointUrl = await AsyncStorage.getItem('settings_apps_script_url');
    if (!targetEndpointUrl?.trim()) {
      return { success: false, error: 'Target destination network link is unconfigured.' };
    }

    // Construct flat-row array sequentially matching the server schema order
    const sequentialRowData = [
      item.itemNumber,
      item.title,
      item.brand,
      item.modelNumber,
      item.serialNumber,
      item.condition,
      item.saleStatus,
      item.listedPrice, // Index 7 (Validated strictly by backend engine)
      item.marketplace,
      item.driveFolderId,
      item.inspectionNotes,
      item.dateListed
    ];

    const response = await fetch(targetEndpointUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append',
        secretToken: SHARED_SECRET_KEY, // Verification handshake check
        data: sequentialRowData
      })
    });

    const result = await response.json();
    return response.ok && result.success
      ? { success: true, rowId: result.rowId }
      : { success: false, error: result.error || 'The transmission envelope was rejected by host.' };

  } catch (failEvent) {
    return {
      success: false,
      error: `Transport execution stopped: ${failEvent instanceof Error ? failEvent.message : 'Unknown network failure.'}`
    };
  }
}