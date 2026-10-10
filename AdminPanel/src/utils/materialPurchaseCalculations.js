// Utility for dynamic material purchase calculations and expense allocations
// Matches suppliers and categories to determine Amount Paid and Balance Due

export const isSupplierMatch = (supA, supB) => {
  if (!supA || !supB) return false;
  const a = String(supA).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const b = String(supB).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const wordsA = a.split(/\s+/).filter(w => w.length >= 3);
  const wordsB = b.split(/\s+/).filter(w => w.length >= 3);

  let sharedCount = 0;
  for (const wa of wordsA) {
    for (const wb of wordsB) {
      if (wa === wb) {
        sharedCount++;
        break;
      }
      if (wa.length >= 4 && wb.length >= 4 && wa.slice(0, 5) === wb.slice(0, 5)) {
        sharedCount++;
        break;
      }
    }
  }

  const keyBrands = ['ganesh', 'ganesha', 'ultratech', 'tata', 'balaji', 'kajaria', 'asian', 'kaveri', 'smartline', 'supreme', 'jaguar'];
  const hasKeyBrandMatch = keyBrands.some(k => a.includes(k) && b.includes(k));
  if (hasKeyBrandMatch) return true;

  return sharedCount >= 2;
};

export const isCategoryMatch = (pDept, pMaterial, expCategory) => {
  if (!expCategory) return true;
  const c = String(expCategory).toLowerCase().trim();
  const d = String(pDept || '').toLowerCase().trim();
  const m = String(pMaterial || '').toLowerCase().trim();

  if (d === c || m === c || d.includes(c) || c.includes(d) || m.includes(c) || c.includes(m)) return true;

  const isMasonryExp = c.includes('mason') || c.includes('brick') || c.includes('cement') || c.includes('sand');
  const isMasonryPur = d.includes('mason') || m.includes('brick') || m.includes('cement') || m.includes('sand');
  if (isMasonryExp && isMasonryPur) return true;

  const isTilesExp = c.includes('tile') || c.includes('floor');
  const isTilesPur = d.includes('tile') || m.includes('tile') || m.includes('floor');
  if (isTilesExp && isTilesPur) return true;

  const isSteelExp = c.includes('steel') || c.includes('tmt') || c.includes('structur');
  const isSteelPur = d.includes('steel') || d.includes('structur') || m.includes('steel') || m.includes('tmt');
  if (isSteelExp && isSteelPur) return true;

  const isElecExp = c.includes('electr');
  const isElecPur = d.includes('electr') || m.includes('electr') || m.includes('wiring');
  if (isElecExp && isElecPur) return true;

  const isPlumbExp = c.includes('plumb');
  const isPlumbPur = d.includes('plumb') || m.includes('plumb') || m.includes('pipe');
  if (isPlumbExp && isPlumbPur) return true;

  const isPaintExp = c.includes('paint');
  const isPaintPur = d.includes('paint') || m.includes('paint');
  if (isPaintExp && isPaintPur) return true;

  const isCarpExp = c.includes('carpent') || c.includes('door') || c.includes('window');
  const isCarpPur = d.includes('carpent') || d.includes('door') || m.includes('door') || m.includes('wood');
  if (isCarpExp && isCarpPur) return true;

  return false;
};

export const isSameSite = (a, b) => {
  if (!a || !b) return false;
  const aName = String(a.site_name || a.project_name || a.site || a.title || a.name || '').toLowerCase().trim();
  const bName = String(b.site_name || b.project_name || b.site || b.title || b.name || '').toLowerCase().trim();
  const aId = String(a.site_id || a.id || '').toLowerCase().trim();
  const bId = String(b.site_id || b.id || '').toLowerCase().trim();

  if (aId && bId && aId === bId) return true;
  if (aName && bName && (aName === bName || aName.includes(bName) || bName.includes(aName))) return true;
  if (aId && bName && aId === bName) return true;
  if (aName && bId && aName === bId) return true;
  return false;
};

