/**
 * HardLister Secure Client Transport Layer
 * Enforces type contracts and attaches authorization keys before streaming.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HardGoodsItem } from '../types/hardgoods';

const SHARED_SECRET_KEY = 'HL_SECURE_HMAC_PASSTHROUGH_TOKEN';

/**
 * Stage 2 Only: Standard JSON append for metadata.
 * Used for simple text updates or when photos are already present.
 */
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
      item.driveFolderId, // If this is empty, skip Stage 1
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

/**
 * Stage 1 + Stage 2: Dual-Stage Photo Integration.
 * 1. Uploads the image using FormData (Multipart).
 * 2. Uses the returned fileId to perform the final metadata append.
 * 
 * @param item The item record to save.
 * @param imageUri The local URI of the captured image.
 */
export async function uploadPhotoAndCommit(item: HardGoodsItem, imageUri: string) {
  try {
    const targetEndpointUrl = await AsyncStorage.getItem('settings_apps_script_url');
    if (!targetEndpointUrl?.trim()) {
      return { success: false, error: 'Target destination network link is unconfigured.' };
    }

    // --- STAGE 1: Multipart Photo Upload ---
    const formData = new FormData();
    // @ts-ignore - React Native FormData requirements
    formData.append('file', {
      uri: imageUri,
      name: `upload_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });
    formData.append('secretToken', SHARED_SECRET_KEY);
    formData.append('action', 'upload_photo');

    const uploadResponse = await fetch(targetEndpointUrl.trim(), {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Note: Do NOT set 'Content-Type' manually when using FormData; 
        // fetch will automatically set it with the correct boundary.
      },
    } as any);

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadResult.success) {
      return { 
        success: false, 
        error: `Stage 1 (Upload) failed: ${uploadResult.error || 'Unknown upload error'}` 
      };
    }

    // --- STAGE 2: Metadata Append with the new File ID ---
    const fileId = uploadResult.fileId;
    
    // Update the item locally with the new driveFolderId before dispatching
    const enrichedItem: HardGoodsItem = {
      ...item,
      driveFolderId: fileId
    };

    // Reuse the existing logic for stage 2
    return await secureDispatchToCloud(enrichedItem);

  } catch (failEvent) {
    return {
      success: false,
      error: `Dual-stage execution stopped: ${failEvent instanceof Error ? failEvent.message : 'Unknown network failure.'}`
    };
  }
}
