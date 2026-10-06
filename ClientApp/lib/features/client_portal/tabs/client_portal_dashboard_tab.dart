import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

class ClientPortalDashboardTab extends StatelessWidget {
  final String siteName;
  final Function(int tabIndex) onNavigateToTab;

  const ClientPortalDashboardTab({
    super.key,
    required this.siteName,
    required this.onNavigateToTab,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Live Site Overview Header Card
          _buildSiteOverviewCard(),

          const SizedBox(height: 18),

          // 2. Financial Metrics Grid
          _buildFinancialMetricsSection(),

          const SizedBox(height: 20),

          // 3. Quick Navigation Cards to Other Tabs
          _buildQuickActionCards(context),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSiteOverviewCard() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('sites').snapshots(),
      builder: (context, snapshot) {
        Map<String, dynamic> siteData = {};

        if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
          for (final doc in snapshot.data!.docs) {
            final raw = doc.data();
            if (raw is Map) {
              final d = Map<String, dynamic>.from(raw);
              final sName = d['site_name']?.toString() ?? '';
              final sId = d['site_id']?.toString() ?? '';
              if (sName.toLowerCase() == siteName.toLowerCase() ||
                  sId.toLowerCase() == siteName.toLowerCase()) {
                siteData = d;
                break;
              }
            }
          }
        }

        final clientName = siteData['client_name']?.toString() ?? 'Valued Client';
        final location = siteData['location']?.toString() ?? 'Tamil Nadu, India';
        final status = siteData['status']?.toString() ?? 'In Progress';
        final progress = (siteData['progress_percentage'] is num)
            ? (siteData['progress_percentage'] as num).toDouble()
            : 0.0;
        final structureType = siteData['structure_type']?.toString() ?? 'Construction Project';
        final supervisor = siteData['supervisor_in_charge']?.toString() ?? 'Site Engineer';
        final areaSqft = siteData['builtup_area_sqft']?.toString() ?? '-';
        final floors = siteData['number_of_floors']?.toString() ?? '-';

        return Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
            border: Border.all(
              color: AppColors.primaryYellow.withValues(alpha: 0.3),
              width: 1.5,
            ),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Site Tag & Live Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryYellow,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_rounded, size: 14, color: AppColors.darkCharcoal),
                        SizedBox(width: 4),
                        Text(
                          'OFFICIAL CLIENT PORTAL',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: AppColors.darkCharcoal,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF10B981), width: 1),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircleAvatar(radius: 3, backgroundColor: Color(0xFF10B981)),
                        SizedBox(width: 5),
                        Text(
                          'Live Synced',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF34D399),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Client and Site Name
              Text(
                siteName,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.person_rounded, size: 14, color: AppColors.primaryYellow),
                  const SizedBox(width: 4),
                  Text(
                    clientName,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.location_on_rounded, size: 14, color: AppColors.primaryYellow),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      location,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Colors.white70,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              // Progress Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Construction Phase: $status',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    '${progress.toInt()}% Complete',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primaryYellow,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: (progress / 100.0).clamp(0.0, 1.0),
                  minHeight: 8,
                  backgroundColor: Colors.white.withValues(alpha: 0.15),
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryYellow),
                ),
              ),

              const SizedBox(height: 16),

              // Specifications Pills
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildSpecBadge(Icons.domain_rounded, structureType),
                  _buildSpecBadge(Icons.straighten_rounded, '$areaSqft Sft.'),
                  _buildSpecBadge(Icons.layers_rounded, floors),
                  _buildSpecBadge(Icons.badge_rounded, 'Supv: $supervisor'),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSpecBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.primaryYellow),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialMetricsSection() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('monthly_billings').snapshots(),
      builder: (context, monthlySnap) {
        Map<String, dynamic> monthlyData = {};

        if (monthlySnap.hasData && monthlySnap.data!.docs.isNotEmpty) {
          for (final doc in monthlySnap.data!.docs) {
            final raw = doc.data();
            if (raw is Map) {
              final d = Map<String, dynamic>.from(raw);
              final sName = d['site_name']?.toString() ?? '';
              final docId = doc.id;
              if (sName.toLowerCase() == siteName.toLowerCase() ||
                  docId.toLowerCase() == siteName.toLowerCase() ||
                  docId.toLowerCase() == 'monthly-${siteName.toLowerCase().replaceAll(' ', '-')}') {
                monthlyData = d;
                break;
              }
            }
          }
        }

        final grossTotal = monthlyData['gross_total'] ?? monthlyData['gross_total_amount'] ?? 0;
        final totalReceived = monthlyData['total_received'] ?? monthlyData['total_received_combined'] ?? 0;
        final balanceDue = monthlyData['balance_amount'] ?? 0;
        final netSettlement = monthlyData['net_balance'] ?? monthlyData['net_balance_manual'] ?? 0;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 6),
              child: Row(
                children: [
                  Icon(Icons.account_balance_wallet_rounded, size: 18, color: AppColors.darkCharcoal),
                  SizedBox(width: 6),
                  Text(
                    'Financial Snapshot',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.darkCharcoal,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'GROSS TOTAL BILL',
                    amount: '₹ ${CurrencyFormatter.format(grossTotal)}',
                    subtext: 'Main Structure + Extra Work',
                    color: const Color(0xFF0F172A),
                    accentColor: AppColors.primaryYellow,
                    icon: Icons.calculate_rounded,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard(
                    title: 'TOTAL RECEIVED',
                    amount: '₹ ${CurrencyFormatter.format(totalReceived)}',
                    subtext: 'Paid to Date',
                    color: const Color(0xFF065F46),
                    accentColor: const Color(0xFF10B981),
                    icon: Icons.payments_rounded,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: 'BALANCE DUE',
                    amount: '₹ ${CurrencyFormatter.format(balanceDue)}',
                    subtext: 'Pending Clearance',
                    color: const Color(0xFF9A3412),
                    accentColor: const Color(0xFFF97316),
                    icon: Icons.pending_actions_rounded,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard(
                    title: 'NET SETTLEMENT',
                    amount: '₹ ${CurrencyFormatter.format(netSettlement)}',
                    subtext: 'Final Settlement Balance',
                    color: const Color(0xFF1E3A8A),
                    accentColor: const Color(0xFF3B82F6),
                    icon: Icons.fact_check_rounded,
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String amount,
    required String subtext,
    required Color color,
    required Color accentColor,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
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
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textMuted,
                    letterSpacing: 0.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 14, color: accentColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            amount,
            style: TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w900,
              color: color,
              letterSpacing: -0.3,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Text(
            subtext,
            style: const TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w500,
              color: AppColors.textMuted,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCards(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          child: Text(
            'Client Portal Modules',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.darkCharcoal,
            ),
          ),
        ),
        const SizedBox(height: 6),

        // 1. Monthly Bill Status Card
        _buildActionTile(
          icon: Icons.receipt_long_rounded,
          iconColor: const Color(0xFFD97706),
          bgColor: const Color(0xFFFEF3C7),
          title: 'Monthly Bill Status',
          subtitle: 'Itemized built-up area valuation, amenities, and net settlement',
          onTap: () => onNavigateToTab(1),
        ),

        const SizedBox(height: 10),

        // 2. Payment Breakup Details Card
        _buildActionTile(
          icon: Icons.pie_chart_rounded,
          iconColor: const Color(0xFF2563EB),
          bgColor: const Color(0xFFDBEAFE),
          title: 'Payment Breakup Details',
          subtitle: 'Stage-wise milestone construction schedule & amounts',
          onTap: () => onNavigateToTab(2),
        ),

        const SizedBox(height: 10),

        // 3. Additional Billing Card
        _buildActionTile(
          icon: Icons.post_add_rounded,
          iconColor: const Color(0xFF059669),
          bgColor: const Color(0xFFD1FAE5),
          title: 'Additional Billing',
          subtitle: 'Extra scope vouchers, quoted amounts and expenses',
          onTap: () => onNavigateToTab(3),
        ),
      ],
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, size: 24, color: iconColor),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.darkCharcoal,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 15, color: Color(0xFF94A3B8)),
          ],
        ),
      ),
    );
  }
}
