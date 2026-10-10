import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';

class AdminPaymentScreen extends StatefulWidget {
  const AdminPaymentScreen({super.key});

  @override
  State<AdminPaymentScreen> createState() => _AdminPaymentScreenState();
}

class _AdminPaymentScreenState extends State<AdminPaymentScreen> {
  String _selectedSiteFilter = 'All';
  String _selectedModeFilter = 'All'; // 'All', 'Cash', 'GPay / UPI', 'Bank'
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

  String _formatDateHeader(String rawDate) {
    if (rawDate.trim().isEmpty) return 'Other Dates';
    try {
      DateTime? dt;
      if (rawDate.contains('-')) {
        final parts = rawDate.split('-');
        if (parts.length == 3) {
          if (parts[0].length == 4) {
            dt = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
          } else {
            dt = DateTime(int.parse(parts[2]), int.parse(parts[1]), int.parse(parts[0]));
          }
        }
      } else if (rawDate.contains('/')) {
        final parts = rawDate.split('/');
        if (parts.length == 3) {
          if (parts[2].length == 4) {
            dt = DateTime(int.parse(parts[2]), int.parse(parts[1]), int.parse(parts[0]));
          } else {
            dt = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
          }
        }
      }

      if (dt != null) {
        final now = DateTime.now();
        final today = DateTime(now.year, now.month, now.day);
        final checkDate = DateTime(dt.year, dt.month, dt.day);
        final diffDays = today.difference(checkDate).inDays;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        final formatted = '${dt.day.toString().padLeft(2, '0')} ${months[dt.month - 1]} ${dt.year}';
        final weekday = weekdays[dt.weekday - 1];

        if (diffDays == 0) {
          return 'Today • $formatted';
        } else if (diffDays == 1) {
          return 'Yesterday • $formatted';
        } else {
          return '$weekday • $formatted';
        }
      }
    } catch (_) {}
    return rawDate;
  }

  IconData _getModeIcon(String mode) {
    final m = mode.toLowerCase();
    if (m.contains('cash')) return Icons.payments_rounded;
    if (m.contains('gpay') || m.contains('upi')) return Icons.qr_code_rounded;
    if (m.contains('bank')) return Icons.account_balance_rounded;
    return Icons.receipt_long_rounded;
  }

  Color _getModeColor(String mode) {
    final m = mode.toLowerCase();
    if (m.contains('cash')) return const Color(0xFFD97706); // Amber
    if (m.contains('gpay') || m.contains('upi')) return const Color(0xFF2563EB); // Blue
    if (m.contains('bank')) return const Color(0xFF7C3AED); // Purple
    return const Color(0xFF059669); // Green
  }

