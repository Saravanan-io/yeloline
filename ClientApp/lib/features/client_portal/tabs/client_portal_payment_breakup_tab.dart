import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

class ClientPortalPaymentBreakupTab extends StatelessWidget {
  final String siteName;

  const ClientPortalPaymentBreakupTab({
    super.key,
    required this.siteName,
  });

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('payment_breakups').snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primaryYellow),
          );
        }

        Map<String, dynamic>? breakupData;

        if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
          for (final doc in snapshot.data!.docs) {
            final raw = doc.data();
            if (raw is Map) {
              final data = Map<String, dynamic>.from(raw);
              final sName = data['site_name']?.toString() ?? '';
              final docId = doc.id;
              if (sName.toLowerCase() == siteName.toLowerCase() ||
                  docId.toLowerCase() == siteName.toLowerCase()) {
                breakupData = data;
                break;
              }
            }
          }
        }

        if (breakupData == null) {
          return _buildEmptyState();
        }

        return _buildPaymentBreakupContent(breakupData);
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
                color: const Color(0xFFDBEAFE),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF3B82F6), width: 2),
              ),
              child: const Icon(
                Icons.pie_chart_rounded,
                size: 48,
                color: Color(0xFF2563EB),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No Payment Breakup for "$siteName"',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.darkCharcoal,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'When Yeloline Admin enters the stage-by-stage construction payment breakup in the Admin Panel, it will appear here in real-time with full milestone schedules.',
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

  Widget _buildPaymentBreakupContent(Map<String, dynamic> data) {
    final floorTitle = data['floor_title']?.toString() ?? 'GROUND FLOOR';
    final totalAmount = data['total_amount'] ?? 0;
    final milestones = (data['milestones'] as List<dynamic>?) ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E3A8A), Color(0xFF1E293B)],
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
                      child: Text(
                        floorTitle.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          color: AppColors.darkCharcoal,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    Text(
                      '${milestones.length} Stages Defined',
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
                  'TOTAL CONTRACT MILESTONE VALUE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white60,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '₹ ${CurrencyFormatter.format(totalAmount)}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
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
                'Construction Payment Stages',
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

          // List of Milestones
          ...milestones.asMap().entries.map((entry) {
            final idx = entry.key;
            final m = (entry.value is Map)
                ? Map<String, dynamic>.from(entry.value as Map)
                : <String, dynamic>{};
            return _buildMilestoneTile(idx + 1, m, isLast: idx == milestones.length - 1);
          }),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMilestoneTile(int defaultSno, Map<String, dynamic> item, {required bool isLast}) {
    final sno = item['sno'] ?? defaultSno;
    final stageName = item['stage_name']?.toString() ?? 'STAGE $sno';
    final amount = item['amount'];
    final schedule = item['work_schedule']?.toString() ?? '';
    final hasAmount = amount != null && amount.toString().trim().isNotEmpty && amount.toString() != '0';
    final hasSchedule = schedule.trim().isNotEmpty;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: hasAmount ? const Color(0xFFE2E8F0) : const Color(0xFFF1F5F9),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stage Number Circle
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: hasAmount ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
              shape: BoxShape.circle,
              border: Border.all(
                color: hasAmount ? const Color(0xFF3B82F6) : const Color(0xFFCBD5E1),
                width: 1.5,
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              '$sno',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w900,
                color: hasAmount ? const Color(0xFF1D4ED8) : AppColors.textMuted,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Stage Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  stageName,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.darkCharcoal,
                  ),
                ),
                const SizedBox(height: 4),
                if (hasSchedule)
                  Row(
                    children: [
                      const Icon(Icons.event_note_rounded, size: 13, color: Color(0xFF64748B)),
                      const SizedBox(width: 4),
                      Text(
                        'Schedule: $schedule',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF475569),
                        ),
                      ),
                    ],
                  )
                else
                  const Text(
                    'Schedule: As per site progress',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textMuted,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
              ],
            ),
          ),

          // Amount Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: hasAmount ? const Color(0xFFF0FDF4) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: hasAmount ? const Color(0xFF86EFAC) : const Color(0xFFE2E8F0),
              ),
            ),
            child: Text(
              hasAmount ? '₹ ${CurrencyFormatter.format(amount)}' : 'Pending',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w900,
                color: hasAmount ? const Color(0xFF166534) : AppColors.textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
