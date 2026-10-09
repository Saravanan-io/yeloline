import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';
import 'add_expense_screen.dart';

class AdminExpenseScreen extends StatefulWidget {
  const AdminExpenseScreen({super.key});

  @override
  State<AdminExpenseScreen> createState() => _AdminExpenseScreenState();
}

class _AdminExpenseScreenState extends State<AdminExpenseScreen> {
  String _selectedSiteFilter = 'All';
  String _selectedTypeFilter = 'All'; // 'All', 'Labour', 'Material'
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

  IconData _getCategoryIcon(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('mason')) return Icons.foundation_rounded;
    if (cat.contains('shutter') || cat.contains('center')) return Icons.grid_on_rounded;
    if (cat.contains('tile')) return Icons.window_rounded;
    if (cat.contains('paint')) return Icons.format_paint_rounded;
    if (cat.contains('door') || cat.contains('window') || cat.contains('carpent')) return Icons.carpenter_rounded;
    if (cat.contains('lathe')) return Icons.construction_rounded;
    if (cat.contains('electr')) return Icons.electric_bolt_rounded;
    if (cat.contains('plumb')) return Icons.plumbing_rounded;
    return Icons.receipt_long_rounded;
  }

  void _showExpenseDetailsSheet(Map<String, dynamic> data) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        final expId = data['expense_id'] ?? '-';
        final site = data['site_name'] ?? '-';
        final workCategory = data['work_category'] ?? '-';
        final type = data['category'] ?? '-';
        final amount = (num.tryParse(data['amount']?.toString() ?? '0') ?? 0);
        final date = data['date'] ?? '-';
        final paymentMode = data['payment_mode'] ?? '-';
        final enteredBy = data['entered_by'] ?? '-';
        final notes = data['notes'] ?? '';

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
                        expId.toString(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        workCategory.toString(),
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
                      _formatCurrency(amount),
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
              _buildDetailRow(
                type == 'Labour' ? Icons.groups_rounded : Icons.inventory_2_rounded,
                'Expense Type',
                type.toString(),
              ),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.calendar_today_rounded, 'Date', date.toString()),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.payments_rounded, 'Payment Mode', paymentMode.toString()),
              const SizedBox(height: 12),
              _buildDetailRow(Icons.badge_rounded, 'Entered By', enteredBy.toString()),
              if (notes.toString().trim().isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildDetailRow(Icons.notes_rounded, 'Details / Notes', notes.toString()),
              ],
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

  Widget _buildDetailRow(IconData icon, String label, String value) {
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
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
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
              stream: FirebaseFirestore.instance.collection('expenses').snapshots(),
              builder: (context, expensesSnap) {
                if (expensesSnap.connectionState == ConnectionState.waiting && !expensesSnap.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryYellow),
                  );
                }

                final rawDocs = expensesSnap.data?.docs ?? [];
                for (final doc in rawDocs) {
                  final d = doc.data() as Map<String, dynamic>;
                  final name = (d['site_name'] ?? '').toString();
                  if (name.isNotEmpty) siteNames.add(name);
                }
                final sortedSites = ['All', ...siteNames.where((s) => s != 'All').toList()..sort()];

                final List<Map<String, dynamic>> allExpenses = [];

                for (final doc in rawDocs) {
                  final data = Map<String, dynamic>.from(doc.data() as Map);
                  data['id'] = doc.id;
                  allExpenses.add(data);
                }

                // Sort newest first
                allExpenses.sort((a, b) {
                  final aTime = a['created_at'];
                  final bTime = b['created_at'];
                  if (aTime is Timestamp && bTime is Timestamp) {
                    return bTime.compareTo(aTime);
                  }
                  final aDate = a['date']?.toString() ?? '';
                  final bDate = b['date']?.toString() ?? '';
                  return bDate.compareTo(aDate);
                });

                // Apply Filters
                final filteredExpenses = allExpenses.where((exp) {
                  // Site filter
                  if (_selectedSiteFilter != 'All') {
                    final s = (exp['site_name'] ?? '').toString();
                    if (s != _selectedSiteFilter) return false;
                  }
                  // Type filter
                  if (_selectedTypeFilter != 'All') {
                    final t = (exp['category'] ?? '').toString();
                    if (t.toLowerCase() != _selectedTypeFilter.toLowerCase()) return false;
                  }
                  // Search query
                  if (_searchQuery.isNotEmpty) {
                    final q = _searchQuery.toLowerCase();
                    final cat = (exp['work_category'] ?? '').toString().toLowerCase();
                    final site = (exp['site_name'] ?? '').toString().toLowerCase();
                    final notes = (exp['notes'] ?? '').toString().toLowerCase();
                    final entered = (exp['entered_by'] ?? '').toString().toLowerCase();
                    final payMode = (exp['payment_mode'] ?? '').toString().toLowerCase();
                    final expId = (exp['expense_id'] ?? '').toString().toLowerCase();
                    if (!cat.contains(q) &&
                        !site.contains(q) &&
                        !notes.contains(q) &&
                        !entered.contains(q) &&
                        !payMode.contains(q) &&
                        !expId.contains(q)) {
                      return false;
                    }
                  }
                  return true;
                }).toList();

                // Compute Summary Stats
                double totalExpenseAmount = 0;
                double labourTotal = 0;
                double materialTotal = 0;

                for (final exp in filteredExpenses) {
                  final amt = (num.tryParse(exp['amount']?.toString() ?? '0') ?? 0).toDouble();
                  totalExpenseAmount += amt;
                  final cat = (exp['category'] ?? '').toString().toLowerCase();
                  if (cat == 'labour') {
                    labourTotal += amt;
                  } else if (cat == 'material') {
                    materialTotal += amt;
                  }
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
                                      'EXPENSE TRACKER',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textMuted,
                                        letterSpacing: 1.1,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Recent Expenses',
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
                                      const Icon(Icons.receipt_long_rounded, color: AppColors.primaryYellow, size: 14),
                                      const SizedBox(width: 6),
                                      Text(
                                        '${filteredExpenses.length} Records',
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
                                        'TOTAL EXPENSE LOGGED',
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
                                    _formatCurrency(totalExpenseAmount),
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
                                                  'Labour',
                                                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
                                                ),
                                                Text(
                                                  _formatCurrency(labourTotal),
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
                                                color: Colors.lightBlueAccent,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Material',
                                                  style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
                                                ),
                                                Text(
                                                  _formatCurrency(materialTotal),
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
                                hintText: 'Search expenses, labour, category...',
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

                            // Site Filter Dropdown & Type Filter
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
                                const SizedBox(height: 10),
                                // Type Chips (All, Labour, Material)
                                Row(
                                  children: ['All', 'Labour', 'Material'].map((type) {
                                    final isSelected = _selectedTypeFilter == type;
                                    return Padding(
                                      padding: const EdgeInsets.only(right: 8),
                                      child: ChoiceChip(
                                        avatar: type == 'Labour'
                                            ? Icon(Icons.groups_rounded, size: 14, color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary)
                                            : type == 'Material'
                                                ? Icon(Icons.inventory_2_rounded, size: 14, color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary)
                                                : null,
                                        label: Text(type),
                                        labelStyle: TextStyle(
                                          fontSize: 12,
                                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                          color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary,
                                        ),
                                        selected: isSelected,
                                        selectedColor: AppColors.primaryYellow,
                                        backgroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(10),
                                          side: BorderSide(
                                            color: isSelected ? AppColors.primaryYellow : AppColors.borderLight,
                                            width: 1.2,
                                          ),
                                        ),
                                        onSelected: (val) {
                                          if (val) setState(() => _selectedTypeFilter = type);
                                        },
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Expense List Items or Empty State
                    if (filteredExpenses.isEmpty)
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
                                    Icons.receipt_long_rounded,
                                    size: 32,
                                    color: AppColors.darkCharcoal,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'No Expenses Found',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Tap the + button at the bottom right to record an expense.',
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
                              final exp = filteredExpenses[index];
                              final amount = (num.tryParse(exp['amount']?.toString() ?? '0') ?? 0);
                              final workCategory = (exp['work_category'] ?? 'Expense').toString();
                              final site = (exp['site_name'] ?? '-').toString();
                              final type = (exp['category'] ?? 'Labour').toString();
                              final date = (exp['date'] ?? '').toString();
                              final paymentMode = (exp['payment_mode'] ?? 'Cash').toString();
                              final notes = (exp['notes'] ?? '').toString();
                              final enteredBy = (exp['entered_by'] ?? '').toString();
                              final isLabour = type.toLowerCase() == 'labour';

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
                                    onTap: () => _showExpenseDetailsSheet(exp),
                                    borderRadius: BorderRadius.circular(16),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Top Row: Category Icon + Title & Amount
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                width: 42,
                                                height: 42,
                                                decoration: BoxDecoration(
                                                  color: isLabour ? AppColors.lightYellowBg : Colors.blue.shade50,
                                                  borderRadius: BorderRadius.circular(12),
                                                  border: Border.all(
                                                    color: isLabour ? AppColors.primaryYellow : Colors.blue.shade200,
                                                    width: 1.2,
                                                  ),
                                                ),
                                                child: Icon(
                                                  _getCategoryIcon(workCategory),
                                                  color: isLabour ? AppColors.darkCharcoal : Colors.blue.shade800,
                                                  size: 20,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      workCategory,
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
                                                _formatCurrency(amount),
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

                                          // Middle Badges: Type, Date, Payment Mode
                                          Row(
                                            children: [
                                              // Type Badge
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: isLabour ? AppColors.primaryYellow.withValues(alpha: 0.25) : Colors.blue.shade50,
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Icon(
                                                      isLabour ? Icons.groups_rounded : Icons.inventory_2_rounded,
                                                      size: 13,
                                                      color: isLabour ? AppColors.darkCharcoal : Colors.blue.shade800,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      type,
                                                      style: TextStyle(
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.w800,
                                                        color: isLabour ? AppColors.darkCharcoal : Colors.blue.shade800,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 8),

                                              // Payment Mode Badge
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: AppColors.inputBackground,
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Icon(
                                                      paymentMode.toLowerCase() == 'gpay'
                                                          ? Icons.qr_code_rounded
                                                          : paymentMode.toLowerCase() == 'bank'
                                                              ? Icons.account_balance_rounded
                                                              : Icons.payments_rounded,
                                                      size: 13,
                                                      color: AppColors.textSecondary,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      paymentMode,
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.w700,
                                                        color: AppColors.textSecondary,
                                                      ),
                                                    ),
                                                  ],
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

                                          // Notes / Worker Details (if available)
                                          if (notes.isNotEmpty) ...[
                                            const SizedBox(height: 8),
                                            Container(
                                              width: double.infinity,
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFF8FAFC),
                                                borderRadius: BorderRadius.circular(8),
                                                border: Border.all(color: AppColors.borderLight),
                                              ),
                                              child: Text(
                                                notes,
                                                style: const TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.textSecondary,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],

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
                            childCount: filteredExpenses.length,
                          ),
                        ),
                      ),
                  ],
                );
              },
            );
          },
        ),

        // Bottom-Right Add Expense Pop Icon (Floating Action Button)
        Positioned(
          right: 20,
          bottom: 20,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddExpenseScreen()),
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
