import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';
import 'add_purchase_screen.dart';

class AdminPurchaseScreen extends StatefulWidget {
  const AdminPurchaseScreen({super.key});

  @override
  State<AdminPurchaseScreen> createState() => _AdminPurchaseScreenState();
}

class _AdminPurchaseScreenState extends State<AdminPurchaseScreen> {
  String _selectedSiteFilter = 'All';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatCurrency(num value) {
    final intVal = value.toInt();
    final str = intVal.abs().toString();
    if (str.length <= 3) {
      return '${value < 0 ? '-' : ''}₹$str';
    }
    final last3 = str.substring(str.length - 3);
    final rest = str.substring(0, str.length - 3);
    final parts = <String>[];
    var pos = rest.length;
    while (pos > 0) {
      final start = (pos - 2) < 0 ? 0 : pos - 2;
      parts.insert(0, rest.substring(start, pos));
      pos -= 2;
    }
    return '${value < 0 ? '-' : ''}₹${parts.join(',')},$last3';
  }

  IconData _getDepartmentIcon(String dept) {
    final lower = dept.toLowerCase();
    if (lower.contains('mason')) return Icons.foundation_rounded;
    if (lower.contains('electr')) return Icons.electric_bolt_rounded;
    if (lower.contains('plumb')) return Icons.plumbing_rounded;
    if (lower.contains('shutter') || lower.contains('center')) return Icons.grid_on_rounded;
    if (lower.contains('tile')) return Icons.window_rounded;
    if (lower.contains('carpent') || lower.contains('door')) return Icons.carpenter_rounded;
    if (lower.contains('paint')) return Icons.format_paint_rounded;
    return Icons.inventory_2_rounded;
  }