/**
 * Calculates dynamically paid amounts and balance dues for purchases by allocating
 * matching material expenses strictly per site, supplier, and category.
 * If targetSite is provided, only processes purchases and expenses for that site.
 */
export const calculatePurchasesWithBalances = (purchases = [], expenses = [], targetSite = null) => {
  // 1. Filter genuine purchase orders (exclude expense entries and logs)
  const actualPurchases = (purchases || []).filter(p => {
    if (p.expense_id || p.is_expense_entry || p.is_expense || p.category === 'Material' || (p.notes && p.notes.includes('Supplier:'))) {
      return false;
    }
    if (targetSite && !isSameSite(p, targetSite)) {
      return false;
    }
    return true;
  });

  // 2. Filter material expenses
  const materialExpenses = (expenses || []).filter(e => {
    const cat = String(e.category || '').toLowerCase();
    if (!cat.includes('material')) return false;
    if (targetSite && !isSameSite(e, targetSite)) {
      return false;
    }
    return true;
  });

  // 3. Group material expenses by site
  const siteExpensesMap = {};
  materialExpenses.forEach(e => {
    const siteKey = targetSite
      ? 'target_site'
      : (e.site_name || e.project_name || 'General').toLowerCase().trim();
    if (!siteExpensesMap[siteKey]) siteExpensesMap[siteKey] = [];

    const supName = e.supplier_name || e.vendor_name || 
      ((e.notes && e.notes.includes('Supplier:')) 
        ? e.notes.replace('Supplier:', '').trim() 
        : (e.notes || ''));

    siteExpensesMap[siteKey].push({
      ...e,
      remainingAmount: Number(e.amount || 0),
      supplier: supName.trim(),
      work_category: (e.work_category || '').trim()
    });
  });

  // 4. Group actual purchases by site
  const sitePurchasesMap = {};
  actualPurchases.forEach(p => {
    const siteKey = targetSite
      ? 'target_site'
      : (p.site_name || p.project_name || 'General').toLowerCase().trim();
    if (!sitePurchasesMap[siteKey]) sitePurchasesMap[siteKey] = [];
    sitePurchasesMap[siteKey].push({ ...p });
  });

  const result = [];

  // 5. Process each site strictly independently
  Object.keys(sitePurchasesMap).forEach(siteKey => {
    const sitePurchases = sitePurchasesMap[siteKey];
    sitePurchases.sort((a, b) => {
      const da = new Date(a.order_date || 0);
      const db = new Date(b.order_date || 0);
      return da - db;
    });

    const siteExpenses = siteExpensesMap[siteKey] || [];

    sitePurchases.forEach(p => {
      const pTotal = Number(p.total_amount || 0);
      let allocated = 0;
      const pVendor = p.vendor_name || '';
      const pDept = p.department || '';
      const pMaterial = p.material_category || '';

      siteExpenses.forEach(exp => {
        if (exp.remainingAmount > 0) {
          const supplierMatches = isSupplierMatch(pVendor, exp.supplier);
          const categoryMatches = isCategoryMatch(pDept, pMaterial, exp.work_category);

          if (supplierMatches && categoryMatches) {
            const needed = pTotal - allocated;
            if (needed > 0) {
              const take = Math.min(needed, exp.remainingAmount);
              allocated += take;
              exp.remainingAmount -= take;
            }
          }
        }
      });

      const manualPaid = Number(p.amount_paid || 0);
      const finalPaid = Math.min(pTotal, Math.max(allocated, manualPaid));
      const finalBalance = Math.max(0, pTotal - finalPaid);

      p.calculated_paid = finalPaid;
      p.calculated_balance = finalBalance;
      p.payment_status = finalBalance === 0 && pTotal > 0 ? 'Paid' : (finalPaid > 0 ? 'Partially Paid' : 'Unpaid');

      result.push(p);
    });
  });

  return result;
};
