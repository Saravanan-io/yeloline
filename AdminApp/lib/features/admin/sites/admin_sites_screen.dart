import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';

class DeptBudgetItem {
  final IconData icon;
  final String title;
  final String matBudget;
  final String labBudget;
  final String totalBudget;
  final String spent;
  final String remaining;
  final double progress;
  final Color statusColor;

  const DeptBudgetItem({
    required this.icon,
    required this.title,
    required this.matBudget,
    required this.labBudget,
    required this.totalBudget,
    required this.spent,
    required this.remaining,
    required this.progress,
    required this.statusColor,
  });
}

class AdminSitesScreen extends StatefulWidget {
  const AdminSitesScreen({super.key});

  @override
  State<AdminSitesScreen> createState() => _AdminSitesScreenState();
}

class _AdminSitesScreenState extends State<AdminSitesScreen> {
  String? _selectedSite;
  bool _expandAll = false;
  final Set<int> _expandedIndices = {};

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

  IconData _getIconForDept(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('mason')) return Icons.foundation_rounded;
    if (lower.contains('electr')) return Icons.electric_bolt_rounded;
    if (lower.contains('plumb')) return Icons.plumbing_rounded;
    if (lower.contains('shutter') || lower.contains('center')) return Icons.grid_on_rounded;
    if (lower.contains('tile')) return Icons.window_rounded;
    if (lower.contains('lathe') || lower.contains('fabric')) return Icons.construction_rounded;
    if (lower.contains('carpent') || lower.contains('door')) return Icons.carpenter_rounded;
    if (lower.contains('paint')) return Icons.format_paint_rounded;
    return Icons.architecture_rounded;
  }

  void _toggleExpandAll(int totalCount) {
    setState(() {
      _expandAll = !_expandAll;
      if (_expandAll) {
        _expandedIndices.addAll(List.generate(totalCount, (i) => i));
      } else {
        _expandedIndices.clear();
      }
    });
  }

  void _toggleItem(int index, int totalCount) {
    setState(() {
      if (_expandedIndices.contains(index)) {
        _expandedIndices.remove(index);
      } else {
        _expandedIndices.add(index);
      }
      _expandAll = _expandedIndices.length == totalCount;
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('sites').snapshots(),
      builder: (context, sitesSnap) {
        return StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance.collection('payments').snapshots(),
          builder: (context, paymentsSnap) {
            return StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance.collection('expenses').snapshots(),
              builder: (context, expensesSnap) {
                return StreamBuilder<QuerySnapshot>(
                  stream: FirebaseFirestore.instance.collection('purchases').snapshots(),
                  builder: (context, purchasesSnap) {
                    return StreamBuilder<QuerySnapshot>(
                      stream: FirebaseFirestore.instance.collection('additional_billing').snapshots(),
                      builder: (context, addBillingSnap) {
                        final sitesDocs = sitesSnap.data?.docs ?? [];
                        if (sitesDocs.isEmpty) {
                          return Center(
                            child: SingleChildScrollView(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: AppColors.lightYellowBg,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: AppColors.primaryYellow, width: 2),
                                    ),
                                    child: const Icon(
                                      Icons.apartment_rounded,
                                      size: 48,
                                      color: AppColors.darkYellow,
                                    ),
                                  ),
                                  const SizedBox(height: 18),
                                  const Text(
                                    'No Registered Sites',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.darkCharcoal,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'Create a site in the Admin Panel to view project financials, site budgets, and live progress here.',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                      height: 1.4,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            ),
                          );
                        }

                        final siteList = sitesDocs.map((d) {
                          final data = d.data() as Map<String, dynamic>;
                          return (data['site_name'] ?? data['title'] ?? data['site_id'] ?? d.id).toString();
                        }).toList();

                        if (_selectedSite == null || !siteList.contains(_selectedSite)) {
                          _selectedSite = siteList.first;
                        }

                        // Selected Site Document
                        dynamic selectedSiteDoc;
                        for (final d in sitesDocs) {
                          final data = d.data() as Map<String, dynamic>;
                          final name = (data['site_name'] ?? data['title'] ?? data['site_id'] ?? d.id).toString();
                          if (name == _selectedSite) {
                            selectedSiteDoc = d;
                            break;
                          }
                        }
                        selectedSiteDoc ??= sitesDocs.first;

                        final siteData = selectedSiteDoc.data() as Map<String, dynamic>;
                        final siteName = (siteData['site_name'] ?? siteData['title'] ?? selectedSiteDoc.id).toString();
                        final clientName = (siteData['client_name'] ?? 'Client').toString();
                        final location = (siteData['location'] ?? 'Tamil Nadu').toString();
                        final siteId = (siteData['site_id'] ?? selectedSiteDoc.id).toString();
                        final status = (siteData['status'] ?? 'Active').toString();
                        final progressNum = (siteData['progress_percentage'] as num?)?.toDouble() ?? 0.0;
                        final coverImage = (siteData['cover_image'] ?? '').toString();

                        final originalQuote = (num.tryParse(siteData['estimated_budget']?.toString() ?? '0') ?? 0).toDouble();

                        // Additional work for this site
                        final addBillingDocs = addBillingSnap.data?.docs ?? [];
                        final siteAddBills = addBillingDocs.where((d) {
                          final m = d.data() as Map<String, dynamic>;
                          final s = (m['site_name'] ?? m['siteId'] ?? '').toString().toLowerCase();
                          return s == siteName.toLowerCase() || s == siteId.toLowerCase();
                        }).toList();
                        final additionalWork = siteAddBills.fold<double>(0.0, (acc, d) {
                          final m = d.data() as Map<String, dynamic>;
                          return acc + (num.tryParse(m['amount']?.toString() ?? m['quoted_amount']?.toString() ?? '0') ?? 0).toDouble();
                        });

                        final revisedBudget = originalQuote + additionalWork;

                        // Payments for this site
                        final paymentsDocs = paymentsSnap.data?.docs ?? [];
                        final sitePayments = paymentsDocs.where((d) {
                          final m = d.data() as Map<String, dynamic>;
                          final s = (m['site_name'] ?? m['project_name'] ?? '').toString().toLowerCase();
                          return s == siteName.toLowerCase() || s == siteId.toLowerCase();
                        }).toList();
                        final totalReceived = sitePayments.fold<double>(0.0, (acc, d) {
                          final m = d.data() as Map<String, dynamic>;
                          return acc + (num.tryParse(m['amount_received']?.toString() ?? '0') ?? 0).toDouble();
                        });

                        // Expenses for this site
                        final expensesDocs = expensesSnap.data?.docs ?? [];
                        final siteExpenses = expensesDocs.where((d) {
                          final m = d.data() as Map<String, dynamic>;
                          final s = (m['site_name'] ?? '').toString().toLowerCase();
                          return s == siteName.toLowerCase() || s == siteId.toLowerCase();
                        }).toList();
                        final totalSpent = siteExpenses.fold<double>(0.0, (acc, d) {
                          final m = d.data() as Map<String, dynamic>;
                          return acc + (num.tryParse(m['amount']?.toString() ?? '0') ?? 0).toDouble();
                        });

                        final totalReceivable = (revisedBudget - totalReceived).clamp(0.0, double.infinity);
                        final availableBalance = totalReceived - totalSpent;

                        // Purchases for this site
                        final purchasesDocs = purchasesSnap.data?.docs ?? [];
                        final sitePurchases = purchasesDocs.where((d) {
                          final m = d.data() as Map<String, dynamic>;
                          final s = (m['site_name'] ?? '').toString().toLowerCase();
                          return s == siteName.toLowerCase() || s == siteId.toLowerCase();
                        }).toList();
                        final sitePurchaseTotal = sitePurchases.fold<double>(0.0, (acc, d) {
                          final m = d.data() as Map<String, dynamic>;
                          return acc + (num.tryParse(m['total_amount']?.toString() ?? '0') ?? 0).toDouble();
                        });
                        final sitePaidTotal = sitePurchases.fold<double>(0.0, (acc, d) {
                          final m = d.data() as Map<String, dynamic>;
                          return acc + (num.tryParse(m['amount_paid']?.toString() ?? '0') ?? 0).toDouble();
                        });
                        final siteCreditTotal = (sitePurchaseTotal - sitePaidTotal).clamp(0.0, double.infinity);

                        // Department-wise Budget Allocation from siteData['budget_items']
                        final rawBudgetItems = (siteData['budget_items'] as List<dynamic>?) ?? [];
                        const defaultTitles = [
                          'Masonry work expenses',
                          'Shuttering work expenses',
                          'Tiles work expenses',
                          'Painting work expenses',
                          'Doors and windows',
                          'Lathe Work expenses',
                          'Electrical work expenses',
                          'Plumbing work expenses',
                          "Engineer's Misc.",
                          'Additional Work'
                        ];

                        final itemsToIterate = rawBudgetItems.isNotEmpty
                            ? rawBudgetItems
                            : defaultTitles.map((t) => {'work_item': t, 'estimated_amount': 0, 'expense_amount': 0}).toList();

                        final List<DeptBudgetItem> deptItems = itemsToIterate.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final raw = entry.value;
                          final item = Map<String, dynamic>.from(raw as Map);
                          String desc = (item['work_item'] ?? item['description'] ?? '').toString().trim();
                          if (desc.isEmpty || desc == 'Work Item') {
                            desc = idx < defaultTitles.length ? defaultTitles[idx] : 'Work Item #${idx + 1}';
                          }

                          // Sum live matching expenses streamed from Firestore
                          final liveCategorySpent = siteExpenses.where((d) {
                            final m = d.data() as Map<String, dynamic>;
                            final cat = (m['work_category'] ?? m['category'] ?? '').toString().toLowerCase();
                            final descLower = desc.toLowerCase();
                            if (descLower.contains(cat) || cat.contains(descLower)) return true;
                            if (idx == 0 || descLower.contains('masonry')) return cat.contains('mason');
                            if (idx == 1 || descLower.contains('shuttering')) return cat.contains('shutter') || cat.contains('centering');
                            if (idx == 2 || descLower.contains('tile')) return cat.contains('tile');
                            if (idx == 3 || descLower.contains('paint')) return cat.contains('paint');
                            if (idx == 4 || descLower.contains('door') || descLower.contains('window')) return cat.contains('door') || cat.contains('window') || cat.contains('carpent');
                            if (idx == 5 || descLower.contains('lathe')) return cat.contains('lathe') || cat.contains('fabricat') || cat.contains('weld');
                            if (idx == 6 || descLower.contains('electric')) return cat.contains('electr');
                            if (idx == 7 || descLower.contains('plumb')) return cat.contains('plumb') || cat.contains('pipe');
                            if (idx == 8 || descLower.contains('engineer') || descLower.contains('misc')) return cat.contains('engineer') || cat.contains('misc') || cat.contains('supervisor');
                            if (idx == 9 || descLower.contains('additional')) return cat.contains('addition') || cat.contains('extra');
                            return false;
                          }).fold<double>(0.0, (acc, d) {
                            final m = d.data() as Map<String, dynamic>;
                            return acc + (num.tryParse(m['amount']?.toString() ?? '0') ?? 0).toDouble();
                          });

                          final est = (num.tryParse(item['estimated_amount']?.toString() ?? '0') ?? 0).toDouble();
                          final rawExp = (num.tryParse(item['expense_amount']?.toString() ?? '0') ?? 0).toDouble();
                          final exp = liveCategorySpent > 0 ? liveCategorySpent : rawExp;
                          final rem = (est - exp);
                          final prog = est > 0 ? (exp / est).clamp(0.0, 1.0) : 0.0;
                          final statusColor = prog >= 1.0 ? Colors.red : Colors.green;

                          return DeptBudgetItem(
                            icon: _getIconForDept(desc),
                            title: desc,
                            matBudget: _formatCurrency(est * 0.6),
                            labBudget: _formatCurrency(est * 0.4),
                            totalBudget: _formatCurrency(est),
                            spent: _formatCurrency(exp),
                            remaining: _formatCurrency(rem),
                            progress: prog,
                            statusColor: statusColor,
                          );
                        }).toList();

                        return SingleChildScrollView(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // 1. Screen Header & Site Dropdown Selector
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'Site Financial Overview',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.textSecondary,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.cardWhite,
                                          borderRadius: BorderRadius.circular(14),
                                          border: Border.all(color: AppColors.borderLight),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: 0.05),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: DropdownButtonHideUnderline(
                                          child: DropdownButton<String>(
                                            value: _selectedSite,
                                            icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.darkCharcoal, size: 24),
                                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                            onChanged: (val) {
                                              if (val != null) setState(() => _selectedSite = val);
                                            },
                                            items: siteList.map((site) {
                                              return DropdownMenuItem(value: site, child: Text(site));
                                            }).toList(),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'Site Details & Budgets',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimary,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                ],
                              ),

                              const SizedBox(height: 20),

                              // 2. Main Site Summary Card
                              Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: AppColors.cardWhite,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: AppColors.borderLight),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.06),
                                      blurRadius: 16,
                                      offset: const Offset(0, 6),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Site Profile Header + Progress Circle
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(14),
                                          child: coverImage.isNotEmpty
                                              ? Image.network(
                                                  coverImage,
                                                  width: 72,
                                                  height: 72,
                                                  fit: BoxFit.cover,
                                                  errorBuilder: (context, error, stackTrace) => Container(
                                                    width: 72,
                                                    height: 72,
                                                    color: AppColors.lightYellowBg,
                                                    child: const Icon(Icons.apartment_rounded, color: AppColors.darkYellow, size: 36),
                                                  ),
                                                )
                                              : Container(
                                                  width: 72,
                                                  height: 72,
                                                  color: AppColors.lightYellowBg,
                                                  child: const Icon(Icons.apartment_rounded, color: AppColors.darkYellow, size: 36),
                                                ),
                                        ),
                                        const SizedBox(width: 14),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Wrap(
                                                crossAxisAlignment: WrapCrossAlignment.center,
                                                spacing: 8,
                                                runSpacing: 4,
                                                children: [
                                                  Text(
                                                    siteName,
                                                    style: const TextStyle(
                                                      fontSize: 18,
                                                      fontWeight: FontWeight.w600,
                                                      color: AppColors.textPrimary,
                                                      letterSpacing: -0.3,
                                                    ),
                                                  ),
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                    decoration: BoxDecoration(
                                                      color: Colors.green.shade50,
                                                      borderRadius: BorderRadius.circular(8),
                                                      border: Border.all(color: Colors.green.shade200),
                                                    ),
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        Container(
                                                          width: 6,
                                                          height: 6,
                                                          decoration: const BoxDecoration(
                                                            color: Colors.green,
                                                            shape: BoxShape.circle,
                                                          ),
                                                        ),
                                                        const SizedBox(width: 5),
                                                        Text(
                                                          status,
                                                          style: TextStyle(
                                                            fontSize: 11,
                                                            fontWeight: FontWeight.w600,
                                                            color: Colors.green.shade800,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              const SizedBox(height: 6),
                                              Row(
                                                children: [
                                                  const Icon(Icons.person_outline_rounded, size: 14, color: AppColors.textSecondary),
                                                  const SizedBox(width: 5),
                                                  Expanded(
                                                    child: Text(
                                                      clientName,
                                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              const SizedBox(height: 4),
                                              Row(
                                                children: [
                                                  const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textSecondary),
                                                  const SizedBox(width: 5),
                                                  Expanded(
                                                    child: Text(
                                                      '$location • $siteId',
                                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        // Donut Progress Badge
                                        Container(
                                          width: 76,
                                          height: 76,
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: AppColors.lightYellowBg,
                                            shape: BoxShape.circle,
                                            border: Border.all(color: AppColors.primaryYellow, width: 2.5),
                                            boxShadow: [
                                              BoxShadow(
                                                color: AppColors.primaryYellow.withValues(alpha: 0.2),
                                                blurRadius: 8,
                                              ),
                                            ],
                                          ),
                                          child: Column(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Text(
                                                '${progressNum.toInt()}%',
                                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkCharcoal, height: 1.0),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                status,
                                                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Colors.green),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),

                                    const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 16),
                                      child: Divider(height: 1, color: AppColors.borderLight),
                                    ),

                                    // Financial Overview Metrics Grid
                                    Column(
                                      children: [
                                        // Row 1: Quoted & Additional
                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildMetricTile(
                                                label: 'Original Quote',
                                                value: _formatCurrency(originalQuote),
                                                bgColor: const Color(0xFFF8FAFC),
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: _buildMetricTile(
                                                label: 'Additional Work',
                                                value: _formatCurrency(additionalWork),
                                                bgColor: const Color(0xFFF8FAFC),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 10),
                                        // Row 2: Revised & Received
                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildMetricTile(
                                                label: 'Revised Budget',
                                                value: _formatCurrency(revisedBudget),
                                                valueColor: AppColors.darkYellow,
                                                bgColor: AppColors.lightYellowBg,
                                                borderColor: AppColors.primaryYellow.withValues(alpha: 0.5),
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: _buildMetricTile(
                                                label: 'Total Received',
                                                value: _formatCurrency(totalReceived),
                                                valueColor: Colors.blue.shade800,
                                                bgColor: Colors.blue.shade50.withValues(alpha: 0.5),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 10),
                                        // Row 3: Spent & Receivable
                                        Row(
                                          children: [
                                            Expanded(
                                              child: _buildMetricTile(
                                                label: 'Total Spent',
                                                value: _formatCurrency(totalSpent),
                                                valueColor: AppColors.darkCharcoal,
                                                bgColor: const Color(0xFFF8FAFC),
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: _buildMetricTile(
                                                label: 'Total Receivable',
                                                value: _formatCurrency(totalReceivable),
                                                valueColor: const Color(0xFF047857),
                                                bgColor: const Color(0xFFECFDF5),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),

                                    const SizedBox(height: 16),

                                    // Available Project Balance Banner
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [Colors.green.shade50, const Color(0xFFECFDF5)],
                                        ),
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: Colors.green.shade200),
                                      ),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.all(7),
                                                  decoration: BoxDecoration(
                                                    color: Colors.green.shade100,
                                                    shape: BoxShape.circle,
                                                  ),
                                                  child: const Icon(Icons.account_balance_wallet_rounded, size: 18, color: Colors.green),
                                                ),
                                                const SizedBox(width: 10),
                                                const Expanded(
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        'Available Project Balance',
                                                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                      SizedBox(height: 2),
                                                      Text(
                                                        'Unspent cash in hand',
                                                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                                            decoration: BoxDecoration(
                                              color: Colors.green.shade700,
                                              borderRadius: BorderRadius.circular(12),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.green.shade700.withValues(alpha: 0.3),
                                                  blurRadius: 6,
                                                  offset: const Offset(0, 2),
                                                ),
                                              ],
                                            ),
                                            child: Text(
                                              _formatCurrency(availableBalance),
                                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 28),

                              // 3. Department-wise Budget Allocation Header
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  const Expanded(
                                    child: Text(
                                      'Department-wise Budget Allocation',
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.textPrimary,
                                        letterSpacing: -0.3,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (deptItems.isNotEmpty) ...[
                                    const SizedBox(width: 8),
                                    InkWell(
                                      onTap: () => _toggleExpandAll(deptItems.length),
                                      borderRadius: BorderRadius.circular(8),
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              _expandAll ? 'Collapse All' : 'Expand All',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.darkYellow,
                                              ),
                                            ),
                                            const SizedBox(width: 2),
                                            Icon(
                                              _expandAll ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                                              size: 18,
                                              color: AppColors.darkYellow,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 14),

                              // Department Items List
                              if (deptItems.isEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                                  decoration: BoxDecoration(
                                    color: AppColors.cardWhite,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: AppColors.borderLight),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'No department budgets allocated for $siteName yet.',
                                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                    ),
                                  ),
                                )
                              else
                                ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: deptItems.length,
                                  itemBuilder: (context, index) {
                                    final item = deptItems[index];
                                    final isExpanded = _expandedIndices.contains(index);

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      decoration: BoxDecoration(
                                        color: AppColors.cardWhite,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: isExpanded ? AppColors.primaryYellow.withValues(alpha: 0.8) : AppColors.borderLight,
                                          width: isExpanded ? 1.5 : 1.0,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withValues(alpha: 0.04),
                                            blurRadius: 8,
                                            offset: const Offset(0, 3),
                                          ),
                                        ],
                                      ),
                                      child: Column(
                                        children: [
                                          // Card Header Row (Always Visible)
                                          InkWell(
                                            onTap: () => _toggleItem(index, deptItems.length),
                                            borderRadius: BorderRadius.circular(16),
                                            child: Padding(
                                              padding: const EdgeInsets.all(16.0),
                                              child: Column(
                                                children: [
                                                  Row(
                                                    children: [
                                                      Container(
                                                        padding: const EdgeInsets.all(10),
                                                        decoration: BoxDecoration(
                                                          color: AppColors.lightYellowBg,
                                                          borderRadius: BorderRadius.circular(12),
                                                        ),
                                                        child: Icon(item.icon, size: 22, color: AppColors.darkCharcoal),
                                                      ),
                                                      const SizedBox(width: 12),
                                                      Expanded(
                                                        child: Column(
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            Row(
                                                              children: [
                                                                Text(
                                                                  item.title,
                                                                  style: const TextStyle(
                                                                    fontSize: 15,
                                                                    fontWeight: FontWeight.bold,
                                                                    color: AppColors.textPrimary,
                                                                  ),
                                                                ),
                                                                const SizedBox(width: 8),
                                                                Container(
                                                                  width: 8,
                                                                  height: 8,
                                                                  decoration: BoxDecoration(
                                                                    color: item.statusColor,
                                                                    shape: BoxShape.circle,
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                            const SizedBox(height: 3),
                                                            Text(
                                                              'Budget: ${item.totalBudget}',
                                                              style: const TextStyle(
                                                                fontSize: 12,
                                                                color: AppColors.textSecondary,
                                                                fontWeight: FontWeight.w400,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                      const SizedBox(width: 8),
                                                      Column(
                                                        crossAxisAlignment: CrossAxisAlignment.end,
                                                        children: [
                                                          const Text(
                                                            'Remaining',
                                                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                                                          ),
                                                          const SizedBox(height: 2),
                                                          Text(
                                                            item.remaining,
                                                            style: TextStyle(
                                                              fontSize: 15,
                                                              fontWeight: FontWeight.w400,
                                                              color: item.statusColor,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                      const SizedBox(width: 10),
                                                      Icon(
                                                        isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                                                        size: 22,
                                                        color: AppColors.textPrimary,
                                                      ),
                                                    ],
                                                  ),

                                                  // Mini Progress Bar on Card Header
                                                  const SizedBox(height: 12),
                                                  Row(
                                                    children: [
                                                      Expanded(
                                                        child: ClipRRect(
                                                          borderRadius: BorderRadius.circular(4),
                                                          child: LinearProgressIndicator(
                                                            value: item.progress,
                                                            minHeight: 6,
                                                            backgroundColor: const Color(0xFFF1F5F9),
                                                            valueColor: AlwaysStoppedAnimation<Color>(item.statusColor),
                                                          ),
                                                        ),
                                                      ),
                                                      const SizedBox(width: 10),
                                                      Text(
                                                        'Spent: ${item.spent}',
                                                        style: const TextStyle(
                                                          fontSize: 11,
                                                          fontWeight: FontWeight.w400,
                                                          color: AppColors.textSecondary,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),

                                          // Expanded Details Section
                                          if (isExpanded) ...[
                                            const Divider(height: 1, color: AppColors.borderLight),
                                            Container(
                                              padding: const EdgeInsets.all(14),
                                              decoration: const BoxDecoration(
                                                color: Color(0xFFF8FAFC),
                                                borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
                                              ),
                                              child: Row(
                                                children: [
                                                  Expanded(
                                                    child: _buildDetailSubTile(
                                                      label: 'Material Budget',
                                                      value: item.matBudget,
                                                      icon: Icons.inventory_2_outlined,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Expanded(
                                                    child: _buildDetailSubTile(
                                                      label: 'Labor Budget',
                                                      value: item.labBudget,
                                                      icon: Icons.groups_outlined,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Expanded(
                                                    child: _buildDetailSubTile(
                                                      label: 'Utilized %',
                                                      value: '${(item.progress * 100).toInt()}%',
                                                      icon: Icons.pie_chart_outline_rounded,
                                                      valueColor: item.statusColor,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    );
                                  },
                                ),

                              const SizedBox(height: 24),

                              // 4. Site Purchase Data Section
                              const Text(
                                'Site Purchase data',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.3,
                                ),
                              ),
                              const SizedBox(height: 12),

                              Row(
                                children: [
                                  Expanded(
                                    child: _buildSitePurchaseCard(
                                      title: 'Total Purchase',
                                      amount: _formatCurrency(sitePurchaseTotal),
                                      icon: Icons.shopping_bag_rounded,
                                      color: AppColors.darkCharcoal,
                                      bgColor: AppColors.lightYellowBg,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: _buildSitePurchaseCard(
                                      title: 'Total Paid',
                                      amount: _formatCurrency(sitePaidTotal),
                                      icon: Icons.check_circle_rounded,
                                      color: Colors.green.shade800,
                                      bgColor: Colors.green.shade50,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: _buildSitePurchaseCard(
                                      title: 'Total Credit',
                                      amount: _formatCurrency(siteCreditTotal),
                                      icon: Icons.credit_score_rounded,
                                      color: Colors.red.shade800,
                                      bgColor: Colors.red.shade50,
                                    ),
                                  ),
                                ],
                              ),

                              const SizedBox(height: 24),
                            ],
                          ),
                        );
                      },
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildSitePurchaseCard({
    required String title,
    required String amount,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 15, color: color),
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              amount,
              style: TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String label,
    required String value,
    Color? valueColor,
    required Color bgColor,
    Color? borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor ?? AppColors.borderLight.withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
            maxLines: 2,
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: valueColor ?? AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailSubTile({
    required String label,
    required String value,
    required IconData icon,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.textMuted),
          const SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w400),
                  maxLines: 2,
                ),
                const SizedBox(height: 3),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: valueColor ?? AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