  bool _isSupplierMatch(String supA, String supB) {
    if (supA.isEmpty || supB.isEmpty) return false;
    final a = supA.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), ' ').trim();
    final b = supB.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), ' ').trim();
    if (a.isEmpty || b.isEmpty) return false;
    if (a == b || a.contains(b) || b.contains(a)) return true;

    final wordsA = a.split(RegExp(r'\s+')).where((w) => w.length >= 3).toList();
    final wordsB = b.split(RegExp(r'\s+')).where((w) => w.length >= 3).toList();

    int sharedCount = 0;
    for (final wa in wordsA) {
      for (final wb in wordsB) {
        if (wa == wb) {
          sharedCount++;
          break;
        }
        if (wa.length >= 4 && wb.length >= 4) {
          final lenA = wa.length > 5 ? 5 : wa.length;
          final lenB = wb.length > 5 ? 5 : wb.length;
          if (wa.substring(0, lenA) == wb.substring(0, lenB)) {
            sharedCount++;
            break;
          }
        }
      }
    }

    const keyBrands = ['ganesh', 'ganesha', 'ultratech', 'tata', 'balaji', 'kajaria', 'asian', 'kaveri', 'smartline', 'supreme', 'jaguar'];
    final hasKeyBrand = keyBrands.any((k) => a.contains(k) && b.contains(k));
    if (hasKeyBrand) return true;

    return sharedCount >= 2;
  }

  bool _isCategoryMatch(String pDept, String pMaterial, String expCategory) {
    if (expCategory.isEmpty) return true;
    final c = expCategory.toLowerCase().trim();
    final d = pDept.toLowerCase().trim();
    final m = pMaterial.toLowerCase().trim();

    if (d == c || m == c || d.contains(c) || c.contains(d) || m.contains(c) || c.contains(m)) return true;

    final isMasonryExp = c.contains('mason') || c.contains('brick') || c.contains('cement') || c.contains('sand');
    final isMasonryPur = d.contains('mason') || m.contains('brick') || m.contains('cement') || m.contains('sand');
    if (isMasonryExp && isMasonryPur) return true;

    final isTilesExp = c.contains('tile') || c.contains('floor');
    final isTilesPur = d.contains('tile') || m.contains('tile') || m.contains('floor');
    if (isTilesExp && isTilesPur) return true;

    final isSteelExp = c.contains('steel') || c.contains('tmt') || c.contains('structur');
    final isSteelPur = d.contains('steel') || d.contains('structur') || m.contains('steel') || m.contains('tmt');
    if (isSteelExp && isSteelPur) return true;

    final isElecExp = c.contains('electr');
    final isElecPur = d.contains('electr') || m.contains('electr') || m.contains('wiring');
    if (isElecExp && isElecPur) return true;

    final isPlumbExp = c.contains('plumb');
    final isPlumbPur = d.contains('plumb') || m.contains('plumb') || m.contains('pipe');
    if (isPlumbExp && isPlumbPur) return true;

    final isPaintExp = c.contains('paint');
    final isPaintPur = d.contains('paint') || m.contains('paint');
    if (isPaintExp && isPaintPur) return true;

    final isCarpExp = c.contains('carpent') || c.contains('door') || c.contains('window');
    final isCarpPur = d.contains('carpent') || d.contains('door') || m.contains('door') || m.contains('wood');
    if (isCarpExp && isCarpPur) return true;

    return false;
  }

  void _showPurchaseDetailsSheet(Map<String, dynamic> data) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        final poId = data['purchase_id'] ?? '-';
        final site = data['site_name'] ?? '-';
        final dept = data['department'] ?? '-';
        final vendor = data['vendor_name'] ?? '-';
        final product = data['material_category'] ?? '-';
        final totalAmount = (num.tryParse(data['total_amount']?.toString() ?? '0') ?? 0);
        final amountPaid = (num.tryParse(data['calculated_paid']?.toString() ?? data['amount_paid']?.toString() ?? '0') ?? 0);
        final creditBalance = (num.tryParse(data['calculated_balance']?.toString() ?? '0') ?? (totalAmount - amountPaid)).clamp(0.0, double.infinity);
        final date = data['order_date'] ?? '-';
        final status = (data['calculated_status'] ?? data['payment_status'] ?? 'Unpaid').toString();
        final enteredBy = data['entered_by'] ?? '-';
        final deliveryStatus = data['delivery_status'] ?? 'Ordered';

        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        poId.toString(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        product.toString(),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.lightYellowBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.primaryYellow),
                    ),
                    child: Text(
                      _formatCurrency(totalAmount),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: AppColors.darkCharcoal,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Divider(color: AppColors.borderLight, height: 1),
              const SizedBox(height: 16),
              _buildDetailRow(Icons.business_rounded, 'Site', site.toString()),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.store_rounded, 'Supplier / Vendor', vendor.toString()),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.foundation_rounded, 'Department', dept.toString()),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.calendar_today_rounded, 'Order Date', date.toString()),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.local_shipping_rounded, 'Delivery Status', deliveryStatus.toString()),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.payments_rounded, 'Amount Paid', _formatCurrency(amountPaid)),
              const SizedBox(height: 12),
              _buildDetailRow(
                Icons.account_balance_wallet_rounded,
                'Credit Balance',
                _formatCurrency(creditBalance),
                valueColor: creditBalance > 0 ? AppColors.darkYellow : Colors.green.shade700,
              ),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.payment_rounded, 'Payment Status', status),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.badge_rounded, 'Entered By', enteredBy.toString()),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.darkCharcoal,
                    side: const BorderSide(color: AppColors.borderLight, width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Close', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Text(
          '$label: ',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textMuted),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: valueColor ?? AppColors.textPrimary,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance.collection('sites').snapshots(),
          builder: (context, sitesSnap) {
            final siteDocs = sitesSnap.data?.docs ?? [];
            final siteNames = <String>{'All'};
            for (final doc in siteDocs) {
              final d = doc.data() as Map<String, dynamic>;
              final name = (d['site_name'] ?? d['title'] ?? d['site_id'] ?? '').toString();
              if (name.isNotEmpty) siteNames.add(name);
            }

            return StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance.collection('purchases').snapshots(),
              builder: (context, purchasesSnap) {
                if (purchasesSnap.connectionState == ConnectionState.waiting && !purchasesSnap.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryYellow),
                  );
                }

                return StreamBuilder<QuerySnapshot>(
                  stream: FirebaseFirestore.instance.collection('expenses').snapshots(),
                  builder: (context, expensesSnap) {
                    final rawDocs = purchasesSnap.data?.docs ?? [];
                    for (final doc in rawDocs) {
                      final d = doc.data() as Map<String, dynamic>;
                      final name = (d['site_name'] ?? '').toString();
                      if (name.isNotEmpty) siteNames.add(name);
                    }
                    final sortedSites = ['All', ...siteNames.where((s) => s != 'All').toList()..sort()];

                    final List<Map<String, dynamic>> allPurchases = [];
                    for (final doc in rawDocs) {
                      final data = Map<String, dynamic>.from(doc.data() as Map);
                      data['id'] = doc.id;
                      final notes = (data['notes'] ?? '').toString();
                      if (notes.startsWith('Supplier:') || data['is_expense'] == true || data['category'] == 'Material') {
                        continue;
                      }
                      allPurchases.add(data);
                    }

                    // 1. Collect Material Expenses from expenses collection
                    final rawExpenseDocs = expensesSnap.data?.docs ?? [];
                    final List<Map<String, dynamic>> materialExpenses = [];
                    for (final doc in rawExpenseDocs) {
                      final d = Map<String, dynamic>.from(doc.data() as Map);
                      d['id'] = doc.id;
                      final cat = (d['category'] ?? '').toString().toLowerCase();
                      if (cat.contains('material')) {
                        materialExpenses.add(d);
                      }
                    }

                    // 2. Group expenses by site
                    final Map<String, List<Map<String, dynamic>>> expensesBySite = {};
                    for (final exp in materialExpenses) {
                      final site = (exp['site_name'] ?? '').toString().trim();
                      expensesBySite.putIfAbsent(site, () => []).add(exp);
                    }

                    // 3. Group purchases by site
                    final Map<String, List<Map<String, dynamic>>> purchasesBySite = {};
                    for (final po in allPurchases) {
                      final site = (po['site_name'] ?? '').toString().trim();
                      purchasesBySite.putIfAbsent(site, () => []).add(po);
                    }

                    // 4. Calculate paid and balance for each site separately
                    for (final entry in purchasesBySite.entries) {
                      final siteName = entry.key;
                      final sitePos = entry.value;
                      final siteExps = expensesBySite[siteName] ?? [];

                      // Create mutable copy of expense amounts with supplier and work_category
                      final expensePool = siteExps.map((e) {
                        String supplier = (e['supplier_name'] ?? e['vendor_name'] ?? '').toString();
                        if (supplier.isEmpty) {
                          final notes = (e['notes'] ?? '').toString();
                          if (notes.toLowerCase().contains('supplier:')) {
                            final idx = notes.toLowerCase().indexOf('supplier:');
                            supplier = notes.substring(idx + 9).trim();
                          } else {
                            supplier = notes.trim();
                          }
                        }
                        return {
                          'amount': (num.tryParse(e['amount']?.toString() ?? '0') ?? 0).toDouble(),
                          'supplier': supplier,
                          'work_category': (e['work_category'] ?? '').toString(),
                        };
                      }).toList();

                      // Sort site purchases by date ascending for sequential allocation
                      sitePos.sort((a, b) {
                        final aDate = a['order_date']?.toString() ?? '';
                        final bDate = b['order_date']?.toString() ?? '';
                        return aDate.compareTo(bDate);
                      });

                      // Deduct matching expenses with SAME SUPPLIER and SAME CATEGORY
                      for (final po in sitePos) {
                        final tot = (num.tryParse(po['total_amount']?.toString() ?? '0') ?? 0).toDouble();
                        final vendor = (po['vendor_name'] ?? '').toString().trim();
                        final dept = (po['department'] ?? '').toString().trim();
                        final material = (po['material_category'] ?? '').toString().trim();
                        double allocated = 0;

                        for (final exp in expensePool) {
                          final expRem = exp['amount'] as double;
                          if (expRem > 0) {
                            final expSup = exp['supplier'] as String;
                            final expCat = exp['work_category'] as String;

                            final supplierMatches = _isSupplierMatch(vendor, expSup);
                            final categoryMatches = _isCategoryMatch(dept, material, expCat);

                            if (supplierMatches && categoryMatches) {
                              final needed = tot - allocated;
                              if (needed > 0) {
                                final take = needed < expRem ? needed : expRem;
                                allocated += take;
                                exp['amount'] = expRem - take;
                              }
                            }
                          }
                        }

                        final finalPaid = allocated.clamp(0.0, tot);
                        final finalBalance = (tot - finalPaid).clamp(0.0, double.infinity);

                        po['calculated_paid'] = finalPaid;
                        po['calculated_balance'] = finalBalance;
                        po['calculated_status'] = finalBalance == 0 && tot > 0
                            ? 'Paid'
                            : (finalPaid > 0 ? 'Partially Paid' : 'Unpaid');
                      }
                    }

                    // Sort newest first for display
                    allPurchases.sort((a, b) {
                      final aTime = a['created_at'];
                      final bTime = b['created_at'];
                      if (aTime is Timestamp && bTime is Timestamp) {
                        return bTime.compareTo(aTime);
                      }
                      final aDate = a['order_date']?.toString() ?? '';
                      final bDate = b['order_date']?.toString() ?? '';
                      return bDate.compareTo(aDate);
                    });

                    // Apply Filters
                    final filteredPurchases = allPurchases.where((po) {
                      // Site filter
                      if (_selectedSiteFilter != 'All') {
                        final s = (po['site_name'] ?? '').toString();
                        if (s != _selectedSiteFilter) return false;
                      }
                      // Search query
                      if (_searchQuery.isNotEmpty) {
                        final q = _searchQuery.toLowerCase();
                        final prod = (po['material_category'] ?? '').toString().toLowerCase();
                        final vendor = (po['vendor_name'] ?? '').toString().toLowerCase();
                        final dept = (po['department'] ?? '').toString().toLowerCase();
                        final site = (po['site_name'] ?? '').toString().toLowerCase();
                        final poId = (po['purchase_id'] ?? '').toString().toLowerCase();
                        final entered = (po['entered_by'] ?? '').toString().toLowerCase();
                        if (!prod.contains(q) &&
                            !vendor.contains(q) &&
                            !dept.contains(q) &&
                            !site.contains(q) &&
                            !poId.contains(q) &&
                            !entered.contains(q)) {
                          return false;
                        }
                      }
                      return true;
                    }).toList();

                    // Compute Summary Stats
                    double totalPurchase = 0;
                    double totalPaid = 0;
                    double creditBalance = 0;

                    for (final po in filteredPurchases) {
                      final tot = (num.tryParse(po['total_amount']?.toString() ?? '0') ?? 0).toDouble();
                      final paid = (num.tryParse(po['calculated_paid']?.toString() ?? '0') ?? 0).toDouble();
                      final bal = (num.tryParse(po['calculated_balance']?.toString() ?? '0') ?? 0).toDouble();
                      totalPurchase += tot;
                      totalPaid += paid;
                      creditBalance += bal;
                    }

                return CustomScrollView(
                  physics: const BouncingScrollPhysics(),
                  slivers: [
                    // Top Header & Metrics
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Page Title Banner
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'PURCHASE ORDERS',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textMuted,
                                        letterSpacing: 1.1,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Order History',
                                      style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.textPrimary,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.darkCharcoal,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.shopping_cart_rounded, color: AppColors.primaryYellow, size: 14),
                                      const SizedBox(width: 6),
                                      Text(
                                        '${filteredPurchases.length} Orders',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 16),

                            // Summary Metric Cards Container
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.darkCharcoal,
                                borderRadius: BorderRadius.circular(18),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.1),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'TOTAL MATERIAL PURCHASES',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white60,
                                          letterSpacing: 0.8,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: AppColors.primaryYellow.withValues(alpha: 0.2),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: const Text(
                                          'LIVE',
                                          style: TextStyle(
                                            color: AppColors.primaryYellow,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w900,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    _formatCurrency(totalPurchase),
                                    style: const TextStyle(
                                      fontSize: 26,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.white,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  Container(height: 1, color: Colors.white12),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Row(
                                          children: [
                                            Container(
                                              width: 8,
                                              height: 8,
                                              decoration: BoxDecoration(
                                                color: Colors.green.shade400,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Total Paid',
                                                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
                                                ),
                                                Text(
                                                  _formatCurrency(totalPaid),
                                                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(width: 1, height: 28, color: Colors.white12),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Row(
                                          children: [
                                            Container(
                                              width: 8,
                                              height: 8,
                                              decoration: const BoxDecoration(
                                                color: AppColors.primaryYellow,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Credit Balance',
                                                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
                                                ),
                                                Text(
                                                  _formatCurrency(creditBalance),
                                                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Search Field
                            TextField(
                              controller: _searchController,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                              decoration: InputDecoration(
                                hintText: 'Search product, supplier, site, PO...',
                                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
                                suffixIcon: _searchQuery.isNotEmpty
                                    ? IconButton(
                                        icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textSecondary),
                                        onPressed: () {
                                          _searchController.clear();
                                          setState(() => _searchQuery = '');
                                        },
                                      )
                                    : null,
                                filled: true,
                                fillColor: Colors.white,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: AppColors.borderLight),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: AppColors.borderLight),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5),
                                ),
                              ),
                              onChanged: (val) => setState(() => _searchQuery = val.trim()),
                            ),

                            const SizedBox(height: 14),

                            // Site Filter Dropdown & Status Chips
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Site Filter Dropdown
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: AppColors.borderLight),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.04),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<String>(
                                      value: sortedSites.contains(_selectedSiteFilter) ? _selectedSiteFilter : 'All',
                                      isExpanded: true,
                                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.darkCharcoal, size: 24),
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                      onChanged: (val) {
                                        if (val != null) {
                                          setState(() => _selectedSiteFilter = val);
                                        }
                                      },
                                      items: sortedSites.map((site) {
                                        final isSelected = (sortedSites.contains(_selectedSiteFilter) ? _selectedSiteFilter : 'All') == site;
                                        return DropdownMenuItem<String>(
                                          value: site,
                                          child: Row(
                                            children: [
                                              Container(
                                                width: 28,
                                                height: 28,
                                                decoration: BoxDecoration(
                                                  color: isSelected ? AppColors.lightYellowBg : AppColors.inputBackground,
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Icon(
                                                  site == 'All' ? Icons.apartment_rounded : Icons.business_rounded,
                                                  size: 16,
                                                  color: isSelected ? AppColors.darkYellow : AppColors.textSecondary,
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              Expanded(
                                                child: Text(
                                                  site == 'All' ? 'All Sites' : site,
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                                    color: isSelected ? AppColors.darkCharcoal : AppColors.textPrimary,
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        );
                                      }).toList(),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Purchase Order List Items or Empty State
                    if (filteredPurchases.isEmpty)
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 32, 16, 90),
                          child: Container(
                            padding: const EdgeInsets.all(32),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 64,
                                  height: 64,
                                  decoration: BoxDecoration(
                                    color: AppColors.lightYellowBg,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: AppColors.primaryYellow.withValues(alpha: 0.5)),
                                  ),
                                  child: const Icon(
                                    Icons.shopping_cart_outlined,
                                    size: 32,
                                    color: AppColors.darkCharcoal,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'No Purchase Orders Found',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Tap the + button at the bottom right to record a material purchase.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                    else
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 96),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final po = filteredPurchases[index];
                              final product = (po['material_category'] ?? 'Material').toString();
                              final vendor = (po['vendor_name'] ?? 'Supplier').toString();
                              final site = (po['site_name'] ?? '-').toString();
                              final dept = (po['department'] ?? 'Masonry').toString();
                              final totalAmount = (num.tryParse(po['total_amount']?.toString() ?? '0') ?? 0);
                              final amountPaid = (num.tryParse(po['calculated_paid']?.toString() ?? po['amount_paid']?.toString() ?? '0') ?? 0);
                              final creditBal = (num.tryParse(po['calculated_balance']?.toString() ?? '0') ?? (totalAmount - amountPaid)).clamp(0.0, double.infinity);
                              final date = (po['order_date'] ?? '').toString();
                              final status = (po['calculated_status'] ?? po['payment_status'] ?? 'Unpaid').toString();
                              final enteredBy = (po['entered_by'] ?? '').toString();

                              Color statusColor;
                              Color statusBg;
                              if (status.toLowerCase() == 'paid') {
                                statusColor = Colors.green.shade800;
                                statusBg = Colors.green.shade50;
                              } else if (status.toLowerCase().contains('partial')) {
                                statusColor = AppColors.darkYellow;
                                statusBg = AppColors.lightYellowBg;
                              } else {
                                statusColor = Colors.red.shade700;
                                statusBg = Colors.red.shade50;
                              }

                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: AppColors.borderLight),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.03),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    onTap: () => _showPurchaseDetailsSheet(po),
                                    borderRadius: BorderRadius.circular(16),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Top Row: Dept Icon + Product Title & Total Amount
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                width: 42,
                                                height: 42,
                                                decoration: BoxDecoration(
                                                  color: AppColors.lightYellowBg,
                                                  borderRadius: BorderRadius.circular(12),
                                                  border: Border.all(
                                                    color: AppColors.primaryYellow,
                                                    width: 1.2,
                                                  ),
                                                ),
                                                child: Icon(
                                                  _getDepartmentIcon(dept),
                                                  color: AppColors.darkCharcoal,
                                                  size: 20,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      product,
                                                      style: const TextStyle(
                                                        fontSize: 15,
                                                        fontWeight: FontWeight.w800,
                                                        color: AppColors.textPrimary,
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Row(
                                                      children: [
                                                        const Icon(Icons.business_rounded, size: 13, color: AppColors.textMuted),
                                                        const SizedBox(width: 4),
                                                        Expanded(
                                                          child: Text(
                                                            site,
                                                            style: const TextStyle(
                                                              fontSize: 12,
                                                              fontWeight: FontWeight.w600,
                                                              color: AppColors.textSecondary,
                                                            ),
                                                            maxLines: 1,
                                                            overflow: TextOverflow.ellipsis,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                _formatCurrency(totalAmount),
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w900,
                                                  color: AppColors.darkCharcoal,
                                                ),
                                              ),
                                            ],
                                          ),

                                          const SizedBox(height: 12),
                                          const Divider(height: 1, color: AppColors.borderLight),
                                          const SizedBox(height: 10),

                                          // Middle Badges: Supplier, Status, Date
                                          Row(
                                            children: [
                                              // Supplier Pill
                                              Flexible(
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.inputBackground,
                                                    borderRadius: BorderRadius.circular(8),
                                                  ),
                                                  child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      const Icon(Icons.store_rounded, size: 13, color: AppColors.textSecondary),
                                                      const SizedBox(width: 4),
                                                      Flexible(
                                                        child: Text(
                                                          vendor,
                                                          style: const TextStyle(
                                                            fontSize: 11,
                                                            fontWeight: FontWeight.w700,
                                                            color: AppColors.textSecondary,
                                                          ),
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8),

                                              // Payment Status Badge
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: statusBg,
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Text(
                                                  status,
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w800,
                                                    color: statusColor,
                                                  ),
                                                ),
                                              ),
                                              const Spacer(),

                                              // Date
                                              Row(
                                                children: [
                                                  const Icon(Icons.calendar_today_rounded, size: 12, color: AppColors.textMuted),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    date,
                                                    style: const TextStyle(
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.w600,
                                                      color: AppColors.textSecondary,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),

                                          const SizedBox(height: 10),

                                          // Payment Breakdown Card
                                          Container(
                                            width: double.infinity,
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF8FAFC),
                                              borderRadius: BorderRadius.circular(10),
                                              border: Border.all(color: AppColors.borderLight),
                                            ),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Row(
                                                  children: [
                                                    const Text(
                                                      'Paid: ',
                                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textMuted),
                                                    ),
                                                    Text(
                                                      _formatCurrency(amountPaid),
                                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.green.shade700),
                                                    ),
                                                  ],
                                                ),
                                                Container(width: 1, height: 16, color: AppColors.borderLight),
                                                Row(
                                                  children: [
                                                    const Text(
                                                      'Credit Balance: ',
                                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textMuted),
                                                    ),
                                                    Text(
                                                      _formatCurrency(creditBal),
                                                      style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w800,
                                                        color: creditBal > 0 ? AppColors.darkYellow : Colors.green.shade700,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),

                                          // Footer: Entered By
                                          if (enteredBy.isNotEmpty) ...[
                                            const SizedBox(height: 8),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(
                                                  'Entered by: $enteredBy',
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w500,
                                                    color: AppColors.textMuted,
                                                  ),
                                                ),
                                                const Icon(
                                                  Icons.chevron_right_rounded,
                                                  size: 16,
                                                  color: AppColors.textMuted,
                                                ),
                                              ],
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                            childCount: filteredPurchases.length,
                          ),
                        ),
                      ),
                  ],
                );
              },
            );
          },
        );
      },
    ),

        // Bottom-Right Add Purchase Pop Icon (Floating Action Button)
        Positioned(
          right: 20,
          bottom: 20,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddPurchaseScreen()),
                );
              },
              borderRadius: BorderRadius.circular(30),
              child: Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: AppColors.primaryYellow,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                    BoxShadow(
                      color: AppColors.primaryYellow.withValues(alpha: 0.4),
                      blurRadius: 14,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.add_rounded,
                  color: AppColors.darkCharcoal,
                  size: 32,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
