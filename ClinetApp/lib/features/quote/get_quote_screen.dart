import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/firebase_service.dart';
import '../../models/quote_model.dart';

class GetQuoteScreen extends StatefulWidget {
  final VoidCallback onGoHome;
  final VoidCallback onGoProjects;
  final ValueChanged<int>? onStepChanged;

  const GetQuoteScreen({
    super.key,
    required this.onGoHome,
    required this.onGoProjects,
    this.onStepChanged,
  });

  @override
  State<GetQuoteScreen> createState() => GetQuoteScreenState();
}

class GetQuoteScreenState extends State<GetQuoteScreen> {
  int _currentStep = 0; // 0: Select, 1: Review, 2: Details, 3: Thank You
  final QuoteData _quoteData = QuoteData();
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  int get currentStep => _currentStep;

  bool canGoBack() => _currentStep > 0;

  void _setStep(int newStep) {
    setState(() {
      _currentStep = newStep;
    });
    widget.onStepChanged?.call(newStep);
  }

  void goBack() {
    if (_currentStep > 0) {
      final nextStep = _currentStep == 3 ? 0 : _currentStep - 1;
      _setStep(nextStep);
    }
  }



  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Stepper Progress Header
        if (_currentStep < 3) _buildProgressHeader(),

        // Main Step Body
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(16.0),
            child: _buildCurrentStepContent(),
          ),
        ),

        // Sticky Bottom CTA / Calculation Bar
        if (_currentStep == 0) _buildStep1StickyFooter(),
        if (_currentStep == 1) _buildStep2StickyFooter(),
      ],
    );
  }

  Widget _buildStep2StickyFooter() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.darkCharcoal,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: const Border(
          top: BorderSide(color: Colors.white12, width: 1),
          left: BorderSide(color: Colors.white12, width: 1),
          right: BorderSide(color: Colors.white12, width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _setStep(2),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryYellow,
              foregroundColor: AppColors.darkCharcoal,
              padding: const EdgeInsets.symmetric(vertical: 14),
              elevation: 3,
              shadowColor: AppColors.primaryYellow.withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Continue to Get Quote',
                  style: TextStyle(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.2,
                  ),
                ),
                SizedBox(width: 10),
                Icon(Icons.arrow_forward_rounded, size: 20, color: AppColors.darkCharcoal),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProgressHeader() {
    final stepLabels = ['Specs', 'Review', 'Details'];

    Widget buildStepItem(int index) {
      final isActive = index == _currentStep;
      final isDone = index < _currentStep;

      return InkWell(
        onTap: (index < _currentStep)
            ? () {
                _setStep(index);
              }
            : null,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 2.0),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: isDone || isActive
                      ? AppColors.primaryYellow
                      : const Color(0xFF334155),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: isDone
                      ? const Icon(Icons.check_rounded, color: AppColors.darkCharcoal, size: 15)
                      : Text(
                          '${index + 1}',
                          style: TextStyle(
                            color: isActive ? AppColors.darkCharcoal : Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 6),
              Text(
                stepLabels[index],
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: isActive ? FontWeight.w900 : FontWeight.w700,
                  color: isActive
                      ? AppColors.primaryYellow
                      : (isDone ? Colors.white : Colors.white.withValues(alpha: 0.90)),
                ),
                softWrap: false,
              ),
            ],
          ),
        ),
      );
    }

    Widget buildArrowConnector(bool isDone) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Container(
                height: 2,
                color: isDone ? AppColors.primaryYellow : Colors.white38,
              ),
            ),
            Icon(
              Icons.arrow_forward_ios_rounded,
              size: 10,
              color: isDone ? AppColors.primaryYellow : Colors.white38,
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      color: AppColors.darkCharcoal,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          buildStepItem(0),
          Expanded(child: buildArrowConnector(_currentStep > 0)),
          buildStepItem(1),
          Expanded(child: buildArrowConnector(_currentStep > 1)),
          buildStepItem(2),
        ],
      ),
    );
  }

  Widget _buildCurrentStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1SelectSpecs();
      case 1:
        return _buildStep2ReviewSelections();
      case 2:
        return _buildStep3ClientDetails();
      case 3:
        return _buildStep4ThankYou();
      default:
        return const SizedBox();
    }
  }



  final Map<String, IconData> _categoryIcons = {
    'Structure': Icons.home_work_outlined,
    'Cement': Icons.inventory_2_outlined,
    'Steel': Icons.architecture_rounded,
    'Bricks / Blocks': Icons.grid_view_rounded,
    'Flooring': Icons.crop_square_rounded,
    'Doors': Icons.door_front_door_outlined,
    'Windows': Icons.window_outlined,
  };

  final Map<String, String> _categoryImages = {
    'Structure': 'assets/structure.jpeg',
    'Cement': 'assets/cement.jpeg',
    'Steel': 'assets/steel.jpeg',
    'Bricks / Blocks': 'assets/bricks.jpeg',
    'Flooring': 'assets/flooring.jpeg',
    'Doors': 'assets/doors.jpeg',
    'Windows': 'assets/windows.jpeg',
  };

  Widget _buildCategoryBadge(String category, {double size = 52, bool isExpanded = false}) {
    final icon = _categoryIcons[category] ?? Icons.inventory_2_outlined;
    final primaryPath = _categoryImages[category] ?? 'assets/${category.toLowerCase().split(' ').first}.jpeg';
    final borderRadius = BorderRadius.circular(10);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: isExpanded ? AppColors.primaryYellow : AppColors.lightYellowBg,
        borderRadius: borderRadius,
        border: Border.all(
          color: isExpanded
              ? AppColors.primaryYellow.withValues(alpha: 0.4)
              : AppColors.borderLight.withValues(alpha: 0.8),
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: Image.asset(
          primaryPath,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Icon(
              icon,
              color: AppColors.darkCharcoal,
              size: size * 0.55,
            );
          },
        ),
      ),
    );
  }

  final Map<String, List<Map<String, String>>> _specOptions = {
    'Structure': [
      {'title': 'RCC Frame Structure', 'sub': '(M25 Grade)', 'full': 'RCC Frame Structure (M25 Grade)'},
      {'title': 'RCC Frame Structure', 'sub': '(M30 Grade)', 'full': 'RCC Frame Structure (M30 Grade)'},
      {'title': 'Steel Frame Structure', 'sub': '(Heavy Duty)', 'full': 'Steel Frame Structure (Heavy Duty)'},
    ],
    'Cement': [
      {'title': 'UltraTech PPC', 'sub': '(Premium)', 'full': 'UltraTech PPC (Premium)'},
      {'title': 'Ambuja PPC', 'sub': '(Premium)', 'full': 'Ambuja PPC (Premium)'},
      {'title': 'ACC PPC', 'sub': '(Premium)', 'full': 'ACC PPC (Premium)'},
    ],
    'Steel': [
      {'title': 'TATA Tiscon 550D', 'sub': '(High Strength)', 'full': 'TATA Tiscon 550D (High Strength)'},
      {'title': 'JSW Neosteel', 'sub': '(Premium)', 'full': 'JSW Neosteel (Premium)'},
      {'title': 'SAIL TMT', 'sub': '(Fe 550)', 'full': 'SAIL TMT (Fe 550)'},
    ],
    'Bricks / Blocks': [
      {'title': 'Red Bricks', 'sub': '(Premium)', 'full': 'Red Bricks (Premium)'},
      {'title': 'AAC Blocks', 'sub': '(Lightweight)', 'full': 'AAC Blocks (Lightweight)'},
      {'title': 'Fly Ash Bricks', 'sub': '(Eco Friendly)', 'full': 'Fly Ash Bricks (Eco Friendly)'},
    ],
    'Flooring': [
      {'title': 'Vitrified Tiles', 'sub': '(Premium)', 'full': 'Vitrified Tiles (Premium)'},
      {'title': 'Italian Marble', 'sub': '(Imported)', 'full': 'Italian Marble (Imported)'},
      {'title': 'Granite Flooring', 'sub': '(Premium)', 'full': 'Granite Flooring (Premium)'},
    ],
    'Doors': [
      {'title': 'Teak Wood Doors', 'sub': '(Premium)', 'full': 'Teak Wood Doors (Premium)'},
      {'title': 'Flush Doors', 'sub': '(Teak Frame)', 'full': 'Flush Doors (Teak Frame)'},
      {'title': 'UPVC Doors', 'sub': '(Modern)', 'full': 'UPVC Doors (Modern)'},
    ],
    'Windows': [
      {'title': 'Aluminium Windows', 'sub': '(Powder Coated)', 'full': 'Aluminium Windows (Powder Coated)'},
      {'title': 'UPVC Sliding Windows', 'sub': '(Soundproof)', 'full': 'UPVC Sliding Windows (Soundproof)'},
      {'title': 'Teak Wood Windows', 'sub': '(Classic)', 'full': 'Teak Wood Windows (Classic)'},
    ],
  };

  // STEP 1: Select Specifications (Horizontal Option Cards with Category Thumbnails)
  Widget _buildStep1SelectSpecs() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Step 1 of 3 – Select Specifications',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Choose premium materials for an accurate estimate',
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w400,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 18),

        ..._specOptions.entries.map((entry) {
          final category = entry.key;
          final optionsList = entry.value;
          final currentValue = _getCategoryValue(category);

          return Padding(
            padding: const EdgeInsets.only(bottom: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category Title Header
                Text(
                  category,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600, // Semi-Bold
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),

                // Category Image Thumbnail + 3 Vertical Option Items with Radio Checkboxes
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Category Thumbnail Image
                    _buildCategoryBadge(category, size: 90),

                    const SizedBox(width: 10),

                    // 3 Items Column next to Image with Radio Checkboxes
                    Expanded(
                      child: Column(
                        children: optionsList.map((opt) {
                          final fullVal = opt['full']!;
                          final title = opt['title']!;
                          final sub = opt['sub']!;

                          final isSelected = currentValue == fullVal;

                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _setCategoryValue(category, fullVal);
                              });
                            },
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected ? AppColors.darkYellow : AppColors.borderLight,
                                  width: isSelected ? 1.8 : 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: isSelected ? 0.04 : 0.02),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  // Radio Checkbox Icon
                                  Container(
                                    width: 18,
                                    height: 18,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isSelected ? AppColors.darkYellow : Colors.black38,
                                        width: isSelected ? 2.0 : 1.5,
                                      ),
                                    ),
                                    child: isSelected
                                        ? Center(
                                            child: Container(
                                              width: 9,
                                              height: 9,
                                              decoration: const BoxDecoration(
                                                color: AppColors.darkCharcoal,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                          )
                                        : null,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          title,
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                            color: AppColors.textPrimary,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        Text(
                                          sub,
                                          style: const TextStyle(
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.w400,
                                            color: AppColors.textSecondary,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildStep1StickyFooter() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
      decoration: BoxDecoration(
        color: AppColors.darkCharcoal,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: const Border(
          top: BorderSide(color: Colors.white12, width: 1),
          left: BorderSide(color: Colors.white12, width: 1),
          right: BorderSide(color: Colors.white12, width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _setStep(1),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryYellow,
              foregroundColor: AppColors.darkCharcoal,
              padding: const EdgeInsets.symmetric(vertical: 14),
              elevation: 3,
              shadowColor: AppColors.primaryYellow.withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Continue',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.2,
                  ),
                ),
                SizedBox(width: 8),
                Icon(Icons.arrow_forward_rounded, size: 18, color: AppColors.darkCharcoal),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // STEP 2: Review Selections
  Widget _buildStep2ReviewSelections() {
    final reviewItems = [
      {'category': 'Structure', 'val': _quoteData.structure, 'icon': Icons.home_rounded},
      {'category': 'Cement', 'val': _quoteData.cement, 'icon': Icons.inventory_2_outlined},
      {'category': 'Steel', 'val': _quoteData.steel, 'icon': Icons.architecture_rounded},
      {'category': 'Bricks / Blocks', 'val': _quoteData.bricks, 'icon': Icons.grid_view_rounded},
      {'category': 'Flooring', 'val': _quoteData.flooring, 'icon': Icons.crop_square_rounded},
      {'category': 'Doors', 'val': _quoteData.doors, 'icon': Icons.door_front_door_outlined},
      {'category': 'Windows', 'val': _quoteData.windows, 'icon': Icons.window_outlined},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Please review your selections below.',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 4),
        const Text(
          'You can edit any section if needed.',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),

        // List of selected specs with Edit button
        ...reviewItems.map((item) {
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.cardWhite,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                _buildCategoryBadge(item['category'] as String, size: 52),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['category'] as String,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                      Text(
                        (item['val'] as String).isEmpty ? 'Not Selected' : (item['val'] as String),
                        style: TextStyle(
                          fontSize: 12,
                          color: (item['val'] as String).isEmpty ? AppColors.darkYellow : AppColors.textSecondary,
                          fontWeight: (item['val'] as String).isEmpty ? FontWeight.w500 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () => _setStep(0),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Edit',
                        style: TextStyle(color: AppColors.darkYellow, fontWeight: FontWeight.w800, fontSize: 13),
                      ),
                      Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.darkYellow),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),

        const SizedBox(height: 16),

        // Dark Rate Box
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardDark,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Estimated Construction Rate',
                    style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  Icon(Icons.info_outline_rounded, color: Colors.white54, size: 18),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                _quoteData.estimatedRateFormatted,
                style: const TextStyle(
                  color: AppColors.primaryYellow,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Approximate rate only. Final cost may vary based on site conditions, design, location and specifications.',
                style: TextStyle(color: Colors.white54, fontSize: 11, height: 1.3),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),
      ],
    );
  }

  // STEP 3: Client Details & Submit
  Widget _buildStep3ClientDetails() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Step 3 of 3',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.darkYellow),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryYellow,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'FINAL STEP',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.darkCharcoal),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Almost there! Let\'s get your project details.',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 2),
          const Text(
            'Share a few details and our experts will get back to you with the best quote.',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 14),

          // Section 1: Contact Information Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.cardWhite,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderLight),
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
                const Row(
                  children: [
                    Icon(Icons.person_rounded, size: 16, color: AppColors.darkYellow),
                    SizedBox(width: 6),
                    Text(
                      'Contact Information',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  initialValue: _quoteData.clientName,
                  decoration: InputDecoration(
                    labelText: 'Client Name *',
                    hintText: 'e.g. Rahul Patel',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.person_outline_rounded, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Please enter name' : null,
                  onChanged: (v) => _quoteData.clientName = v,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: _quoteData.mobileNumber,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                    TextInputFormatter.withFunction((oldValue, newValue) {
                      if (newValue.text.startsWith('0')) {
                        return oldValue;
                      }
                      return newValue;
                    }),
                  ],
                  decoration: InputDecoration(
                    labelText: 'Mobile Number *',
                    hintText: 'e.g. 9876543210',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.phone_outlined, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Please enter mobile number';
                    if (v.trim().startsWith('0')) return 'Mobile number cannot start with 0';
                    if (v.trim().length != 10) return 'Mobile number must be exactly 10 digits';
                    return null;
                  },
                  onChanged: (v) {
                    _quoteData.mobileNumber = v;
                    if (_quoteData.whatsAppNumber.isEmpty) {
                      _quoteData.whatsAppNumber = v;
                    }
                  },
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: _quoteData.whatsAppNumber,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                    TextInputFormatter.withFunction((oldValue, newValue) {
                      if (newValue.text.startsWith('0')) {
                        return oldValue;
                      }
                      return newValue;
                    }),
                  ],
                  decoration: InputDecoration(
                    labelText: 'WhatsApp Number *',
                    hintText: 'e.g. 9876543210',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.chat_outlined, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Please enter WhatsApp number';
                    if (v.trim().startsWith('0')) return 'WhatsApp number cannot start with 0';
                    if (v.trim().length != 10) return 'WhatsApp number must be exactly 10 digits';
                    return null;
                  },
                  onChanged: (v) => _quoteData.whatsAppNumber = v,
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Section 2: Project & Site Details Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.cardWhite,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderLight),
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
                const Row(
                  children: [
                    Icon(Icons.home_work_rounded, size: 16, color: AppColors.darkYellow),
                    SizedBox(width: 6),
                    Text(
                      'Project & Site Details',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  initialValue: _quoteData.location,
                  decoration: InputDecoration(
                    labelText: 'Project Location *',
                    hintText: 'e.g. Erode, Tamil Nadu',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.location_on_outlined, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  ),
                  validator: (v) => v == null || v.trim().isEmpty ? 'Please enter location' : null,
                  onChanged: (v) => _quoteData.location = v,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: _quoteData.plotSize,
                  decoration: InputDecoration(
                    labelText: 'Plot Size',
                    hintText: 'e.g. 50 x 70 ft',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.aspect_ratio_rounded, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  ),
                  onChanged: (v) => _quoteData.plotSize = v,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: _quoteData.approximateArea,
                  decoration: InputDecoration(
                    labelText: 'Approx. Construction Area',
                    hintText: 'e.g. 4,000 sq.ft.',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.square_foot_rounded, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  ),
                  onChanged: (v) => _quoteData.approximateArea = v,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: _quoteData.numberOfFloors,
                  decoration: InputDecoration(
                    labelText: 'Number of Floors',
                    hintText: 'e.g. Ground + 1',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.layers_outlined, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  ),
                  onChanged: (v) => _quoteData.numberOfFloors = v,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: _quoteData.preferredStartDate,
                  decoration: InputDecoration(
                    labelText: 'Preferred Start Date',
                    hintText: 'e.g. 15 Aug 2024',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    prefixIcon: const Icon(Icons.calendar_month_outlined, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  ),
                  onChanged: (v) => _quoteData.preferredStartDate = v,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  initialValue: _quoteData.additionalNotes,
                  maxLines: 2,
                  decoration: InputDecoration(
                    labelText: 'Additional Notes (Optional)',
                    hintText: 'e.g. Modern elevation with 3D walkthrough',
                    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.55), fontSize: 13),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                    alignLabelWithHint: true,
                  ),
                  onChanged: (v) => _quoteData.additionalNotes = v,
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Selected Specs Dark Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardDark,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Your Selected Specifications',
                      style: TextStyle(color: AppColors.primaryYellow, fontSize: 13, fontWeight: FontWeight.w900),
                    ),
                    InkWell(
                      onTap: () => setState(() => _currentStep = 0),
                      child: const Row(
                        children: [
                          Text('Edit ', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          Icon(Icons.edit_outlined, size: 14, color: Colors.white70),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    _buildDarkSpecTag('Structure', _quoteData.structure),
                    _buildDarkSpecTag('Cement', _quoteData.cement),
                    _buildDarkSpecTag('Steel', _quoteData.steel),
                    _buildDarkSpecTag('Bricks', _quoteData.bricks),
                    _buildDarkSpecTag('Flooring', _quoteData.flooring),
                    _buildDarkSpecTag('Windows', _quoteData.windows),
                    _buildDarkSpecTag('Doors', _quoteData.doors),
                  ],
                ),
                const Divider(color: Colors.white12, height: 24),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryYellow,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.local_offer_rounded, color: AppColors.darkCharcoal, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Estimated Rate',
                          style: TextStyle(color: Colors.white60, fontSize: 11),
                        ),
                        Text(
                          _quoteData.estimatedRateFormatted,
                          style: const TextStyle(
                            color: AppColors.primaryYellow,
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Submit Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting
                  ? null
                  : () async {
                      if (_formKey.currentState!.validate()) {
                        setState(() {
                          _isSubmitting = true;
                        });
                        try {
                          await FirebaseService().submitQuoteRequest(_quoteData);
                        } catch (e) {
                          debugPrint('Error submitting quote: $e');
                        } finally {
                          if (mounted) {
                            setState(() {
                              _isSubmitting = false;
                            });
                            _setStep(3);
                          }
                        }
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryYellow,
                foregroundColor: AppColors.darkCharcoal,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.darkCharcoal),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.near_me_rounded, size: 18),
                        SizedBox(width: 8),
                        Text('Submit Quote Request', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ],
                    ),
            ),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDarkSpecTag(String label, String value) {
    final displayVal = value.isEmpty ? 'Not Selected' : value;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          value.isEmpty ? Icons.circle_outlined : Icons.check_circle_rounded,
          color: value.isEmpty ? Colors.white38 : AppColors.primaryYellow,
          size: 12,
        ),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: const TextStyle(color: Colors.white54, fontSize: 11),
        ),
        Text(
          displayVal,
          style: TextStyle(
            color: value.isEmpty ? Colors.white60 : Colors.white,
            fontSize: 11,
            fontWeight: value.isEmpty ? FontWeight.w400 : FontWeight.w700,
          ),
        ),
      ],
    );
  }

  String _getFormattedCurrentDateTime() {
    final now = DateTime.now();
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final day = now.day;
    final month = months[now.month - 1];
    final year = now.year;
    
    int hour = now.hour;
    final minute = now.minute.toString().padLeft(2, '0');
    final period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour == 0) hour = 12;
    
    return '$day $month $year, $hour:$minute $period';
  }

  // STEP 4: Thank You & Confirmation
  Widget _buildStep4ThankYou() {
    final clientName = _quoteData.clientName;
    final locationName = _quoteData.location;
    final areaVal = _quoteData.approximateArea.isNotEmpty ? '${_quoteData.approximateArea} sq.ft.' : '';
    final rateVal = _quoteData.estimatedRateFormatted;
    final currentDateStr = _getFormattedCurrentDateTime();

    return Column(
      children: [
        const SizedBox(height: 10),

        // Glowing Success Badge
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primaryYellow,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryYellow.withValues(alpha: 0.45),
                blurRadius: 24,
                spreadRadius: 4,
              ),
            ],
          ),
          child: const Icon(Icons.check_rounded, color: AppColors.darkCharcoal, size: 52),
        ),

        const SizedBox(height: 20),

        const Text(
          'THANK YOU!',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w900,
            color: AppColors.textPrimary,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          clientName.isNotEmpty ? 'Our team will contact you shortly, $clientName.' : 'Our team will contact you shortly.',
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Container(
          width: 60,
          height: 3,
          decoration: BoxDecoration(
            color: AppColors.primaryYellow,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 10),
        const Text(
          'Your enquiry has been successfully saved as a lead in our system.',
          style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 24),

        // Enquiry Summary Ticket Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardWhite,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.borderLight),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 12,
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
                    'ENQUIRY SUMMARY',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryYellow,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Lead Stage: New Enquiry',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.darkCharcoal),
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              if (clientName.isNotEmpty) _buildSummaryRow(Icons.person_outline_rounded, 'Client Name', clientName),
              if (locationName.isNotEmpty) _buildSummaryRow(Icons.location_on_outlined, 'Location', locationName),
              if (areaVal.isNotEmpty) _buildSummaryRow(Icons.square_foot_rounded, 'Area', areaVal),
              if (rateVal.isNotEmpty) _buildSummaryRow(Icons.currency_rupee_rounded, 'Estimated Rate', rateVal),
              _buildSummaryRow(Icons.calendar_today_rounded, 'Date of Enquiry', currentDateStr),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // Equal Sized Side-by-side Action Buttons
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: widget.onGoHome,
                icon: const Icon(Icons.home_rounded, size: 18),
                label: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryYellow,
                  foregroundColor: AppColors.darkCharcoal,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: widget.onGoProjects,
                icon: const Icon(Icons.apartment_rounded, size: 18),
                label: const Text('View Projects', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.darkCharcoal)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.darkCharcoal, width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildSummaryRow(IconData icon, String label, String val) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderLight.withValues(alpha: 0.6)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.darkYellow),
          const SizedBox(width: 10),
          Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
          const Spacer(),
          Text(
            val,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }

  String _getCategoryValue(String cat) {
    switch (cat) {
      case 'Structure':
        return _quoteData.structure;
      case 'Cement':
        return _quoteData.cement;
      case 'Steel':
        return _quoteData.steel;
      case 'Bricks / Blocks':
        return _quoteData.bricks;
      case 'Flooring':
        return _quoteData.flooring;
      case 'Doors':
        return _quoteData.doors;
      case 'Windows':
        return _quoteData.windows;
      default:
        return '';
    }
  }

  void _setCategoryValue(String cat, String val) {
    switch (cat) {
      case 'Structure':
        _quoteData.structure = val;
        break;
      case 'Cement':
        _quoteData.cement = val;
        break;
      case 'Steel':
        _quoteData.steel = val;
        break;
      case 'Bricks / Blocks':
        _quoteData.bricks = val;
        break;
      case 'Flooring':
        _quoteData.flooring = val;
        break;
      case 'Doors':
        _quoteData.doors = val;
        break;
      case 'Windows':
        _quoteData.windows = val;
        break;
    }
  }
}
