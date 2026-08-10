/**
 * HardLister Polymorphic Form Interface Router
 * Highly optimized, specification-driven assets and gear validation with interactive photo slots,
 * dynamic terminology state routing, AI research services, and easy CSV/Markdown manifest export.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share
} from 'react-native';
import { HardGoodsCategory, HardGoodsItem } from '../types/hardgoods';

// Seed lists for consistent terminology dropdown options
const INITIAL_CONDITIONS = ['New', 'Used', 'Damaged'];
const INITIAL_OPERATIONAL_STATES = ['Working', 'Damaged/Sold for Parts'];
const INITIAL_COMPONENT_STATES = ['Complete', 'Missing parts', 'Includes cables'];
const INITIAL_PACKAGING_METHODS = ['Original Box', 'Additional shipping packaging'];

export default function DynamicFormRouter() {
  const [selectedCategory, setSelectedCategory] = useState<HardGoodsCategory>('Camera Gear');

  // Form State
  const [formData, setFormData] = useState<Partial<HardGoodsItem>>({
    itemNumber: 'YYHL' + Math.floor(100 + Math.random() * 900),
    title: '',
    brand: '',
    modelNumber: '',
    serialNumber: '',
    primaryCategory: 'Camera Gear',
    condition: 'Used',
    saleStatus: 'Available',
    listedPrice: 0,
    marketplace: 'eBay',
    driveFolderId: 'HL-DRIVE-' + Math.floor(1000 + Math.random() * 9000),
    inspectionNotes: '',
    dateListed: new Date().toISOString().split('T')[0],

    // Photos state (URIs or simulator states)
    photos: {},

    // Pricing & Logistics
    researchNewPrice: 0,
    researchUsedPrice: 0,
    shippingWeight: '',
    shippingDimensions: '',
    descriptionVerbiage: '',

    // Five-part Segment States
    stateItemName: '',
    stateCondition: 'Used',
    stateOperationalState: 'Working',
    stateComponentState: 'Complete',
    statePackagingMethod: 'Original Box',
    consolidatedStateString: '',
    numericStateCode: '',
    noReturnsPolicy: false
  });

  // Dynamic lists with Add+ custom additions
  const [categories, setCategories] = useState<string[]>(['Tools', 'Appliances', 'Electronics', 'Camera Gear']);
  const [conditions, setConditions] = useState<string[]>(INITIAL_CONDITIONS);
  const [operationalStates, setOperationalStates] = useState<string[]>(INITIAL_OPERATIONAL_STATES);
  const [componentStates, setComponentStates] = useState<string[]>(INITIAL_COMPONENT_STATES);
  const [packagingMethods, setPackagingMethods] = useState<string[]>(INITIAL_PACKAGING_METHODS);

  // Dynamic Add+ custom input toggles/values
  const [newCategoryVal, setNewCategoryVal] = useState('');
  const [newConditionVal, setNewConditionVal] = useState('');
  const [newOpStateVal, setNewOpStateVal] = useState('');
  const [newCompStateVal, setNewCompStateVal] = useState('');
  const [newPkgMethodVal, setNewPkgMethodVal] = useState('');

  // AI research mockup state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  // High contrast visual toggle for Tag/Model Photo
  const [tagPhotoHighContrast, setTagPhotoHighContrast] = useState(false);

  // Notification helper
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const updateField = (key: keyof HardGoodsItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updatePhoto = (slot: keyof NonNullable<HardGoodsItem['photos']>, uri: string | undefined) => {
    setFormData(prev => {
      const photos = { ...prev.photos, [slot]: uri };
      return { ...prev, photos };
    });
  };

  // 1. Build Numeric Abbreviation Map Indexing
  const getIndexCode = (val: string, list: string[]): number => {
    const idx = list.indexOf(val);
    return idx !== -1 ? idx + 1 : list.length + 1; // 1-based indexing
  };

  // 2. Automatically compute and update state combinations & returns policies
  useEffect(() => {
    const itemName = formData.stateItemName || formData.title || formData.modelNumber || 'UNKNOWN-ITEM';
    const cond = formData.stateCondition || 'Used';
    const opState = formData.stateOperationalState || 'Working';
    const compState = formData.stateComponentState || 'Complete';
    const pkgMethod = formData.statePackagingMethod || 'Original Box';

    const consolidated = `${itemName}:${cond}:${opState}:${compState}:${pkgMethod}`;

    // Calculate dynamic numeric representation
    const codeCond = getIndexCode(cond, conditions);
    const codeOp = getIndexCode(opState, operationalStates);
    const codeComp = getIndexCode(compState, componentStates);
    const codePkg = getIndexCode(pkgMethod, packagingMethods);
    const numericCode = `${itemName}:${codeCond}:${codeOp}:${codeComp}:${codePkg}`;

    // Automatic No Returns Policy check
    const isDamaged = cond.toLowerCase().includes('damaged') ||
                      opState.toLowerCase().includes('damaged') ||
                      opState.toLowerCase().includes('parts') ||
                      cond.toLowerCase().includes('parts');

    setFormData(prev => ({
      ...prev,
      consolidatedStateString: consolidated,
      numericStateCode: numericCode,
      noReturnsPolicy: isDamaged
    }));
  }, [
    formData.stateItemName,
    formData.title,
    formData.modelNumber,
    formData.stateCondition,
    formData.stateOperationalState,
    formData.stateComponentState,
    formData.statePackagingMethod,
    conditions,
    operationalStates,
    componentStates,
    packagingMethods
  ]);

  // Photo Naming Convention (Passed along during export)
  const getPhotoFilename = (slotName: string) => {
    const cleanItemName = (formData.stateItemName || formData.title || formData.modelNumber || 'ITEM')
      .replace(/[^a-zA-Z0-9]/g, '-');
    const cleanCond = (formData.stateCondition || 'Used').replace(/[^a-zA-Z0-9]/g, '-');
    return `${cleanItemName}_${cleanCond}_${slotName}.jpg`.toLowerCase();
  };

  // Add Custom Options "add+" Actions
  const addNewCategory = () => {
    if (newCategoryVal.trim() && !categories.includes(newCategoryVal.trim())) {
      setCategories([...categories, newCategoryVal.trim()]);
      setSelectedCategory(newCategoryVal.trim());
      updateField('primaryCategory', newCategoryVal.trim());
      setNewCategoryVal('');
      showBanner(`Added new category: "${newCategoryVal.trim()}"`);
    }
  };

  const addNewCondition = () => {
    if (newConditionVal.trim() && !conditions.includes(newConditionVal.trim())) {
      setConditions([...conditions, newConditionVal.trim()]);
      updateField('stateCondition', newConditionVal.trim());
      setNewConditionVal('');
      showBanner(`Added custom condition: "${newConditionVal.trim()}"`);
    }
  };

  const addNewOpState = () => {
    if (newOpStateVal.trim() && !operationalStates.includes(newOpStateVal.trim())) {
      setOperationalStates([...operationalStates, newOpStateVal.trim()]);
      updateField('stateOperationalState', newOpStateVal.trim());
      setNewOpStateVal('');
      showBanner(`Added custom operational state: "${newOpStateVal.trim()}"`);
    }
  };

  const addNewCompState = () => {
    if (newCompStateVal.trim() && !componentStates.includes(newCompStateVal.trim())) {
      setComponentStates([...componentStates, newCompStateVal.trim()]);
      updateField('stateComponentState', newCompStateVal.trim());
      setNewCompStateVal('');
      showBanner(`Added custom component state: "${newCompStateVal.trim()}"`);
    }
  };

  const addNewPkgMethod = () => {
    if (newPkgMethodVal.trim() && !packagingMethods.includes(newPkgMethodVal.trim())) {
      setPackagingMethods([...packagingMethods, newPkgMethodVal.trim()]);
      updateField('statePackagingMethod', newPkgMethodVal.trim());
      setNewPkgMethodVal('');
      showBanner(`Added custom packaging method: "${newPkgMethodVal.trim()}"`);
    }
  };

  // Trigger Mock AI Service pricing/specification gathering
  const triggerAiScan = () => {
    if (!formData.modelNumber || !formData.brand) {
      showBanner('Error: Please input a Brand and Model/Part Number first!');
      return;
    }

    setAiLoading(true);
    setTimeout(() => {
      // Intelligently generate mock specs based on brand/model
      const brand = formData.brand || 'Generic';
      const model = formData.modelNumber || 'X100';
      const category = selectedCategory;

      let estNew = 499;
      let estUsed = 320;
      let estWeight = '3 lbs 2 oz';
      let estDims = '10 x 7 x 4 inches';
      let bulletSpecs = `- Brand Authentic standard ${brand} specification\n- Serial verified physical architecture`;

      if (category === 'Camera Gear') {
        estNew = 1299;
        estUsed = 850;
        estWeight = '1 lb 12 oz';
        estDims = '6 x 4 x 4 inches';
        bulletSpecs = `- Premium High-Precision Optical Element\n- Native mount alignment with ${model} configuration\n- Dust-sealed chassis structure`;
      } else if (category === 'Electronics') {
        estNew = 999;
        estUsed = 620;
        estWeight = '2 lbs 14 oz';
        estDims = '12.5 x 8.8 x 0.6 inches';
        bulletSpecs = `- Solid-state storage acceleration architecture\n- Maximum operational processing cycles\n- Activation unlocked and verified clean`;
      } else if (category === 'Tools') {
        estNew = 229;
        estUsed = 140;
        estWeight = '6 lbs 8 oz';
        estDims = '14 x 9 x 5 inches';
        bulletSpecs = `- Heavy-duty industrial torque rating\n- Universal battery ecosystem interoperable\n- Shock-absorbent safety grip casing`;
      }

      const generatedVerbiage = `PROPOSED LISTING DESCRIPTION:\n=================================\n\nIntroducing the ${brand} ${model} in ${formData.stateCondition || 'Used'} condition.\n\nTECHNICAL SPECS:\n${bulletSpecs}\n\nThis item has been fully serial-authenticated and inspected. Ready for rapid dispatch. Packaged meticulously inside: ${formData.statePackagingMethod}.`;

      setAiData({
        newPrice: estNew,
        usedPrice: estUsed,
        weight: estWeight,
        dims: estDims,
        description: generatedVerbiage
      });
      setAiLoading(false);
      showBanner('AI Pricing and Spec data successfully analyzed!');
    }, 1500);
  };

  const loadAiData = () => {
    if (aiData) {
      setFormData(prev => ({
        ...prev,
        researchNewPrice: aiData.newPrice,
        researchUsedPrice: aiData.usedPrice,
        shippingWeight: aiData.weight,
        shippingDimensions: aiData.dims,
        descriptionVerbiage: aiData.description
      }));
      showBanner('AI researched pricing, logistics, and description loaded into Form!');
    }
  };

  // Export Manifest Strings (CSV & Markdown formats)
  const markdownManifest = useMemo(() => {
    return `
# HardLister Gear Manifest: ${formData.title || 'Untitled Listing'}

## Universal Manifest Identity
- **SKU/Item Number:** ${formData.itemNumber}
- **Brand:** ${formData.brand || 'N/A'}
- **Model / Part Number:** ${formData.modelNumber || 'N/A'}
- **Serial Number:** ${formData.serialNumber || 'N/A'}
- **Category:** ${selectedCategory}
- **Marketplace Destination:** ${formData.marketplace}
- **Target Listed Price:** $${formData.listedPrice}
- **Date Audited:** ${formData.dateListed}

## Condition & Logistical Verification State
- **State Terminal String:** \`${formData.consolidatedStateString}\`
- **Abbreviated Numeric Code:** \`${formData.numericStateCode}\`
- **Returns Status Allowed:** ${formData.noReturnsPolicy ? '❌ NO RETURNS PERMITTED (Damaged / Parts)' : '✅ Standard Returns Allowed'}

## Interactive Assets Naming Convention Matrix
- **Front Photo:** \`${formData.photos?.front ? getPhotoFilename('front') : 'Missing'}\`
- **Back Photo:** \`${formData.photos?.back ? getPhotoFilename('back') : 'Missing'}\`
- **Left Side Photo:** \`${formData.photos?.lSide ? getPhotoFilename('l-side') : 'Not Taken'}\`
- **Right Side Photo:** \`${formData.photos?.rSide ? getPhotoFilename('r-side') : 'Not Taken'}\`
- **Top Photo:** \`${formData.photos?.top ? getPhotoFilename('top') : 'Not Taken'}\`
- **Bottom Photo:** \`${formData.photos?.bottom ? getPhotoFilename('bottom') : 'Not Taken'}\`
- **Tag/Model Plate (Contrast Adjusted):** \`${formData.photos?.tagModel ? getPhotoFilename('tag-model') : 'Missing'}\`

## Pricing & Shipping Logistics Research
- **Research Estimated New Price:** $${formData.researchNewPrice}
- **Research Estimated Used Price:** $${formData.researchUsedPrice}
- **Shipping Weight Block:** ${formData.shippingWeight || 'N/A'}
- **Shipping Dimensions Package Block:** ${formData.shippingDimensions || 'N/A'}

## Copy/Paste Description Verbiage
\`\`\`
${formData.descriptionVerbiage || 'No description written.'}
\`\`\`

## Inspector Physical Diagnostics / Notes
> ${formData.inspectionNotes || 'No custom inspector diagnostics recorded.'}
    `.trim();
  }, [formData, selectedCategory]);

  const csvManifest = useMemo(() => {
    const headers = [
      'Item Number', 'Title', 'Brand', 'Model Number', 'Serial Number', 'Category',
      'Listed Price', 'Consolidated State String', 'Numeric State Code', 'No Returns Policy',
      'Research New Price', 'Research UsedPrice', 'Shipping Weight', 'Shipping Dimensions',
      'Front Photo Name', 'Back Photo Name', 'Tag Photo Name'
    ].join(',');

    const values = [
      `"${formData.itemNumber}"`,
      `"${formData.title || ''}"`,
      `"${formData.brand || ''}"`,
      `"${formData.modelNumber || ''}"`,
      `"${formData.serialNumber || ''}"`,
      `"${selectedCategory}"`,
      formData.listedPrice,
      `"${formData.consolidatedStateString}"`,
      `"${formData.numericStateCode}"`,
      formData.noReturnsPolicy ? 'YES' : 'NO',
      formData.researchNewPrice,
      formData.researchUsedPrice,
      `"${formData.shippingWeight || ''}"`,
      `"${formData.shippingDimensions || ''}"`,
      `"${formData.photos?.front ? getPhotoFilename('front') : ''}"`,
      `"${formData.photos?.back ? getPhotoFilename('back') : ''}"`,
      `"${formData.photos?.tagModel ? getPhotoFilename('tag-model') : ''}"`
    ].join(',');

    return `${headers}\n${values}`;
  }, [formData, selectedCategory]);

  const shareMarkdown = async () => {
    try {
      await Share.share({
        message: markdownManifest,
        title: 'Share HardLister Markdown Manifest'
      });
    } catch (e) {
      showBanner('Failed to share markdown manifest');
    }
  };

  const shareCsv = async () => {
    try {
      await Share.share({
        message: csvManifest,
        title: 'Share HardLister CSV Export'
      });
    } catch (e) {
      showBanner('Failed to share CSV');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>HardLister High-Precision Manifest</Text>

      {/* Persistent Status Banner messages */}
      {bannerMessage && (
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerText}>{bannerMessage}</Text>
        </View>
      )}

      {/* Universal Base Form Info */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Universal Identity Info</Text>

        <Text style={styles.label}>Manifest Item # / SKU</Text>
        <TextInput
          style={styles.input}
          value={formData.itemNumber}
          onChangeText={(val) => updateField('itemNumber', val)}
        />

        <Text style={styles.label}>Listing Item Title *</Text>
        <TextInput 
          style={styles.input}
          placeholder="e.g., Sony Alpha A7R V Camera Body"
          placeholderTextColor="#4b5563"
          value={formData.title}
          onChangeText={(val) => {
            updateField('title', val);
            updateField('stateItemName', val);
          }}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              placeholder="Sony, DeWalt, etc"
              placeholderTextColor="#4b5563"
              value={formData.brand}
              onChangeText={(val) => updateField('brand', val)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Model / Part *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., ILCE-7RM5"
              placeholderTextColor="#4b5563"
              value={formData.modelNumber}
              onChangeText={(val) => updateField('modelNumber', val)}
            />
          </View>
        </View>

        <Text style={styles.label}>Serial Number *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Mandatory serial number tracking"
          placeholderTextColor="#4b5563"
          value={formData.serialNumber}
          onChangeText={(val) => updateField('serialNumber', val)}
        />

        <Text style={styles.label}>Select Category *</Text>
        <View style={styles.categoryBadgeRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBadge, selectedCategory === cat && styles.categoryBadgeSelected]}
              onPress={() => {
                setSelectedCategory(cat);
                updateField('primaryCategory', cat);
              }}
            >
              <Text style={[styles.categoryBadgeText, selectedCategory === cat && styles.categoryBadgeTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Category dynamic Option */}
        <View style={styles.addCustomOptionRow}>
          <TextInput
            style={[styles.input, { flex: 1, height: 38, paddingVertical: 6 }]}
            placeholder="add+ new category"
            placeholderTextColor="#4b5563"
            value={newCategoryVal}
            onChangeText={setNewCategoryVal}
          />
          <TouchableOpacity style={styles.addCustomBtn} onPress={addNewCategory}>
            <Text style={styles.addCustomBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Five-Part Consistent State Segment Form */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.sectionHeader}>Durable State & Terminology Mapping</Text>
        <Text style={styles.helperText}>
          Enforces standard, consistent listing terms. Format: ITEM NAME:CONDITION:OPERATIONAL STATE:COMPONENT STATE:PACKAGING METHOD
        </Text>

        {/* Part 1: Item Name (Derived or Manual) */}
        <Text style={styles.label}>1. Item Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Sony-A7R-V"
          value={formData.stateItemName}
          onChangeText={(val) => updateField('stateItemName', val)}
        />

        {/* Part 2: Condition */}
        <Text style={styles.label}>2. Condition Dropdown</Text>
        <View style={styles.customPickerRow}>
          {conditions.map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[styles.pickerOption, formData.stateCondition === cond && styles.pickerOptionSelected]}
              onPress={() => updateField('stateCondition', cond)}
            >
              <Text style={[styles.pickerOptionText, formData.stateCondition === cond && styles.pickerOptionTextSelected]}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addCustomOptionRow}>
          <TextInput
            style={[styles.input, { flex: 1, height: 38, paddingVertical: 6 }]}
            placeholder="add+ custom condition"
            placeholderTextColor="#4b5563"
            value={newConditionVal}
            onChangeText={setNewConditionVal}
          />
          <TouchableOpacity style={styles.addCustomBtn} onPress={addNewCondition}>
            <Text style={styles.addCustomBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Part 3: Operational State */}
        <Text style={styles.label}>3. Operational State (Review Date Status)</Text>
        <View style={styles.customPickerRow}>
          {operationalStates.map((op) => (
            <TouchableOpacity
              key={op}
              style={[styles.pickerOption, formData.stateOperationalState === op && styles.pickerOptionSelected]}
              onPress={() => updateField('stateOperationalState', op)}
            >
              <Text style={[styles.pickerOptionText, formData.stateOperationalState === op && styles.pickerOptionTextSelected]}>
                {op}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addCustomOptionRow}>
          <TextInput
            style={[styles.input, { flex: 1, height: 38, paddingVertical: 6 }]}
            placeholder="add+ operational status"
            placeholderTextColor="#4b5563"
            value={newOpStateVal}
            onChangeText={setNewOpStateVal}
          />
          <TouchableOpacity style={styles.addCustomBtn} onPress={addNewOpState}>
            <Text style={styles.addCustomBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Part 4: Component State */}
        <Text style={styles.label}>4. Component State (Cables, accessories, missing parts?)</Text>
        <View style={styles.customPickerRow}>
          {componentStates.map((comp) => (
            <TouchableOpacity
              key={comp}
              style={[styles.pickerOption, formData.stateComponentState === comp && styles.pickerOptionSelected]}
              onPress={() => updateField('stateComponentState', comp)}
            >
              <Text style={[styles.pickerOptionText, formData.stateComponentState === comp && styles.pickerOptionTextSelected]}>
                {comp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addCustomOptionRow}>
          <TextInput
            style={[styles.input, { flex: 1, height: 38, paddingVertical: 6 }]}
            placeholder="add+ component state"
            placeholderTextColor="#4b5563"
            value={newCompStateVal}
            onChangeText={setNewCompStateVal}
          />
          <TouchableOpacity style={styles.addCustomBtn} onPress={addNewCompState}>
            <Text style={styles.addCustomBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Part 5: Packaging Method */}
        <Text style={styles.label}>5. Packaging Method (Original or additional shipping box?)</Text>
        <View style={styles.customPickerRow}>
          {packagingMethods.map((pkg) => (
            <TouchableOpacity
              key={pkg}
              style={[styles.pickerOption, formData.statePackagingMethod === pkg && styles.pickerOptionSelected]}
              onPress={() => updateField('statePackagingMethod', pkg)}
            >
              <Text style={[styles.pickerOptionText, formData.statePackagingMethod === pkg && styles.pickerOptionTextSelected]}>
                {pkg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addCustomOptionRow}>
          <TextInput
            style={[styles.input, { flex: 1, height: 38, paddingVertical: 6 }]}
            placeholder="add+ packaging method"
            placeholderTextColor="#4b5563"
            value={newPkgMethodVal}
            onChangeText={setNewPkgMethodVal}
          />
          <TouchableOpacity style={styles.addCustomBtn} onPress={addNewPkgMethod}>
            <Text style={styles.addCustomBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Consolidated Terminal Outputs */}
        <View style={styles.outputBox}>
          <Text style={styles.outputLabel}>CONSOLIDATED STATE STRING:</Text>
          <Text style={styles.outputText} numberOfLines={2}>{formData.consolidatedStateString}</Text>

          <Text style={[styles.outputLabel, { marginTop: 10 }]}>NUMERIC REPRESENTATION CODE:</Text>
          <Text style={styles.outputText} numberOfLines={2}>{formData.numericStateCode}</Text>
          <Text style={styles.legendText}>
            Legend Index Mapping: Condition ({conditions.indexOf(formData.stateCondition || 'Used') + 1}),
            Operational ({operationalStates.indexOf(formData.stateOperationalState || 'Working') + 1}),
            Component ({componentStates.indexOf(formData.stateComponentState || 'Complete') + 1}),
            Packaging ({packagingMethods.indexOf(formData.statePackagingMethod || 'Original Box') + 1})
          </Text>
        </View>

        {/* No Returns Policy Banner indicator if Damaged */}
        {formData.noReturnsPolicy ? (
          <View style={styles.noReturnBanner}>
            <Text style={styles.noReturnBannerTitle}>⚠️ STRICT NO RETURNS ENFORCED</Text>
            <Text style={styles.noReturnBannerBody}>
              This item state specifies parts, damages, or status unknown condition. The listing policy automatically locks to: "No Returns".
            </Text>
          </View>
        ) : (
          <View style={[styles.noReturnBanner, { backgroundColor: '#1b4332', borderColor: '#2d6a4f' }]}>
            <Text style={[styles.noReturnBannerTitle, { color: '#52b788' }]}>✅ STANDARD RETURNS POLICIES APPLY</Text>
            <Text style={styles.noReturnBannerBody}>
              This item is marked as functioning safely. Standard listing return policies are enabled.
            </Text>
          </View>
        )}
      </View>

      {/* Interactive Photo Requirements Slots Section */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.sectionHeader}>Interactive Asset Verification Slots</Text>
        <Text style={styles.helperText}>
          Enforces high physical presentation criteria. Required photos must have valid uploads or captures before terminal sync.
        </Text>

        {/* Photos Matrix List */}
        {[
          { key: 'front', label: 'Front Photo', required: true, desc: 'Primary thumbnail presentation angle.' },
          { key: 'back', label: 'Back Photo', required: true, desc: 'Show physical ports, power lines, labels cleanly.' },
          { key: 'lSide', label: 'L Side Photo', required: false, optSymbol: '*', desc: 'Optional: Useful for structural wear checks.' },
          { key: 'rSide', label: 'R Side Photo', required: false, optSymbol: '*', desc: 'Optional: Useful for physical port inspections.' },
          { key: 'top', label: 'Top Photo', required: false, optSymbol: '**', desc: 'Highly Optional: Captures user control surface plates.' },
          { key: 'bottom', label: 'Bottom Photo', required: false, optSymbol: '**', desc: 'Highly Optional: Captures serial label and base pads.' },
          { key: 'tagModel', label: 'Tag / Model Photo', required: false, optSymbol: '#', desc: 'Authenticates serial string plates cleanly.', isTag: true }
        ].map((slot) => {
          const hasPhoto = !!formData.photos?.[slot.key as keyof NonNullable<HardGoodsItem['photos']>];
          const filename = getPhotoFilename(slot.key);

          return (
            <View key={slot.key} style={styles.photoSlotCard}>
              <View style={styles.photoSlotHeader}>
                <View style={styles.row}>
                  <Text style={styles.photoSlotLabel}>
                    {slot.label} {slot.optSymbol || ''} {slot.required ? '(REQUIRED)' : ''}
                  </Text>
                  {hasPhoto && <Text style={styles.checkIcon}>✅ Captured</Text>}
                </View>
                <Text style={styles.photoSlotDesc}>{slot.desc}</Text>
              </View>

              {slot.isTag && (
                <View style={styles.highContrastControls}>
                  <Text style={[styles.legendText, { color: '#38bdf8', marginBottom: 6 }]}>
                    💡 Tip: Contrast adjust on physical capture is highly recommended for scanning faded plates.
                  </Text>
                  <TouchableOpacity
                    style={[styles.contrastBtn, tagPhotoHighContrast && styles.contrastBtnActive]}
                    onPress={() => setTagPhotoHighContrast(!tagPhotoHighContrast)}
                  >
                    <Text style={styles.contrastBtnText}>
                      {tagPhotoHighContrast ? '🔵 High Contrast Active (+200% Clarity)' : '⚪ Click to Apply Contrast Boost'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Photo Preview & Capture Block */}
              {hasPhoto ? (
                <View style={[styles.photoPreviewBox, slot.isTag && tagPhotoHighContrast && styles.highContrastPreview]}>
                  <Text style={styles.photoUriText}>📷 Attached File: {filename}</Text>
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => updatePhoto(slot.key as keyof NonNullable<HardGoodsItem['photos']>, undefined)}
                  >
                    <Text style={styles.removePhotoBtnText}>Delete Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoPlaceholderBox}>
                  <Text style={styles.photoPlaceholderText}>No image file attached</Text>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.photoActionBtn}
                      onPress={() => updatePhoto(slot.key as keyof NonNullable<HardGoodsItem['photos']>, `file://hardlister/simulated_cam_${slot.key}.jpg`)}
                    >
                      <Text style={styles.photoActionBtnText}>📸 Simulate Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.photoActionBtn, { backgroundColor: '#334155' }]}
                      onPress={() => updatePhoto(slot.key as keyof NonNullable<HardGoodsItem['photos']>, `file://hardlister/uploaded_file_${slot.key}.jpg`)}
                    >
                      <Text style={styles.photoActionBtnText}>📁 Upload Slot</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* AI Spec Scan and Auto-Pricing Agent */}
      <View style={[styles.card, { marginTop: 16, borderColor: '#4f6ef7', borderWidth: 1 }]}>
        <View style={styles.row}>
          <Text style={[styles.sectionHeader, { color: '#6366f1' }]}>🤖 AI Agent Pricing & Specs Assistant</Text>
        </View>
        <Text style={styles.helperText}>
          Retrieves current Web/eBay/Amazon estimated new/used pricing metrics, shipping dimensions, and custom technical specification copy text automatically.
        </Text>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4f6ef7', marginTop: 10 }]}
          onPress={triggerAiScan}
          disabled={aiLoading}
        >
          {aiLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Query AI Pricing & Logistics Matrix</Text>
          )}
        </TouchableOpacity>

        {aiData && (
          <View style={styles.aiResultContainer}>
            <Text style={styles.aiHeader}>AI DISCOVERED LOGISTICS MAP:</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.aiLabel}>Estimated Brand-New Price</Text>
                <Text style={styles.aiValue}>${aiData.newPrice}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiLabel}>Estimated Used Price</Text>
                <Text style={styles.aiValue}>${aiData.usedPrice}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.aiLabel}>Est Shipping Weight</Text>
                <Text style={styles.aiValue}>{aiData.weight}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiLabel}>Est Dimensions Envelope</Text>
                <Text style={styles.aiValue}>{aiData.dims}</Text>
              </View>
            </View>

            <Text style={styles.aiLabel}>Draft Technical Listing Copy</Text>
            <Text style={styles.aiDescriptionText} numberOfLines={6}>{aiData.description}</Text>

            <TouchableOpacity style={styles.loadAiBtn} onPress={loadAiData}>
              <Text style={styles.loadAiBtnText}>Apply AI Research to Live Manifest Form</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Form Logistical Pricing & Specifications Inputs */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.sectionHeader}>Logistics, Pricing & Copywriting</Text>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Researched New Price ($)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 1299"
              placeholderTextColor="#4b5563"
              value={formData.researchNewPrice ? String(formData.researchNewPrice) : ''}
              onChangeText={(val) => updateField('researchNewPrice', parseFloat(val) || 0)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Researched Used Price ($)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 850"
              placeholderTextColor="#4b5563"
              value={formData.researchUsedPrice ? String(formData.researchUsedPrice) : ''}
              onChangeText={(val) => updateField('researchUsedPrice', parseFloat(val) || 0)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Est Shipping Weight</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 4 lbs 12 oz"
              placeholderTextColor="#4b5563"
              value={formData.shippingWeight}
              onChangeText={(val) => updateField('shippingWeight', val)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Est Package Dimensions</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12 x 10 x 6 in"
              placeholderTextColor="#4b5563"
              value={formData.shippingDimensions}
              onChangeText={(val) => updateField('shippingDimensions', val)}
            />
          </View>
        </View>

        <Text style={styles.label}>Listing Description / Copywriting Copy *</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          multiline
          numberOfLines={6}
          placeholder="Detailed verbiage describing the specific condition, accessories, and performance indices..."
          placeholderTextColor="#4b5563"
          value={formData.descriptionVerbiage}
          onChangeText={(val) => updateField('descriptionVerbiage', val)}
        />
      </View>

      {/* Conditional Sub-Category Elements (Kept intact from original architecture) */}
      {selectedCategory === 'Camera Gear' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Gold-Standard Optics Calibration</Text>
          <Text style={styles.label}>Shutter Count / Run-Hours</Text>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g., 14205"
            placeholderTextColor="#4b5563"
            onChangeText={(val) => updateField('shutterCountOrHours', parseInt(val) || 0)}
          />
        </View>
      )}

      {selectedCategory === 'Electronics' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Computing Hardware Environment</Text>
          <Text style={styles.label}>Storage / Memory Profile</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g., 32GB RAM / 1TB SSD"
            placeholderTextColor="#4b5563"
            onChangeText={(val) => updateField('storageRamProfile', val)}
          />
        </View>
      )}

      {/* Manifest Data Importer/Exporter Clipboard Transfer Area */}
      <View style={[styles.card, { marginTop: 16, backgroundColor: '#13151f', borderColor: '#475569' }]}>
        <Text style={styles.sectionHeader}>📋 Manifest Clipboard Export Terminal</Text>
        <Text style={styles.helperText}>
          Transfer listing info seamlessly to high-speed spreadsheet rows or Markdown platforms.
        </Text>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#10b981' }]} onPress={shareMarkdown}>
            <Text style={styles.exportBtnText}>Share Markdown (.MD)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#0ea5e9' }]} onPress={shareCsv}>
            <Text style={styles.exportBtnText}>Share Tabular CSV (.CSV)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Copy Preview Box (Markdown / Details):</Text>
        <TextInput
          style={[styles.input, { height: 180, fontSize: 11, fontFamily: 'monospace', backgroundColor: '#090a0f', color: '#a5b4fc' }]}
          multiline
          editable={false}
          value={markdownManifest}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#e8eaf6', marginBottom: 12, textAlign: 'center' },
  card: { backgroundColor: '#1a1d27', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2a2d3a' },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 4, marginTop: 10, fontWeight: '600' },
  helperText: { color: '#64748b', fontSize: 11, marginBottom: 8, lineHeight: 14 },
  input: { backgroundColor: '#0f1117', color: '#e8eaf6', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2a2d3a', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  categoryBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 8 },
  categoryBadge: { backgroundColor: '#111420', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#1e293b' },
  categoryBadgeSelected: { backgroundColor: '#4f6ef7', borderColor: '#6366f1' },
  categoryBadgeText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  categoryBadgeTextSelected: { color: '#ffffff', fontWeight: '700' },

  addCustomOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 10 },
  addCustomBtn: { backgroundColor: '#3b82f6', height: 38, width: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addCustomBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  customPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  pickerOption: { backgroundColor: '#111420', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#1e293b' },
  pickerOptionSelected: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  pickerOptionText: { color: '#94a3b8', fontSize: 11 },
  pickerOptionTextSelected: { color: '#000000', fontWeight: '700' },

  outputBox: { backgroundColor: '#10121a', padding: 12, borderRadius: 8, marginTop: 14, borderWidth: 1, borderColor: '#1e293b' },
  outputLabel: { color: '#a855f7', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  outputText: { color: '#e8eaf6', fontSize: 12, fontWeight: '700', marginTop: 2, fontFamily: 'monospace' },
  legendText: { color: '#64748b', fontSize: 10, marginTop: 4, lineHeight: 12 },

  noReturnBanner: { backgroundColor: '#450a0a', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#7f1d1d', marginTop: 12 },
  noReturnBannerTitle: { color: '#f87171', fontWeight: '800', fontSize: 12, marginBottom: 2 },
  noReturnBannerBody: { color: '#fca5a5', fontSize: 11, lineHeight: 14 },

  bannerContainer: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#2563eb' },
  bannerText: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // Interactive Photo UI
  photoSlotCard: { backgroundColor: '#12141c', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginTop: 10 },
  photoSlotHeader: { marginBottom: 6 },
  photoSlotLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  photoSlotDesc: { color: '#64748b', fontSize: 10, marginTop: 1 },
  checkIcon: { color: '#10b981', fontSize: 11, fontWeight: '700', marginLeft: 'auto' },

  highContrastControls: { backgroundColor: '#090a0f', padding: 8, borderRadius: 6, marginVertical: 6, borderWidth: 1, borderColor: '#0ea5e9' },
  contrastBtn: { backgroundColor: '#1e293b', paddingVertical: 6, borderRadius: 4, alignItems: 'center' },
  contrastBtnActive: { backgroundColor: '#0284c7' },
  contrastBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  photoPreviewBox: { backgroundColor: '#1e293b', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  highContrastPreview: { borderColor: '#38bdf8', borderWidth: 2, backgroundColor: '#0f172a' },
  photoUriText: { color: '#f1f5f9', fontSize: 10, fontFamily: 'monospace', marginBottom: 6 },
  removePhotoBtn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
  removePhotoBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  photoPlaceholderBox: { backgroundColor: '#090a0f', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  photoPlaceholderText: { color: '#475569', fontSize: 11, marginBottom: 8 },
  photoActionBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 6 },
  photoActionBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // AI Spec Scan Result UI
  aiResultContainer: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#334155' },
  aiHeader: { color: '#38bdf8', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  aiLabel: { color: '#94a3b8', fontSize: 10, marginTop: 6 },
  aiValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '700' },
  aiDescriptionText: { color: '#cbd5e1', fontSize: 11, backgroundColor: '#020617', padding: 8, borderRadius: 6, marginTop: 4, fontFamily: 'monospace' },
  loadAiBtn: { backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  loadAiBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  actionButton: { padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  exportBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  exportBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  sectionContainer: { marginTop: 16, padding: 16, backgroundColor: '#131622', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  sectionHeader: { color: '#4f6ef7', fontWeight: '800', fontSize: 14, marginBottom: 4 }
});