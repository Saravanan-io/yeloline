import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/auth_service.dart';
import '../admin_main_layout.dart';

const List<String> kTamilNaduDistricts = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kancheepuram',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Kanniyakumari',
  'Namakkal',
  'Perambalur',
  'Pudukottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
  'The Nilgiris',
];

class AdminLoginScreen extends StatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  State<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends State<AdminLoginScreen> {
  // ADMIN FORM STATE
  bool _adminIsSignUp = false;
  final _adminFormKey = GlobalKey<FormState>();
  final _adminNameController = TextEditingController();
  final _adminMobileController = TextEditingController();
  final _adminOtpController = TextEditingController();
  String? _adminSelectedDistrict;
  bool _adminIsOtpSent = false;
  int _adminOtpTimer = 30;
  Timer? _adminTimerObj;
  bool _adminIsLoading = false;
  String? _adminError;

  @override
  void dispose() {
    _adminNameController.dispose();
    _adminMobileController.dispose();
    _adminOtpController.dispose();
    _adminTimerObj?.cancel();
    super.dispose();
  }

  // OTP TIMER HELPER - ADMIN
  void _startAdminTimer() {
    _adminTimerObj?.cancel();
    setState(() {
      _adminOtpTimer = 30;
    });
    _adminTimerObj = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_adminOtpTimer == 0) {
        timer.cancel();
      } else {
        setState(() {
          _adminOtpTimer--;
        });
      }
    });
  }

  // SEND OTP - ADMIN
  void _sendAdminOtp() {
    FocusScope.of(context).unfocus();
    final mobile = _adminMobileController.text.trim();
    if (mobile.length < 10) {
      setState(() {
        _adminError = 'Please enter a valid 10-digit mobile number';
      });
      return;
    }

    setState(() {
      _adminError = null;
      _adminIsOtpSent = true;
    });
    _startAdminTimer();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: AppColors.primaryYellow, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text('OTP sent to +91 $mobile. (Demo OTP: 123456)'),
            ),
          ],
        ),
        backgroundColor: AppColors.darkCharcoal,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // VERIFY & SUBMIT - ADMIN
  void _handleAdminSubmit() {
    setState(() {
      _adminError = null;
    });

    if (!_adminFormKey.currentState!.validate()) {
      return;
    }

    if (_adminIsSignUp && (_adminSelectedDistrict == null || _adminSelectedDistrict!.isEmpty)) {
      setState(() {
        _adminError = 'Please select your Tamil Nadu location district.';
      });
      return;
    }

    if (!_adminIsOtpSent) {
      _sendAdminOtp();
      return;
    }

    final otp = _adminOtpController.text.trim();
    if (otp.isEmpty || otp.length < 4) {
      setState(() {
        _adminError = 'Please enter valid 4 or 6-digit OTP code.';
      });
      return;
    }

    setState(() {
      _adminIsLoading = true;
    });

    Future.delayed(const Duration(milliseconds: 600), () async {
      if (!mounted) return;
      await AuthService.setAdminLoggedIn(true);

      if (!mounted) return;
      setState(() {
        _adminIsLoading = false;
      });

      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const AdminMainLayout(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 300),
        ),
      );
    });
  }

  // DISTRICT SEARCHABLE BOTTOM SHEET
  void _openDistrictPicker(String? currentSelected, Function(String) onSelect) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return _DistrictPickerSheet(
          currentSelected: currentSelected,
          onSelect: onSelect,
        );
      },
    );
  }

  // EXIT CONFIRMATION DIALOG
  Future<bool> _showExitConfirmationDialog(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: AppColors.primaryYellow.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.logout_rounded,
                  color: AppColors.darkYellow,
                  size: 26,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Exit App?',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.darkCharcoal,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              const Text(
                'Are you sure you want to exit Yeloline Construction?',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w400,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.darkCharcoal,
                        side: const BorderSide(color: AppColors.borderLight, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('No', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryYellow,
                        foregroundColor: AppColors.darkCharcoal,
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Yes', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isWide = screenWidth >= 900;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
      ),
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          final shouldExit = await _showExitConfirmationDialog(context);
          if (shouldExit) {
            SystemNavigator.pop();
          }
        },
        child: Scaffold(
          backgroundColor: const Color(0xFFF1F5F9),
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 48.0, bottom: 32.0),
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: isWide ? 1040 : 480),
                  child: Column(
                    children: [
                      const SizedBox(height: 16),
                      // Header Logo & Title
                      Image.asset(
                        'assets/header.png',
                        height: 44,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return const Text(
                            'YELOLINE',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: AppColors.darkCharcoal,
                              letterSpacing: 2.0,
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'CONSTRUCTION & RENOVATION PORTAL',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkYellow,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Admin Portal Login Card
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 480),
                        child: _buildAdminCard(),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // SECTION 1: ADMIN CARD WIDGET
  // ==========================================
  Widget _buildAdminCard() {
    return Container(
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.darkYellow.withValues(alpha: 0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Form(
        key: _adminFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryYellow.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.admin_panel_settings_rounded,
                    color: AppColors.darkCharcoal,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Admin Portal',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkCharcoal),
                      ),
                      Text(
                        'Management & Staff Access',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Sign In / Sign Up Mode Switcher
            Container(
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _adminIsSignUp = false;
                          _adminError = null;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: !_adminIsSignUp ? AppColors.darkCharcoal : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Sign In',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: !_adminIsSignUp ? AppColors.primaryYellow : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _adminIsSignUp = true;
                          _adminError = null;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: _adminIsSignUp ? AppColors.darkCharcoal : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Sign Up',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: _adminIsSignUp ? AppColors.primaryYellow : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Error Banner
            if (_adminError != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline_rounded, color: Colors.red.shade700, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _adminError!,
                        style: TextStyle(fontSize: 12, color: Colors.red.shade900, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

            // FIELD: Name (Sign Up only)
            if (_adminIsSignUp) ...[
              _buildInputLabel('Full Name *'),
              TextFormField(
                controller: _adminNameController,
                textCapitalization: TextCapitalization.words,
                decoration: _buildInputDecoration(
                  hintText: 'Enter admin full name',
                  prefixIcon: Icons.person_outline_rounded,
                ),
                validator: (val) {
                  if (_adminIsSignUp && (val == null || val.trim().isEmpty)) {
                    return 'Please enter name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
            ],

            // FIELD: Mobile Number
            _buildInputLabel('Mobile Number *'),
            TextFormField(
              controller: _adminMobileController,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(10),
              ],
              decoration: _buildInputDecoration(
                hintText: 'Enter 10-digit mobile number',
                prefixIcon: Icons.phone_android_rounded,
              ),
              validator: (val) {
                if (val == null || val.trim().length < 10) {
                  return 'Enter valid 10-digit mobile number';
                }
                return null;
              },
            ),
            const SizedBox(height: 14),

            // FIELD: Location District (Sign Up only)
            if (_adminIsSignUp) ...[
              _buildInputLabel('Location (Tamil Nadu District) *'),
              InkWell(
                onTap: () {
                  _openDistrictPicker(_adminSelectedDistrict, (selected) {
                    setState(() {
                      _adminSelectedDistrict = selected;
                    });
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on_outlined, color: AppColors.darkCharcoal, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _adminSelectedDistrict ?? 'Select Tamil Nadu District',
                          style: TextStyle(
                            fontSize: 14,
                            color: _adminSelectedDistrict != null ? AppColors.textPrimary : Colors.black38,
                            fontWeight: _adminSelectedDistrict != null ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                      ),
                      if (_adminSelectedDistrict != null)
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _adminSelectedDistrict = null;
                            });
                          },
                          child: const Icon(Icons.cancel_rounded, color: Colors.black45, size: 18),
                        )
                      else
                        const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.black45, size: 22),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // FIELD: OTP Code (when OTP sent)
            if (_adminIsOtpSent) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildInputLabel('Enter OTP Code *'),
                  if (_adminOtpTimer > 0)
                    Text(
                      'Resend in ${_adminOtpTimer}s',
                      style: const TextStyle(fontSize: 11, color: AppColors.darkYellow, fontWeight: FontWeight.bold),
                    )
                  else
                    GestureDetector(
                      onTap: _sendAdminOtp,
                      child: const Text(
                        'Resend OTP',
                        style: TextStyle(fontSize: 12, color: AppColors.darkYellow, fontWeight: FontWeight.bold),
                      ),
                    ),
                ],
              ),
              TextFormField(
                controller: _adminOtpController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                decoration: _buildInputDecoration(
                  hintText: 'Enter OTP (Demo: 123456)',
                  prefixIcon: Icons.lock_clock_outlined,
                ),
              ),
              const SizedBox(height: 16),
            ],

            // ACTION BUTTONS
            const SizedBox(height: 6),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _adminIsLoading ? null : _handleAdminSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryYellow,
                  foregroundColor: AppColors.darkCharcoal,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 2,
                ),
                child: _adminIsLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(AppColors.darkCharcoal)),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(_adminIsOtpSent ? Icons.verified_user_rounded : Icons.sms_rounded, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            _adminIsOtpSent
                                ? (_adminIsSignUp ? 'Verify OTP & Register Admin' : 'Verify OTP & Login')
                                : (_adminIsSignUp ? 'Send OTP & Register' : 'Send OTP & Login'),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // HELPER LABELS & DECORATIONS
  Widget _buildInputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12.5,
          fontWeight: FontWeight.w600,
          color: AppColors.darkCharcoal,
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration({
    required String hintText,
    required IconData prefixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: const TextStyle(color: Colors.black38, fontSize: 13.5),
      prefixIcon: Icon(prefixIcon, color: AppColors.darkCharcoal, size: 20),
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.darkCharcoal, width: 1.8),
      ),
    );
  }
}

// ==========================================
// SEARCHABLE DISTRICT PICKER BOTTOM SHEET
// ==========================================
class _DistrictPickerSheet extends StatefulWidget {
  final String? currentSelected;
  final Function(String) onSelect;

  const _DistrictPickerSheet({
    required this.currentSelected,
    required this.onSelect,
  });

  @override
  State<_DistrictPickerSheet> createState() => _DistrictPickerSheetState();
}

class _DistrictPickerSheetState extends State<_DistrictPickerSheet> {
  final _searchController = TextEditingController();
  List<String> _filteredDistricts = kTamilNaduDistricts;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.trim().toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredDistricts = kTamilNaduDistricts;
      } else {
        _filteredDistricts = kTamilNaduDistricts
            .where((district) => district.toLowerCase().contains(query))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag Handle & Header
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4.5,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Select Location',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.darkCharcoal),
                    ),
                    Text(
                      '38 Districts of Tamil Nadu',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded, color: AppColors.darkCharcoal),
                ),
              ],
            ),
          ),
          const Divider(height: 20),

          // Search Box
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Search district (e.g. Chennai, Erode, Madurai)...',
                hintStyle: const TextStyle(fontSize: 13, color: Colors.black38),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.darkCharcoal),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                        },
                      )
                    : null,
                filled: true,
                fillColor: const Color(0xFFF1F5F9),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Districts List
          Expanded(
            child: _filteredDistricts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.location_off_outlined, size: 48, color: Colors.grey.shade400),
                        const SizedBox(height: 8),
                        const Text(
                          'No Tamil Nadu district found',
                          style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    itemCount: _filteredDistricts.length,
                    separatorBuilder: (context, index) => const Divider(height: 1, indent: 44),
                    itemBuilder: (context, index) {
                      final district = _filteredDistricts[index];
                      final isSelected = widget.currentSelected == district;

                      return ListTile(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        tileColor: isSelected ? AppColors.primaryYellow.withValues(alpha: 0.15) : null,
                        leading: Icon(
                          Icons.location_on_rounded,
                          color: isSelected ? AppColors.darkYellow : AppColors.darkCharcoal.withValues(alpha: 0.6),
                          size: 20,
                        ),
                        title: Text(
                          district,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? AppColors.darkCharcoal : AppColors.textPrimary,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check_circle_rounded, color: AppColors.darkYellow, size: 20)
                            : null,
                        onTap: () {
                          widget.onSelect(district);
                          Navigator.pop(context);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
