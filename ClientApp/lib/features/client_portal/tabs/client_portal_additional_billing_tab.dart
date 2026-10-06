import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

class ClientPortalAdditionalBillingTab extends StatelessWidget {
  final String siteName;

  const ClientPortalAdditionalBillingTab({
    super.key,
    required this.siteName,
  });

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('additional_billing').snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primaryYellow),
          );
        }

        List<Map<String, dynamic>> siteBills = [];

        if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
          for (final doc in snapshot.data!.docs) {
            final raw = doc.data();
            if (raw is Map) {
              final data = Map<String, dynamic>.from(raw);
              final sName = data['site_name']?.toString() ?? '';
              if (sName.toLowerCase() == siteName.toLowerCase()) {
                siteBills.add({
                  ...data,
                  'id': doc.id,
                });
              }
            }
          }
        }

        if (siteBills.isEmpty) {
          return _buildEmptyState();
        }

        return _buildAdditionalBillingList(siteBills);
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFD1FAE5),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF10B981), width: 2),
              ),
              child: const Icon(
                Icons.post_add_rounded,
                size: 48,
                color: Color(0xFF059669),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No Additional Billing for "$siteName"',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.darkCharcoal,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'When extra scope or customized material upgrades are added for this site in the Admin Panel, official additional work invoices will appear here.',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textMuted,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdditionalBillingList(List<Map<String, dynamic>> bills) {
    double totalApproved = 0;
    double totalQuoted = 0;
    double totalExpense = 0;

    for (final b in bills) {
      totalApproved += (double.tryParse(b['amount']?.toString() ?? '') ??
          double.tryParse(b['quoted_amount']?.toString() ?? '') ??
          0);
      totalQuoted += (double.tryParse(b['quoted_amount']?.toString() ?? '') ??
          double.tryParse(b['amount']?.toString() ?? '') ??
          0);
      totalExpense += (double.tryParse(b['expense_amount']?.toString() ?? '') ?? 0);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Total Summary Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF065F46), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
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
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryYellow,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'EXTRA SCOPE BILLING',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w900,
                          color: AppColors.darkCharcoal,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    Text(
                      '${bills.length} Invoices Found',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Text(
                  'TOTAL ADDITIONAL WORK VALUE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white60,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '₹ ${CurrencyFormatter.format(totalApproved)}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildSubMetric('Total Quoted', '₹ ${CurrencyFormatter.format(totalQuoted)}'),
                    const SizedBox(width: 16),
                    _buildSubMetric('Total Expense', '₹ ${CurrencyFormatter.format(totalExpense)}'),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Section Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Extra Scope Work Expenses',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.darkCharcoal,
                ),
              ),
              Text(
                'Site: $siteName',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Invoice Cards
          ...bills.map((bill) => _buildInvoiceCard(bill)),

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSubMetric(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.white60),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildInvoiceCard(Map<String, dynamic> bill) {
    final billId = bill['bill_id']?.toString() ?? 'ADD-BILL';
    final billingDate = bill['billing_date']?.toString() ?? 'N/A';
    final category = bill['category']?.toString() ?? 'Extra Scope';
    final description = bill['work_description']?.toString() ?? 'Additional work scope';
    final quotedAmount = bill['quoted_amount'] ?? bill['amount'] ?? 0;
    final expenseAmount = bill['expense_amount'] ?? 0;
    final amountInRs = bill['amount'] ?? bill['quoted_amount'] ?? 0;
    final notes = bill['notes']?.toString();

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryYellow.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.receipt_rounded, size: 16, color: AppColors.darkCharcoal),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      billId,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w900,
                        color: AppColors.darkCharcoal,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    category,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2563EB),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Body Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Work Scope Description
                const Text(
                  'Work Description:',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkCharcoal,
                    height: 1.35,
                  ),
                ),

                const SizedBox(height: 14),

                // Financial Trio (Quoted, Expense, Approved Amount in Rs.)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildFinancialCell(
                          'Quoted Amount',
                          '₹ ${CurrencyFormatter.format(quotedAmount)}',
                          const Color(0xFF1E293B),
                        ),
                      ),
                      Container(width: 1, height: 32, color: const Color(0xFFE2E8F0)),
                      Expanded(
                        child: _buildFinancialCell(
                          'Expense Amount',
                          '₹ ${CurrencyFormatter.format(expenseAmount)}',
                          const Color(0xFF64748B),
                        ),
                      ),
                      Container(width: 1, height: 32, color: const Color(0xFFE2E8F0)),
                      Expanded(
                        child: _buildFinancialCell(
                          'Amount in Rs.',
                          '₹ ${CurrencyFormatter.format(amountInRs)}',
                          const Color(0xFF047857),
                          isBold: true,
                        ),
                      ),
                    ],
                  ),
                ),

                // Notes / Reference if available
                if (notes != null && notes.trim().isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFF64748B)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Notes: $notes',
                          style: const TextStyle(
                            fontSize: 11.5,
                            color: Color(0xFF64748B),
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 8),

                // Billing Date
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Icon(Icons.calendar_today_rounded, size: 12, color: Color(0xFF94A3B8)),
                    const SizedBox(width: 4),
                    Text(
                      'Billed on: $billingDate',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF94A3B8),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialCell(String label, String value, Color color, {bool isBold = false}) {
    return Column(
      children: [
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 9.5,
            fontWeight: FontWeight.w700,
            color: Color(0xFF64748B),
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 3),
        Text(
          value,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: isBold ? 12.5 : 11.5,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.w700,
            color: color,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