  Future<void> _deletePayment(String payId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Payment Record?'),
        content: const Text('Are you sure you want to delete this payment receipt? This will update the project balance.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await FirebaseFirestore.instance.collection('payments').doc(payId).delete();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment record deleted'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showAddPaymentPopup(List<QueryDocumentSnapshot> siteDocs) {
    final siteList = siteDocs.map((d) {
      final m = d.data() as Map<String, dynamic>;
      return (m['site_name'] ?? m['title'] ?? m['site_id'] ?? d.id).toString();
    }).toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AddPaymentModal(
        siteDocs: siteDocs,
        siteList: siteList,
        initialSite: _selectedSiteFilter != 'All' ? _selectedSiteFilter : (siteList.isNotEmpty ? siteList.first : null),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('sites').snapshots(),
      builder: (context, sitesSnap) {
        return StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance.collection('payments').snapshots(),
          builder: (context, paymentsSnap) {
            final siteDocs = sitesSnap.data?.docs ?? [];
            final siteList = siteDocs.map((d) {
              final m = d.data() as Map<String, dynamic>;
              return (m['site_name'] ?? m['title'] ?? m['site_id'] ?? d.id).toString();
            }).toList();

            final paymentDocs = paymentsSnap.data?.docs ?? [];
            final allPayments = paymentDocs.map((d) {
              final m = d.data() as Map<String, dynamic>;
              m['doc_id'] = d.id;
              return m;
            }).toList();

            // Filter payments
            final filteredPayments = allPayments.filter((pay) {
              // Site filter
              if (_selectedSiteFilter != 'All') {
                final s = (pay['site_name'] ?? '').toString();
                if (s.toLowerCase() != _selectedSiteFilter.toLowerCase()) return false;
              }
              // Payment mode filter
              if (_selectedModeFilter != 'All') {
                final mode = (pay['payment_mode'] ?? '').toString().toLowerCase();
                if (!mode.contains(_selectedModeFilter.toLowerCase())) return false;
              }
              // Search query
              if (_searchQuery.isNotEmpty) {
                final q = _searchQuery.toLowerCase();
                final client = (pay['client_name'] ?? '').toString().toLowerCase();
                final site = (pay['site_name'] ?? '').toString().toLowerCase();
                final mode = (pay['payment_mode'] ?? '').toString().toLowerCase();
                final recBy = (pay['received_by'] ?? pay['entered_by'] ?? '').toString().toLowerCase();
                final payId = (pay['payment_id'] ?? '').toString().toLowerCase();
                if (!client.contains(q) &&
                    !site.contains(q) &&
                    !mode.contains(q) &&
                    !recBy.contains(q) &&
                    !payId.contains(q)) {
                  return false;
                }
              }
              return true;
            }).toList();

            // Compute summary stats
            double totalCollected = 0;
            double cashCollected = 0;
            double upiCollected = 0;
            double bankCollected = 0;

            for (final pay in filteredPayments) {
              final amt = (num.tryParse(pay['amount_received']?.toString() ?? pay['amount']?.toString() ?? '0') ?? 0).toDouble();
              totalCollected += amt;
              final mode = (pay['payment_mode'] ?? '').toString().toLowerCase();
              if (mode.contains('cash')) {
                cashCollected += amt;
              } else if (mode.contains('gpay') || mode.contains('upi')) {
                upiCollected += amt;
              } else if (mode.contains('bank')) {
                bankCollected += amt;
              }
            }

            // Group payments by date for history ledger
            final Map<String, List<Map<String, dynamic>>> groupedPayments = {};
            for (final pay in filteredPayments) {
              final d = (pay['payment_date'] ?? pay['date'] ?? '').toString().trim();
              final key = d.isNotEmpty ? d : 'Other Dates';
              groupedPayments.putIfAbsent(key, () => []).add(pay);
            }

            final groupKeys = groupedPayments.keys.toList();
            groupKeys.sort((a, b) {
              if (a == 'Other Dates') return 1;
              if (b == 'Other Dates') return -1;
              return b.compareTo(a);
            });

            return Stack(
              children: [
                CustomScrollView(
                  physics: const BouncingScrollPhysics(),
                  slivers: [
                    // Top Header & Metrics Banner
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
                                      'COLLECTIONS TRACKER',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textMuted,
                                        letterSpacing: 1.1,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Payment History',
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
                                  child: const Row(
                                    children: [
                                      Icon(Icons.history_rounded, color: AppColors.primaryYellow, size: 14),
                                      SizedBox(width: 5),
                                      Text(
                                        'Ledger',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 16),

                            // Total Collections Stat Card
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: AppColors.cardWhite,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: AppColors.borderLight),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.05),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFECFDF5),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: const Icon(Icons.account_balance_wallet_rounded, color: Color(0xFF059669), size: 20),
                                          ),
                                          const SizedBox(width: 10),
                                          const Text(
                                            'Total Client Received',
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFEF3C7),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          '${filteredPayments.length} Receipts',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: Color(0xFF92400E),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    _formatCurrency(totalCollected),
                                    style: const TextStyle(
                                      fontSize: 26,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF047857),
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  // Mode breakdown mini-chips
                                  Row(
                                    children: [
                                      _buildModeMiniStat('Cash', cashCollected, const Color(0xFFD97706)),
                                      const SizedBox(width: 8),
                                      _buildModeMiniStat('GPay/UPI', upiCollected, const Color(0xFF2563EB)),
                                      const SizedBox(width: 8),
                                      _buildModeMiniStat('Bank', bankCollected, const Color(0xFF7C3AED)),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Search Field
                            TextField(
                              controller: _searchController,
                              onChanged: (val) => setState(() => _searchQuery = val.trim()),
                              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                              decoration: InputDecoration(
                                hintText: 'Search client, site, receipt ID...',
                                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                                prefixIcon: const Icon(Icons.search_rounded, size: 20, color: AppColors.textSecondary),
                                suffixIcon: _searchQuery.isNotEmpty
                                    ? IconButton(
                                        icon: const Icon(Icons.clear_rounded, size: 18),
                                        onPressed: () {
                                          _searchController.clear();
                                          setState(() => _searchQuery = '');
                                        },
                                      )
                                    : null,
                                filled: true,
                                fillColor: AppColors.cardWhite,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5)),
                              ),
                            ),

                            const SizedBox(height: 12),

                            // Site Filter Dropdown
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.cardWhite,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.borderLight),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _selectedSiteFilter,
                                  isExpanded: true,
                                  icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.darkCharcoal),
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _selectedSiteFilter = val);
                                  },
                                  items: ['All', ...siteList].map((site) {
                                    return DropdownMenuItem<String>(
                                      value: site,
                                      child: Row(
                                        children: [
                                          const Icon(Icons.business_rounded, size: 16, color: AppColors.darkCharcoal),
                                          const SizedBox(width: 8),
                                          Text(site == 'All' ? 'All Registered Sites' : site),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                            ),

                            const SizedBox(height: 12),

                            // Payment Mode Filter Chips
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              physics: const BouncingScrollPhysics(),
                              child: Row(
                                children: ['All', 'Cash', 'GPay / UPI', 'Bank'].map((mode) {
                                  final isSelected = _selectedModeFilter == mode;
                                  return Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: ChoiceChip(
                                      label: Text(mode),
                                      selected: isSelected,
                                      selectedColor: AppColors.primaryYellow,
                                      backgroundColor: AppColors.cardWhite,
                                      labelStyle: TextStyle(
                                        fontSize: 12,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                        color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                        side: BorderSide(
                                          color: isSelected ? AppColors.darkYellow : AppColors.borderLight,
                                        ),
                                      ),
                                      onSelected: (selected) {
                                        if (selected) setState(() => _selectedModeFilter = mode);
                                      },
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Empty State or Grouped Payment Receipts Ledger
                    if (filteredPayments.isEmpty)
                      SliverToBoxAdapter(
                        child: Container(
                          margin: const EdgeInsets.all(24),
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            color: AppColors.cardWhite,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.payments_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 14),
                              const Text(
                                'No payment collections found',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Tap the + button below to record received client payments.',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, groupIdx) {
                            final dateKey = groupKeys[groupIdx];
                            final dayPayments = groupedPayments[dateKey] ?? [];

                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Date Header Timeline Chip
                                  Padding(
                                    padding: const EdgeInsets.only(left: 4, bottom: 8, top: 4),
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: AppColors.darkCharcoal,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            _formatDateHeader(dateKey),
                                            style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                              letterSpacing: 0.3,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '${dayPayments.length} ${dayPayments.length == 1 ? 'receipt' : 'receipts'}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Payment Receipt Cards for this date
                                  ...dayPayments.map((pay) {
                                    final amt = (num.tryParse(pay['amount_received']?.toString() ?? pay['amount']?.toString() ?? '0') ?? 0).toDouble();
                                    final mode = (pay['payment_mode'] ?? 'Cash').toString();
                                    final siteName = (pay['site_name'] ?? 'Site').toString();
                                    final clientName = (pay['client_name'] ?? '').toString();
                                    final recBy = (pay['received_by'] ?? pay['entered_by'] ?? 'Admin').toString();
                                    final payId = (pay['payment_id'] ?? pay['doc_id'] ?? '').toString();
                                    final recFor = (pay['received_for'] ?? pay['payment_type'] ?? 'Quoted Amount').toString();
                                    final isAdditional = recFor.toLowerCase().contains('additional');
                                    final modeColor = _getModeColor(mode);

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 10),
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(
                                        color: AppColors.cardWhite,
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
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Row 1: Mode Icon, Client & Site Info, Amount
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              // Mode Avatar Icon
                                              Container(
                                                width: 42,
                                                height: 42,
                                                decoration: BoxDecoration(
                                                  color: modeColor.withValues(alpha: 0.12),
                                                  borderRadius: BorderRadius.circular(12),
                                                ),
                                                child: Icon(_getModeIcon(mode), color: modeColor, size: 22),
                                              ),
                                              const SizedBox(width: 12),

                                              // Client Name & Site Name
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      clientName.isNotEmpty ? clientName : siteName,
                                                      style: const TextStyle(
                                                        fontSize: 15,
                                                        fontWeight: FontWeight.w700,
                                                        color: AppColors.textPrimary,
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                    const SizedBox(height: 3),
                                                    Row(
                                                      children: [
                                                        const Icon(Icons.business_rounded, size: 12, color: AppColors.textSecondary),
                                                        const SizedBox(width: 4),
                                                        Flexible(
                                                          child: Text(
                                                            siteName,
                                                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                                            overflow: TextOverflow.ellipsis,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),

                                              // Amount Received in Bold Green
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.end,
                                                children: [
                                                  Text(
                                                    '+ ${_formatCurrency(amt)}',
                                                    style: const TextStyle(
                                                      fontSize: 16,
                                                      fontWeight: FontWeight.w900,
                                                      color: Color(0xFF047857),
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                        margin: const EdgeInsets.only(right: 4),
                                                        decoration: BoxDecoration(
                                                          color: isAdditional ? const Color(0xFFEDE9FE) : const Color(0xFFE0F2FE),
                                                          borderRadius: BorderRadius.circular(6),
                                                        ),
                                                        child: Text(
                                                          isAdditional ? 'Additional' : 'Quoted',
                                                          style: TextStyle(
                                                            fontSize: 9,
                                                            fontWeight: FontWeight.w700,
                                                            color: isAdditional ? const Color(0xFF6D28D9) : const Color(0xFF0369A1),
                                                          ),
                                                        ),
                                                      ),
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                                        decoration: BoxDecoration(
                                                          color: modeColor.withValues(alpha: 0.12),
                                                          borderRadius: BorderRadius.circular(6),
                                                        ),
                                                        child: Text(
                                                          mode,
                                                          style: TextStyle(
                                                            fontSize: 10,
                                                            fontWeight: FontWeight.w700,
                                                            color: modeColor,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),

                                          const SizedBox(height: 10),
                                          Divider(height: 1, color: Colors.grey.shade100),
                                          const SizedBox(height: 8),

                                          // Row 2: Metadata (Received By, Payment ID, Delete)
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Row(
                                                children: [
                                                  const Icon(Icons.person_rounded, size: 13, color: AppColors.textMuted),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    'Recd: $recBy',
                                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                                                  ),
                                                  if (payId.isNotEmpty) ...[
                                                    const SizedBox(width: 8),
                                                    Text(
                                                      '• $payId',
                                                      style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontFamily: 'monospace'),
                                                    ),
                                                  ],
                                                ],
                                              ),

                                              // Delete receipt action
                                              InkWell(
                                                onTap: () => _deletePayment(pay['doc_id'] ?? pay['payment_id']),
                                                borderRadius: BorderRadius.circular(6),
                                                child: Padding(
                                                  padding: const EdgeInsets.all(4),
                                                  child: Icon(Icons.delete_outline_rounded, size: 16, color: Colors.grey.shade400),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    );
                                  }),
                                ],
                              ),
                            );
                          },
                          childCount: groupKeys.length,
                        ),
                      ),

                    // Spacer for Floating Action Button
                    const SliverToBoxAdapter(
                      child: SizedBox(height: 90),
                    ),
                  ],
                ),

                // Bottom-Right Add Payment Pop Icon (Floating Action Button)
                Positioned(
                  right: 20,
                  bottom: 20,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _showAddPaymentPopup(siteDocs),
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
          },
        );
      },
    );
  }

  Widget _buildModeMiniStat(String label, double amount, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w700)),
            const SizedBox(height: 2),
            Text(_formatCurrency(amount), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }
}

extension ListFilterExtension<T> on List<T> {
  List<T> filter(bool Function(T element) test) {
    return where(test).toList();
  }
}

/// Pop-up Form Modal Widget for Recording Client Payments
class _AddPaymentModal extends StatefulWidget {
  final List<QueryDocumentSnapshot> siteDocs;
  final List<String> siteList;
  final String? initialSite;

  const _AddPaymentModal({
    required this.siteDocs,
    required this.siteList,
    this.initialSite,
  });

  @override
  State<_AddPaymentModal> createState() => _AddPaymentModalState();
}

class _AddPaymentModalState extends State<_AddPaymentModal> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedSite;
  String? _selectedClient;
  String _paymentMode = 'Cash';
  String _receivedFor = 'Quoted Amount'; // 'Quoted Amount' | 'Additional Amount'
  String? _receivedBy = 'Suriya Prakash';
  DateTime _paymentDate = DateTime.now();
  final _amountController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialSite != null && widget.siteList.contains(widget.initialSite)) {
      _selectedSite = widget.initialSite;
    } else if (widget.siteList.isNotEmpty) {
      _selectedSite = widget.siteList.first;
    }
    _resolveClient();
  }

  void _resolveClient() {
    if (_selectedSite == null) return;
    for (final d in widget.siteDocs) {
      final m = d.data() as Map<String, dynamic>;
      final sName = (m['site_name'] ?? m['title'] ?? m['site_id'] ?? d.id).toString();
      if (sName.toLowerCase() == _selectedSite!.toLowerCase()) {
        _selectedClient = (m['client_name'] ?? m['customer_name'] ?? m['client'] ?? '').toString();
        break;
      }
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _savePayment() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSite == null || _selectedSite!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a site')),
      );
      return;
    }

    final amountNum = double.tryParse(_amountController.text.replaceAll(',', '')) ?? 0.0;
    setState(() => _isSaving = true);

    try {
      final payId = 'PAY-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
      final dateStr = '${_paymentDate.year}-${_paymentDate.month.toString().padLeft(2, '0')}-${_paymentDate.day.toString().padLeft(2, '0')}';

      await FirebaseFirestore.instance.collection('payments').doc(payId).set({
        'payment_id': payId,
        'site_name': _selectedSite,
        'client_name': _selectedClient ?? '',
        'amount_received': amountNum,
        'amount': amountNum,
        'payment_date': dateStr,
        'date': dateStr,
        'payment_mode': _paymentMode,
        'received_for': _receivedFor,
        'payment_type': _receivedFor,
        'received_by': _receivedBy ?? 'Suriya Prakash',
        'entered_by': _receivedBy ?? 'Suriya Prakash',
        'created_at': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white),
                SizedBox(width: 8),
                Text('Payment recorded successfully!'),
              ],
            ),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving payment: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Grab handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Title Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Client Collections',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Payment Received',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Record client payments and update receivables',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Select Site
              _buildLabel('Select Site'),
              _buildDropdown(
                value: _selectedSite ?? (widget.siteList.isNotEmpty ? widget.siteList.first : 'No sites available'),
                items: widget.siteList.isNotEmpty ? widget.siteList : ['No sites available'],
                icon: Icons.business_rounded,
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedSite = val;
                      _resolveClient();
                    });
                  }
                },
              ),
              const SizedBox(height: 16),

              // Date Picker
              _buildLabel('Date'),
              InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _paymentDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2030),
                  );
                  if (picked != null) setState(() => _paymentDate = picked);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.cardWhite,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 18, color: AppColors.textSecondary),
                          const SizedBox(width: 10),
                          Text(
                            '${_paymentDate.day.toString().padLeft(2, '0')}/${_paymentDate.month.toString().padLeft(2, '0')}/${_paymentDate.year}',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                          ),
                        ],
                      ),
                      const Icon(Icons.edit_calendar_rounded, size: 18, color: AppColors.textSecondary),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Amount Received
              _buildLabel('Amount Received (₹)'),
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'e.g. 50,000',
                  hintStyle: const TextStyle(fontSize: 14, color: AppColors.textMuted),
                  prefixIcon: const Icon(Icons.currency_rupee_rounded, color: AppColors.textSecondary, size: 18),
                  filled: true,
                  fillColor: AppColors.cardWhite,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderLight)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryYellow, width: 1.5)),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter amount received';
                  if (double.tryParse(val.replaceAll(',', '')) == null) return 'Enter a valid number';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Received For Dropdown (Quoted Amount vs Additional Amount)
              _buildLabel('Received For'),
              _buildDropdown(
                value: _receivedFor,
                items: const ['Quoted Amount', 'Additional Amount'],
                icon: Icons.layers_rounded,
                onChanged: (val) {
                  if (val != null) setState(() => _receivedFor = val);
                },
              ),
              const SizedBox(height: 16),

              // Payment Mode Segmented Selector
              _buildLabel('Payment Mode'),
              Row(
                children: [
                  _buildModeOption('Cash', Icons.payments_rounded),
                  const SizedBox(width: 8),
                  _buildModeOption('GPay / UPI', Icons.qr_code_rounded),
                  const SizedBox(width: 8),
                  _buildModeOption('Bank', Icons.account_balance_rounded),
                ],
              ),
              const SizedBox(height: 16),

              // Received By Dropdown
              _buildLabel('Received By'),
              _buildDropdown(
                value: _receivedBy ?? 'Suriya Prakash',
                items: const ['Suriya Prakash', 'Bala'],
                icon: Icons.person_rounded,
                onChanged: (val) => setState(() => _receivedBy = val),
              ),
              const SizedBox(height: 24),

              // Save Payment Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _savePayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryYellow,
                    foregroundColor: AppColors.darkCharcoal,
                    elevation: 3,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.darkCharcoal),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.assignment_turned_in_rounded, size: 20),
                            SizedBox(width: 8),
                            Text('Save Payment', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required List<String> items,
    required IconData icon,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: items.contains(value) ? value : (items.isNotEmpty ? items.first : null),
          isExpanded: true,
          icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.darkCharcoal),
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
          onChanged: onChanged,
          items: items.map((item) {
            return DropdownMenuItem<String>(
              value: item,
              child: Row(
                children: [
                  Icon(icon, size: 18, color: AppColors.darkCharcoal),
                  const SizedBox(width: 10),
                  Text(item),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildModeOption(String label, IconData icon) {
    final isSelected = _paymentMode == label;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _paymentMode = label),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryYellow : AppColors.backgroundLight,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.darkYellow : AppColors.borderLight,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 18, color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? AppColors.darkCharcoal : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
