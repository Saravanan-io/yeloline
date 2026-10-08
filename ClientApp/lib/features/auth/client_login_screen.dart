import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/auth_service.dart';
import '../client_portal/client_portal_main_layout.dart';
import '../main_layout.dart';

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
];

enum _LoginPortalType { customer, clientPortal }

class ClientLoginScreen extends StatefulWidget {
  const ClientLoginScreen({super.key});

  @override
  State<ClientLoginScreen> createState() => _ClientLoginScreenState();
}

class _ClientLoginScreenState extends State<ClientLoginScreen> {
  _LoginPortalType _selectedPortal = _LoginPortalType.customer;

  // Customer Login State
  bool _isSignUp = false;
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _otpController = TextEditingController();
  String? _selectedDistrict;
  bool _isOtpSent = false;
  int _otpTimer = 30;
  Timer? _timerObj;
  bool _isLoading = false;
  String? _errorMessage;

  // Client Portal State
  final _clientPortalFormKey = GlobalKey<FormState>();
  final _clientPhoneController = TextEditingController();
  final _clientPasswordController = TextEditingController();
  bool _obscurePortalPassword = true;
  bool _isPortalLoading = false;
  String? _portalErrorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _otpController.dispose();
    _clientPhoneController.dispose();
    _clientPasswordController.dispose();
    _timerObj?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _otpTimer = 30;
    _timerObj?.cancel();
    _timerObj = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_otpTimer > 0) {
        setState(() {
          _otpTimer--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _handleSendOtp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _isOtpSent = true;
    });
    _startTimer();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('OTP sent successfully! Enter 123456 to verify.'),
        backgroundColor: Colors.green,
        duration: Duration(seconds: 3),
      ),
    );
  }

  Future<void> _handleVerifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      setState(() {
        _errorMessage = 'Please enter 6-digit OTP code.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    if (otp == '123456') {
      final name = _nameController.text.trim().isNotEmpty
          ? _nameController.text.trim()
          : 'Client User';
      final phone = _mobileController.text.trim();

      await AuthService.setUserLoggedIn(true, name: name, mobile: phone);

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const MainLayout()),
      );
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Invalid OTP code. Try entering 123456.';
      });
    }
  }

  Future<void> _handleClientPortalLogin() async {
    final phone = _clientPhoneController.text.trim().replaceAll(RegExp(r'\D'), '');
    final password = _clientPasswordController.text.trim();

    if (phone.isEmpty) {
      setState(() {
        _portalErrorMessage = 'Please enter your registered mobile number.';
      });
      return;
    }

    if (phone.length != 10) {
      setState(() {
        _portalErrorMessage = 'Please enter a valid 10-digit mobile number.';
      });
      return;
    }

    if (password.isEmpty) {
      setState(() {
        _portalErrorMessage = 'Please enter your password registered by administrator.';
      });
      return;
    }

    setState(() {
      _isPortalLoading = true;
      _portalErrorMessage = null;
    });

    try {
      // 1. Query Firestore 'sites' collection directly
      final sitesSnapshot = await FirebaseFirestore.instance.collection('sites').get();

      // 2. Also query 'users' collection for client credentials
      QuerySnapshot? usersSnapshot;
      try {
        usersSnapshot = await FirebaseFirestore.instance.collection('users').get();
      } catch (_) {}

      // Find matching site created by admin for this registered mobile number
      Map<String, dynamic>? matchingSiteData;
      String resolvedSite = '';
      String resolvedClientName = '';
      String registeredPassword = '';

      for (final doc in sitesSnapshot.docs) {
        final d = doc.data();
        final cPhone = d['client_phone']?.toString().replaceAll(RegExp(r'\D'), '') ?? '';
        final sPhone = d['phone']?.toString().replaceAll(RegExp(r'\D'), '') ?? '';

        if (cPhone == phone || sPhone == phone) {
          final sName = d['site_name']?.toString() ?? d['name']?.toString() ?? '';
          matchingSiteData = d;
          resolvedSite = sName;
          resolvedClientName = d['client_name']?.toString() ?? d['clientName']?.toString() ?? '';
          registeredPassword = d['client_password']?.toString() ?? d['password']?.toString() ?? '';
          break;
        }
      }

      // If registeredPassword is not on site doc, check 'users' collection
      if (registeredPassword.isEmpty && usersSnapshot != null) {
        for (final doc in usersSnapshot.docs) {
          final raw = doc.data();
          if (raw is! Map) continue;
          final u = Map<String, dynamic>.from(raw);
          final uPhone = u['phone']?.toString().replaceAll(RegExp(r'\D'), '') ?? '';
          final role = u['role']?.toString().toLowerCase() ?? '';
          if (uPhone == phone && (role.isEmpty || role == 'client')) {
            registeredPassword = u['password']?.toString() ?? '';
            if (resolvedSite.isEmpty) {
              resolvedSite = u['site_name']?.toString() ?? '';
            }
            if (resolvedClientName.isEmpty) {
              resolvedClientName = u['name']?.toString() ?? u['full_name']?.toString() ?? '';
            }
            break;
          }
        }
      }

      // STRICT VALIDATION:
      // A) Does this mobile number match a site registered by admin?
      if (matchingSiteData == null && resolvedSite.isEmpty) {
        setState(() {
          _isPortalLoading = false;
          _portalErrorMessage = 'No site registered for mobile number $phone. Only clients registered by admin can log in.';
        });
        return;
      }

      // B) Did the admin register a password for this site?
      if (registeredPassword.isEmpty) {
        setState(() {
          _isPortalLoading = false;
          _portalErrorMessage = 'No password found for this account. Please contact the site administrator.';
        });
        return;
      }

      // C) Does the entered password match the registered password?
      if (registeredPassword.trim() != password) {
        setState(() {
          _isPortalLoading = false;
          _portalErrorMessage = 'Incorrect password. Please enter the password registered by your site administrator.';
        });
        return;
      }

      // Login Successful: Save session and navigate
      await AuthService.setClientPortalLoggedIn(
        true,
        siteName: resolvedSite,
        clientName: resolvedClientName.isNotEmpty ? resolvedClientName : null,
        clientPhone: phone,
      );

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => ClientPortalMainLayout(initialSiteName: resolvedSite),
        ),
      );
    } catch (e) {
      setState(() {
        _isPortalLoading = false;
        _portalErrorMessage = 'Authentication error: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isWide = size.width > 768;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: isWide ? 40 : 20,
              vertical: 24,
            ),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo Header
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.darkCharcoal,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.12),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: CustomPaint(
                            painter: _SimpleLogoPainter(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'YELOLINE',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2,
                            color: AppColors.darkCharcoal,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'CONSTRUCTION & RENOVATION PORTAL',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: AppColors.primaryYellow,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Portal Selection Tabs: [ Customer Login ] | [ Client Portal ]
                  _buildPortalSelectorTabs(),

                  const SizedBox(height: 16),

                  // Login Card (Customer Login OR Client Portal)
                  if (_selectedPortal == _LoginPortalType.customer)
                    _buildCustomerLoginCard()
                  else
                    _buildClientPortalLoginCard(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPortalSelectorTabs() {
    return Container(
      height: 48,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedPortal = _LoginPortalType.customer;
                  _errorMessage = null;
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                decoration: BoxDecoration(
                  color: _selectedPortal == _LoginPortalType.customer
                      ? AppColors.darkCharcoal
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: _selectedPortal == _LoginPortalType.customer
                      ? [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.12),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.person_pin_rounded,
                      size: 18,
                      color: _selectedPortal == _LoginPortalType.customer
                          ? AppColors.primaryYellow
                          : AppColors.textSecondary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Customer Login',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: _selectedPortal == _LoginPortalType.customer
                            ? Colors.white
                            : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedPortal = _LoginPortalType.clientPortal;
                  _portalErrorMessage = null;
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                decoration: BoxDecoration(
                  color: _selectedPortal == _LoginPortalType.clientPortal
                      ? AppColors.darkCharcoal
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: _selectedPortal == _LoginPortalType.clientPortal
                      ? [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.12),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.apartment_rounded,
                      size: 18,
                      color: _selectedPortal == _LoginPortalType.clientPortal
                          ? AppColors.primaryYellow
                          : AppColors.textSecondary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Client Portal',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: _selectedPortal == _LoginPortalType.clientPortal
                            ? Colors.white
                            : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClientPortalLoginCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.primaryYellow.withValues(alpha: 0.6),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Form(
        key: _clientPortalFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primaryYellow.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.apartment_rounded,
                    color: AppColors.darkCharcoal,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Client Portal Login',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.darkCharcoal,
                        ),
                      ),
                      Text(
                        'Live Dashboard, Bills & Breakup Status',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),

            // Field 1: Registered Mobile Number
            _buildInputLabel('Registered Mobile Number *'),
            TextFormField(
              controller: _clientPhoneController,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(10),
              ],
              decoration: _buildInputDecoration(
                hintText: 'Enter 10-digit registered mobile number',
                prefixIcon: Icons.phone_android_rounded,
              ),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),

            const SizedBox(height: 16),

            // Field 2: Password
            _buildInputLabel('Password *'),
            TextFormField(
              controller: _clientPasswordController,
              obscureText: _obscurePortalPassword,
              decoration: _buildInputDecoration(
                hintText: 'Enter password registered by admin',
                prefixIcon: Icons.lock_outline_rounded,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePortalPassword
                        ? Icons.visibility_off_rounded
                        : Icons.visibility_rounded,
                    color: AppColors.textMuted,
                    size: 20,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePortalPassword = !_obscurePortalPassword;
                    });
                  },
                ),
              ),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),

            if (_portalErrorMessage != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Colors.red, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _portalErrorMessage!,
                        style: const TextStyle(color: Colors.red, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isPortalLoading ? null : _handleClientPortalLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryYellow,
                  foregroundColor: AppColors.darkCharcoal,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isPortalLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: AppColors.darkCharcoal,
                        ),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.login_rounded, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Enter Client Portal',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 14),

            // Firestore Live Note
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.sync_rounded, size: 14, color: AppColors.textMuted),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Live synced with Yeloline Admin Panel via Firebase Firestore. Admin entries reflect instantly.',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerLoginCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.primaryYellow.withValues(alpha: 0.4),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Title
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryYellow.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.person_pin_rounded,
                    color: AppColors.darkCharcoal,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isSignUp ? 'Customer Sign Up' : 'Customer Login',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.darkCharcoal,
                        ),
                      ),
                      const Text(
                        'House Owners & Construction Clients',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Form Fields
            if (_isSignUp) ...[
              _buildInputLabel('Full Name'),
              TextFormField(
                controller: _nameController,
                decoration: _buildInputDecoration(
                  hintText: 'Enter your full name',
                  prefixIcon: Icons.person_outline_rounded,
                ),
                validator: (val) {
                  if (_isSignUp && (val == null || val.trim().isEmpty)) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
            ],

            _buildInputLabel('Mobile Number'),
            TextFormField(
              controller: _mobileController,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(10),
              ],
              decoration: _buildInputDecoration(
                hintText: '10-digit mobile number',
                prefixIcon: Icons.phone_android_rounded,
              ),
              validator: (val) {
                if (val == null || val.trim().length != 10) {
                  return 'Please enter valid 10-digit mobile number';
                }
                return null;
              },
            ),
            const SizedBox(height: 14),

            if (_isSignUp) ...[
              _buildInputLabel('District (Tamil Nadu)'),
              DropdownButtonFormField<String>(
                initialValue: _selectedDistrict,
                decoration: _buildInputDecoration(
                  hintText: 'Select your district',
                  prefixIcon: Icons.location_on_outlined,
                ),
                items: kTamilNaduDistricts.map((district) {
                  return DropdownMenuItem(
                    value: district,
                    child: Text(district),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedDistrict = val;
                  });
                },
                validator: (val) {
                  if (_isSignUp && val == null) {
                    return 'Please select your district';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
            ],

            if (_isOtpSent) ...[
              _buildInputLabel('Enter OTP'),
              TextFormField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                decoration: _buildInputDecoration(
                  hintText: 'Enter 6-digit OTP (e.g. 123456)',
                  prefixIcon: Icons.lock_outline_rounded,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _otpTimer > 0 ? 'Resend OTP in ${_otpTimer}s' : 'Didn\'t receive OTP?',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                  if (_otpTimer == 0)
                    TextButton(
                      onPressed: _handleSendOtp,
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Resend Now',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.darkCharcoal,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
            ],

            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Colors.red, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Action Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isLoading
                    ? null
                    : (_isOtpSent ? _handleVerifyOtp : _handleSendOtp),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryYellow,
                  foregroundColor: AppColors.darkCharcoal,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: AppColors.darkCharcoal,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _isOtpSent ? Icons.check_circle_outline_rounded : Icons.sms_rounded,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isOtpSent
                                ? (_isSignUp ? 'Verify OTP & Register' : 'Verify OTP & Login')
                                : (_isSignUp ? 'Send OTP & Register' : 'Send OTP & Login'),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 16),

            // Sign Up option below the login field/button
            Center(
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _isSignUp = !_isSignUp;
                    _errorMessage = null;
                    _isOtpSent = false;
                  });
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      children: [
                        TextSpan(
                          text: _isSignUp
                              ? 'Already have an account? '
                              : 'Don\'t have an account? ',
                        ),
                        TextSpan(
                          text: _isSignUp ? 'Sign In' : 'Sign Up',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.darkCharcoal,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: AppColors.darkCharcoal,
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration({
    required String hintText,
    required IconData prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
      prefixIcon: Icon(prefixIcon, size: 18, color: AppColors.textSecondary),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primaryYellow, width: 2),
      ),
    );
  }
}

class _SimpleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primaryYellow
      ..style = PaintingStyle.fill;

    final path1 = Path()
      ..moveTo(size.width * 0.15, size.height * 0.15)
      ..lineTo(size.width * 0.48, size.height * 0.45)
      ..lineTo(size.width * 0.48, size.height * 0.85)
      ..lineTo(size.width * 0.15, size.height * 0.55)
      ..close();

    final path2 = Path()
      ..moveTo(size.width * 0.52, size.height * 0.45)
      ..lineTo(size.width * 0.85, size.height * 0.15)
      ..lineTo(size.width * 0.85, size.height * 0.55)
      ..lineTo(size.width * 0.52, size.height * 0.85)
      ..close();

    canvas.drawPath(path1, paint);
    canvas.drawPath(path2, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
