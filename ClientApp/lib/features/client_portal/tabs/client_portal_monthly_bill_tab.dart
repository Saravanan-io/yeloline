import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

class ClientPortalMonthlyBillTab extends StatefulWidget {
  final String siteName;

  const ClientPortalMonthlyBillTab({
    super.key,
    required this.siteName,
  });

  @override
  State<ClientPortalMonthlyBillTab> createState() => _ClientPortalMonthlyBillTabState();
}

class _ClientPortalMonthlyBillTabState extends State<ClientPortalMonthlyBillTab> {
  final ScrollController _hScrollController = ScrollController();
  bool _isTableView = true; // Toggle between Spreadsheet Table & Mobile Cards

  // Fixed column widths for pixel-perfect vertical spreadsheet alignment
  static const double colSno = 42.0;
  static const double colDesc = 216.0;
  static const double colArea = 95.0;
  static const double colRate = 105.0;
  static const double colAmount = 146.0;
  static const double leftSpanWidth = colSno + colDesc + colArea + colRate; // Exactly 458.0
  static const double totalTableWidth = leftSpanWidth + colAmount; // Exactly 604.0

  @override
  void dispose() {
    _hScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('monthly_billings').snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primaryYellow),
          );
        }

        Map<String, dynamic>? billingData;

        if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
          for (final doc in snapshot.data!.docs) {
            final raw = doc.data();
            if (raw is Map) {
              final data = Map<String, dynamic>.from(raw);
              final sName = data['site_name']?.toString() ?? '';
              final docId = doc.id;
              if (sName.toLowerCase() == widget.siteName.toLowerCase() ||
                  docId.toLowerCase() == widget.siteName.toLowerCase() ||
                  docId.toLowerCase() == 'monthly-${widget.siteName.toLowerCase().replaceAll(' ', '-')}') {
                billingData = data;
                break;
              }
            }
          }
        }

        if (billingData == null) {
          return _buildEmptyState();
        }

        return _buildMonthlyStatementContent(context, billingData);
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
                color: const Color(0xFFFEF3C7),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primaryYellow, width: 2),
              ),
              child: const Icon(
                Icons.receipt_long_rounded,
                size: 48,
                color: Color(0xFFD97706),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No Monthly Bill Generated for "${widget.siteName}"',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.darkCharcoal,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Once the Yeloline Admin generates and saves the itemized monthly valuation bill for this site in the Admin Panel, it will automatically reflect here in real-time.',
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

  Widget _buildMonthlyStatementContent(BuildContext context, Map<String, dynamic> data) {
    final clientTitle = data['client_title']?.toString() ?? widget.siteName;
    final statementSubtitle = data['statement_subtitle']?.toString() ?? 'Monthly Valuation Statement';
    final billDate = data['bill_date']?.toString() ?? '-';
    final settlementDate = data['settlement_date']?.toString() ?? '-';

    final areaItems = (data['area_items'] as List<dynamic>?) ?? [];
    final amenityItems = (data['amenity_items'] as List<dynamic>?) ?? [];

    final totalBuiltupArea = data['total_builtup_area'] ?? 0;
    final averageBuiltupRate = data['average_builtup_rate'] ?? 0;
    final totalBuiltupCost = data['total_builtup_cost'] ?? 0;
    final mainStructureTotal = data['main_structure_total'] ?? 0;
    final additionalWorkBill = data['additional_work_bill'] ?? 0;
    final receivedAdditional = data['received_additional'] ?? 0;
    final receivedQuoted = data['received_quoted'] ?? 0;

    // Smart financial fallbacks so cards never display 0.00 if records exist
    final num calculatedGross = (mainStructureTotal is num ? mainStructureTotal : (num.tryParse(mainStructureTotal.toString()) ?? 0)) +
        (additionalWorkBill is num ? additionalWorkBill : (num.tryParse(additionalWorkBill.toString()) ?? 0));
    final grossTotalRaw = data['gross_total'] ?? data['gross_total_amount'] ?? 0;
    final grossTotal = (grossTotalRaw != 0 && grossTotalRaw != '0') ? grossTotalRaw : calculatedGross;

    final asPerStageRaw = data['as_per_stage_amount'] ?? grossTotal;
    final asPerStageAmount = (asPerStageRaw != 0 && asPerStageRaw != '0') ? asPerStageRaw : grossTotal;

    final num calculatedReceived = (receivedAdditional is num ? receivedAdditional : (num.tryParse(receivedAdditional.toString()) ?? 0)) +
        (receivedQuoted is num ? receivedQuoted : (num.tryParse(receivedQuoted.toString()) ?? 0));
    final totalReceivedRaw = data['total_received'] ?? data['total_received_combined'] ?? 0;
    final totalReceived = (totalReceivedRaw != 0 && totalReceivedRaw != '0') ? totalReceivedRaw : calculatedReceived;

    final balanceBasis = (asPerStageAmount is num ? asPerStageAmount : (num.tryParse(asPerStageAmount.toString()) ?? grossTotal));
    final num calculatedBalance = (balanceBasis is num ? balanceBasis : (num.tryParse(balanceBasis.toString()) ?? 0)) -
        (totalReceived is num ? totalReceived : (num.tryParse(totalReceived.toString()) ?? 0));
    final balanceAmountRaw = data['balance_amount'] ?? 0;
    final balanceAmount = (balanceAmountRaw != 0 && balanceAmountRaw != '0') ? balanceAmountRaw : calculatedBalance;

    final num calculatedTotalBalance = (grossTotal is num ? grossTotal : (num.tryParse(grossTotal.toString()) ?? 0)) -
        (totalReceived is num ? totalReceived : (num.tryParse(totalReceived.toString()) ?? 0));
    final netBalanceRaw = data['total_balance'] ?? data['net_balance'] ?? 0;
    final netBalance = (netBalanceRaw != 0 && netBalanceRaw != '0') ? netBalanceRaw : calculatedTotalBalance;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Metric Cards Header
          _buildMetricsGrid(grossTotal, totalReceived, balanceAmount, netBalance, settlementDate),

          const SizedBox(height: 14),

          // 2. View Switcher Segmented Control
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _isTableView = true),
                    borderRadius: BorderRadius.circular(9),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: _isTableView ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(9),
                        boxShadow: _isTableView
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.table_chart_rounded,
                            size: 16,
                            color: _isTableView ? AppColors.darkCharcoal : AppColors.textMuted,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Official Statement Table',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _isTableView ? FontWeight.w800 : FontWeight.w600,
                              color: _isTableView ? AppColors.darkCharcoal : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _isTableView = false),
                    borderRadius: BorderRadius.circular(9),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: !_isTableView ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(9),
                        boxShadow: !_isTableView
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.view_agenda_rounded,
                            size: 16,
                            color: !_isTableView ? AppColors.darkCharcoal : AppColors.textMuted,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Mobile Cards View',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: !_isTableView ? FontWeight.w800 : FontWeight.w600,
                              color: !_isTableView ? AppColors.darkCharcoal : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // 3. Render either Official Spreadsheet or Mobile Cards
          if (_isTableView) ...[
            // Horizontal swipe guide banner (only needed when itemized area columns exist)
            if (areaItems.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.arrow_back_rounded, size: 14, color: Color(0xFFB45309)),
                    SizedBox(width: 6),
                    Text(
                      'Swipe horizontally to view full rate (₹/Sft) & amounts (₹)',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFB45309),
                      ),
                    ),
                    SizedBox(width: 6),
                    Icon(Icons.arrow_forward_rounded, size: 14, color: Color(0xFFB45309)),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],

            // Spreadsheet Statement Card
            _buildSpreadsheetCard(
              clientTitle: clientTitle,
              statementSubtitle: statementSubtitle,
              billDate: billDate,
              settlementDate: settlementDate,
              areaItems: areaItems,
              amenityItems: amenityItems,
              totalBuiltupArea: totalBuiltupArea,
              averageBuiltupRate: averageBuiltupRate,
              totalBuiltupCost: totalBuiltupCost,
              mainStructureTotal: mainStructureTotal,
              additionalWorkBill: additionalWorkBill,
              grossTotal: grossTotal,
              asPerStageAmount: asPerStageAmount,
              receivedAdditional: receivedAdditional,
              receivedQuoted: receivedQuoted,
              balanceAmount: balanceAmount,
              netBalance: netBalance,
            ),
          ] else ...[
            // Mobile Cards View
            _buildMobileCardsView(
              clientTitle: clientTitle,
              statementSubtitle: statementSubtitle,
              billDate: billDate,
              settlementDate: settlementDate,
              areaItems: areaItems,
              amenityItems: amenityItems,
              totalBuiltupArea: totalBuiltupArea,
              averageBuiltupRate: averageBuiltupRate,
              totalBuiltupCost: totalBuiltupCost,
              mainStructureTotal: mainStructureTotal,
              additionalWorkBill: additionalWorkBill,
              grossTotal: grossTotal,
              receivedAdditional: receivedAdditional,
              receivedQuoted: receivedQuoted,
              balanceAmount: balanceAmount,
              netBalance: netBalance,
            ),
          ],

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==========================================
  // SPREADSHEET TABLE IMPLEMENTATION (PIXEL-PERFECT)
  // ==========================================
  Widget _buildSpreadsheetCard({
    required String clientTitle,
    required String statementSubtitle,
    required String billDate,
    required String settlementDate,
    required List<dynamic> areaItems,
    required List<dynamic> amenityItems,
    required dynamic totalBuiltupArea,
    required dynamic averageBuiltupRate,
    required dynamic totalBuiltupCost,
    required dynamic mainStructureTotal,
    required dynamic additionalWorkBill,
    required dynamic grossTotal,
    required dynamic asPerStageAmount,
    required dynamic receivedAdditional,
    required dynamic receivedQuoted,
    required dynamic balanceAmount,
    required dynamic netBalance,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.black, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Peach Header Banner
          Container(
            color: const Color(0xFFFFD8BE), // Exact peach color
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Column(
              children: [
                Text(
                  clientTitle,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    color: Colors.black,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.black, width: 1.2),
                  ),
                  child: Text(
                    statementSubtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0284C7),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildDatePill('Bill Date: $billDate'),
                    const SizedBox(width: 8),
                    _buildDatePill('Settlement Date: $settlementDate'),
                  ],
                ),
              ],
            ),
          ),
          Container(height: 1.5, color: Colors.black),

          // Scrollbar with horizontal scrolling
          Scrollbar(
            controller: _hScrollController,
            thumbVisibility: true,
            thickness: 6,
            radius: const Radius.circular(4),
            child: SingleChildScrollView(
              controller: _hScrollController,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: SizedBox(
                width: totalTableWidth,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Table Header
                    _buildTableHeader(hasAreaItems: areaItems.isNotEmpty),

                    // 2. Section 1: Built-up Area Items
                    if (areaItems.isNotEmpty) ...[
                      ...areaItems.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final item = (entry.value is Map)
                            ? Map<String, dynamic>.from(entry.value as Map)
                            : <String, dynamic>{};
                        return _buildAreaItemRow(idx + 1, item);
                      }),
                      _buildPeachSubtotalRow(
                        totalBuiltupArea: totalBuiltupArea.toString(),
                        averageRate: averageBuiltupRate.toString(),
                        totalCost: totalBuiltupCost,
                      ),
                    ],

                    // 3. Section 2: Amenities & Extra Works
                    if (amenityItems.isNotEmpty) ...[
                      ...amenityItems.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final item = (entry.value is Map)
                            ? Map<String, dynamic>.from(entry.value as Map)
                            : <String, dynamic>{};
                        return _buildAmenityItemRow(areaItems.length + idx + 1, item);
                      }),
                    ],

                    // 5. Section 3: Totals & Reconciliation
                    _buildGreenTotalRow('மொத்தம் (Main Building Total)', mainStructureTotal),
                    _buildAdditionalBillRow(additionalWorkBill),
                    _buildYellowGrossTotalRow('TOTAL QUOTED AMOUNT + ADDITIONAL WORK ($billDate)', grossTotal),
                    _buildReconRow('TOTAL RECEIVED AMOUNT (in Additional)', receivedAdditional),
                    _buildReconRow('TOTAL RECEIVED AMOUNT (in Quoted)', receivedQuoted),
                    _buildReconRow('AS PER STAGE AMOUNT INCLD. ADDITIONAL WORK BILL', asPerStageAmount),
                    _buildBlueBalanceRow('AS PER STAGE BALANCE AMOUNT AS ON $settlementDate', balanceAmount),
                    _buildGreenNetBalanceRow('TOTAL BALANCE AMOUNT AS ON $settlementDate', netBalance),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Reusable helper for cell with integrated right border (no extra divider widths!)
  Widget _buildCell({
    required double width,
    required Widget child,
    bool hasRightBorder = true,
    EdgeInsetsGeometry padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
    AlignmentGeometry alignment = Alignment.centerLeft,
  }) {
    return Container(
      width: width,
      alignment: alignment,
      padding: padding,
      decoration: hasRightBorder
          ? const BoxDecoration(
              border: Border(right: BorderSide(color: Colors.black, width: 1.0)),
            )
          : null,
      child: child,
    );
  }

  Widget _buildTableHeader({bool hasAreaItems = true}) {
    if (!hasAreaItems) {
      return Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(bottom: BorderSide(color: Colors.black, width: 1.5)),
        ),
        child: IntrinsicHeight(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildCell(
                width: leftSpanWidth,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                child: const Text(
                  'விவரம் (Description)',
                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: Colors.black),
                ),
              ),
              _buildCell(
                width: colAmount,
                alignment: Alignment.centerRight,
                hasRightBorder: false,
                child: const Text(
                  'தொகை (Amount ₹)',
                  textAlign: TextAlign.right,
                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: Colors.black),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.black, width: 1.5)),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: colSno,
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: const Text(
                'வ.எண்',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.black),
              ),
            ),
            _buildCell(
              width: colDesc,
              child: const Text(
                'விவரம் (Description)',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.black),
              ),
            ),
            _buildCell(
              width: colArea,
              alignment: Alignment.center,
              child: const Text(
                'பரப்பளவு (Area)',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.black),
              ),
            ),
            _buildCell(
              width: colRate,
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: const Text(
                'சதுர அடி (₹/Sft)',
                textAlign: TextAlign.right,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.black),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: const Text(
                'தொகை (Amount ₹)',
                textAlign: TextAlign.right,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.black),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAreaItemRow(int sno, Map<String, dynamic> item) {
    final desc = item['description']?.toString() ?? '';
    final area = item['area_sqft']?.toString() ?? '0';
    final rate = item['rate_per_sqft']?.toString() ?? '0';
    final amount = item['amount'] ?? 0;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.black, width: 1)),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: colSno,
              alignment: Alignment.center,
              child: Text(
                '$sno',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
            _buildCell(
              width: colDesc,
              child: Text(
                desc,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
            _buildCell(
              width: colArea,
              alignment: Alignment.center,
              child: Text(
                '$area Sft.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
            _buildCell(
              width: colRate,
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: Text(
                '₹ $rate',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPeachSubtotalRow({
    required String totalBuiltupArea,
    required String averageRate,
    required dynamic totalCost,
  }) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFFD8BE), // Exact peach color
        border: Border(
          top: BorderSide(color: Colors.black, width: 1.5),
          bottom: BorderSide(color: Colors.black, width: 1.5),
        ),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: colSno,
              alignment: Alignment.center,
              child: const Text(''),
            ),
            _buildCell(
              width: colDesc,
              child: const Text(
                'கட்டிட பரப்பளவு (Total Built-up Area)',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
              ),
            ),
            _buildCell(
              width: colArea,
              alignment: Alignment.center,
              child: Text(
                '$totalBuiltupArea Sft.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
              ),
            ),
            _buildCell(
              width: colRate,
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: Text(
                '₹ $averageRate/Sft.',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(totalCost)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAmenityItemRow(int sno, Map<String, dynamic> item) {
    final desc = item['description']?.toString() ?? '';
    final amount = item['amount'] ?? 0;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.black, width: 1)),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: colSno,
              alignment: Alignment.center,
              child: Text(
                '$sno',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
            _buildCell(
              width: colDesc,
              child: Text(
                desc,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
            _buildCell(
              width: colArea,
              alignment: Alignment.center,
              child: const Text(
                '—',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black45, fontSize: 13),
              ),
            ),
            _buildCell(
              width: colRate,
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: const Text(
                '—',
                textAlign: TextAlign.right,
                style: TextStyle(color: Colors.black45, fontSize: 13),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGreenTotalRow(String label, dynamic amount) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFC8E6C9), // Light green
        border: Border(
          top: BorderSide(color: Colors.black, width: 1.5),
          bottom: BorderSide(color: Colors.black, width: 1.5),
        ),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: leftSpanWidth,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Text(
                label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdditionalBillRow(dynamic amount) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.black, width: 1.5)),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: leftSpanWidth,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: const Text(
                'Additional Work Bill',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildYellowGrossTotalRow(String label, dynamic amount) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFFF9C4), // Light yellow
        border: Border(bottom: BorderSide(color: Colors.black, width: 1.5)),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: leftSpanWidth,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Text(
                label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReconRow(String label, dynamic amount) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFCBD5E1), width: 1)),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: leftSpanWidth,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1E293B),
                ),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBlueBalanceRow(String label, dynamic amount) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFBBDEFB), // Light blue
        border: Border(
          top: BorderSide(color: Colors.black, width: 1.5),
          bottom: BorderSide(color: Colors.black, width: 1.5),
        ),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: leftSpanWidth,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Text(
                label,
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGreenNetBalanceRow(String label, dynamic amount) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFC8E6C9), // Light green
        border: Border(bottom: BorderSide(color: Colors.black, width: 1.5)),
      ),
      child: IntrinsicHeight(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildCell(
              width: leftSpanWidth,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              child: Text(
                label,
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900),
              ),
            ),
            _buildCell(
              width: colAmount,
              alignment: Alignment.centerRight,
              hasRightBorder: false,
              child: Text(
                '₹ ${CurrencyFormatter.format(amount)}',
                textAlign: TextAlign.right,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF047857),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // MOBILE CARDS VIEW (RESPONSIVE FOR MOBILE)
  // ==========================================
  Widget _buildMobileCardsView({
    required String clientTitle,
    required String statementSubtitle,
    required String billDate,
    required String settlementDate,
    required List<dynamic> areaItems,
    required List<dynamic> amenityItems,
    required dynamic totalBuiltupArea,
    required dynamic averageBuiltupRate,
    required dynamic totalBuiltupCost,
    required dynamic mainStructureTotal,
    required dynamic additionalWorkBill,
    required dynamic grossTotal,
    required dynamic receivedAdditional,
    required dynamic receivedQuoted,
    required dynamic balanceAmount,
    required dynamic netBalance,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Meta header card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFFFD8BE),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.black87, width: 1.2),
          ),
          child: Column(
            children: [
              Text(
                clientTitle,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildDatePill('Bill Date: $billDate'),
                  const SizedBox(width: 8),
                  _buildDatePill('Settlement Date: $settlementDate'),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Section 1: Built-up Area Items
        if (areaItems.isNotEmpty) ...[
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Text(
              '1. Built-up Area Valuation Items',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: AppColors.darkCharcoal,
              ),
            ),
          ),
          const SizedBox(height: 6),

          ...areaItems.asMap().entries.map((entry) {
            final idx = entry.key;
            final item = (entry.value is Map)
                ? Map<String, dynamic>.from(entry.value as Map)
                : <String, dynamic>{};
            final desc = item['description']?.toString() ?? '';
            final area = item['area_sqft']?.toString() ?? '0';
            final rate = item['rate_per_sqft']?.toString() ?? '0';
            final amount = item['amount'] ?? 0;

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AppColors.primaryYellow.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${idx + 1}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          desc,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkCharcoal,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '$area Sft. × ₹$rate',
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                        ),
                        Text(
                          '₹ ${CurrencyFormatter.format(amount)}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),

          // Peach Built-up subtotal card
          Container(
            margin: const EdgeInsets.symmetric(vertical: 6),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFD8BE),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.black87, width: 1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'கட்டிட பரப்பளவு (Total Built-up)',
                      style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
                    ),
                    Text(
                      '$totalBuiltupArea Sft. @ avg ₹$averageBuiltupRate/Sft.',
                      style: const TextStyle(fontSize: 11, color: Colors.black87),
                    ),
                  ],
                ),
                Text(
                  '₹ ${CurrencyFormatter.format(totalBuiltupCost)}',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),
        ],

        // Section 2: Amenities
        if (amenityItems.isNotEmpty) ...[
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Text(
              '2. Amenities & Extra Items',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: AppColors.darkCharcoal,
              ),
            ),
          ),
          const SizedBox(height: 6),

          ...amenityItems.asMap().entries.map((entry) {
            final idx = entry.key;
            final item = (entry.value is Map)
                ? Map<String, dynamic>.from(entry.value as Map)
                : <String, dynamic>{};
            final desc = item['description']?.toString() ?? '';
            final amount = item['amount'] ?? 0;

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Text(
                          '${areaItems.length + idx + 1}.',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            desc,
                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '₹ ${CurrencyFormatter.format(amount)}',
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 14),
        ],

        // Section 3: Summary Breakdown
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.black, width: 1.2),
          ),
          child: Column(
            children: [
              _buildMobileSummaryRow('Main Building Total', mainStructureTotal, isBold: true, bgColor: const Color(0xFFC8E6C9)),
              const Divider(height: 12),
              _buildMobileSummaryRow('Additional Work Bill', additionalWorkBill),
              const Divider(height: 12),
              _buildMobileSummaryRow('TOTAL QUOTED + ADDITIONAL ($billDate)', grossTotal, isBold: true, bgColor: const Color(0xFFFFF9C4)),
              const Divider(height: 12),
              _buildMobileSummaryRow('TOTAL RECEIVED (Additional)', receivedAdditional),
              const Divider(height: 12),
              _buildMobileSummaryRow('TOTAL RECEIVED (Quoted)', receivedQuoted),
              const Divider(height: 12),
              _buildMobileSummaryRow('AS PER STAGE BALANCE AS ON $settlementDate', balanceAmount, isBold: true, bgColor: const Color(0xFFBBDEFB)),
              const Divider(height: 12),
              _buildMobileSummaryRow('TOTAL BALANCE AS ON $settlementDate', netBalance, isBold: true, bgColor: const Color(0xFFC8E6C9), textColor: const Color(0xFF047857)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMobileSummaryRow(String label, dynamic amount, {bool isBold = false, Color? bgColor, Color? textColor}) {
    final content = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: isBold ? 12.5 : 12,
                fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
                color: textColor ?? Colors.black87,
              ),
            ),
          ),
          Text(
            '₹ ${CurrencyFormatter.format(amount)}',
            style: TextStyle(
              fontSize: isBold ? 13.5 : 12.5,
              fontWeight: isBold ? FontWeight.w900 : FontWeight.w700,
              color: textColor ?? Colors.black87,
            ),
          ),
        ],
      ),
    );

    if (bgColor != null) {
      return Container(
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(6),
        ),
        child: content,
      );
    }
    return content;
  }

  Widget _buildDatePill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: Colors.black26),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildMetricsGrid(
    dynamic gross,
    dynamic received,
    dynamic balance,
    dynamic net,
    String settlementDate,
  ) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildMetricTile(
                title: 'GROSS TOTAL AMOUNT',
                amount: '₹ ${CurrencyFormatter.format(gross)}',
                subtext: 'Main Structure + Extra Work',
                bgColor: Colors.white,
                accentColor: AppColors.primaryYellow,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildMetricTile(
                title: 'TOTAL RECEIVED',
                amount: '₹ ${CurrencyFormatter.format(received)}',
                subtext: 'Quoted + Additional',
                bgColor: Colors.white,
                accentColor: const Color(0xFF10B981),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildMetricTile(
                title: 'BALANCE DUE',
                amount: '₹ ${CurrencyFormatter.format(balance)}',
                subtext: 'As on $settlementDate pending',
                bgColor: Colors.white,
                accentColor: const Color(0xFFF97316),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildMetricTile(
                title: 'NET SETTLEMENT',
                amount: '₹ ${CurrencyFormatter.format(net)}',
                subtext: 'Final settlement balance',
                bgColor: Colors.white,
                accentColor: const Color(0xFF3B82F6),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String amount,
    required String subtext,
    required Color bgColor,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: accentColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted,
                    letterSpacing: 0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            amount,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: AppColors.darkCharcoal,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtext,
            style: const TextStyle(
              fontSize: 9.5,
              color: AppColors.textMuted,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
