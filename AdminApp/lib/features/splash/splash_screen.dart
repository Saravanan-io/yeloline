import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/utils/auth_service.dart';
import '../admin/admin_main_layout.dart';
import '../admin/login/admin_login_screen.dart';
import '../main_layout.dart';

/// Pre-computed logo geometry & path metrics to avoid on-frame allocations & computeMetrics() overhead.
class _LogoPathCache {
  static final Path leftWing = Path()
    ..moveTo(15, 15)
    ..lineTo(56, 60)
    ..lineTo(56, 142)
    ..lineTo(15, 75)
    ..close();

  static final Path rightWing = Path()
    ..moveTo(68, 60)
    ..lineTo(109, 15)
    ..lineTo(109, 75)
    ..lineTo(68, 142)
    ..close();

  static final List<Path> wordmarkPaths = [
    // Y
    Path()..moveTo(142, 28)..lineTo(162, 59)..lineTo(162, 90),
    Path()..moveTo(162, 59)..lineTo(182, 28),
    // E1
    Path()..moveTo(202, 33)..lineTo(244, 33),
    Path()..moveTo(202, 59)..lineTo(244, 59),
    Path()..moveTo(202, 85)..lineTo(244, 85),
    // L1
    Path()..moveTo(264, 28)..lineTo(264, 90)..lineTo(298, 90),
    // O
    Path()..addOval(Rect.fromCircle(center: const Offset(338, 59), radius: 26)),
    // L2
    Path()..moveTo(382, 28)..lineTo(382, 90)..lineTo(416, 90),
    // I
    Path()..moveTo(436, 28)..lineTo(436, 90),
    // N
    Path()..moveTo(456, 90)..lineTo(456, 28)..lineTo(496, 90)..lineTo(496, 28),
    // E2
    Path()..moveTo(516, 33)..lineTo(558, 33),
    Path()..moveTo(516, 59)..lineTo(558, 59),
    Path()..moveTo(516, 85)..lineTo(558, 85),
  ];

  static final Path rCircle = Path()
    ..addOval(Rect.fromCircle(center: const Offset(578, 30), radius: 12.5));

  // Pre-cached PathMetric lists for 60-120 FPS path rendering
  static final List<PathMetric> leftWingMetrics = leftWing.computeMetrics().toList();
  static final List<PathMetric> rightWingMetrics = rightWing.computeMetrics().toList();
  static final List<List<PathMetric>> wordmarkMetrics =
      wordmarkPaths.map((p) => p.computeMetrics().toList()).toList();
  static final List<PathMetric> rCircleMetrics = rCircle.computeMetrics().toList();
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _strokeAnimation;
  late Animation<double> _fillAnimation;
  late Animation<double> _subtitleAnimation;
  late Animation<double> _exitFadeAnimation;

  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );

    // Eased cubic curves for buttery smooth 60-120 FPS transitions
    _strokeAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.00, 0.35, curve: Curves.easeInOutCubic),
    );

    _fillAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.30, 0.50, curve: Curves.easeInOutCubic),
    );

    _subtitleAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.45, 0.70, curve: Curves.easeOutCubic),
    );

    _exitFadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.88, 1.00, curve: Curves.easeInOut),
    );

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed && !_hasNavigated) {
        _navigateToMain();
      }
    });

    _controller.forward();
    _checkInitialAuth();
  }

  Future<void> _checkInitialAuth() async {
    final isAdminLoggedIn = await AuthService.isAdminLoggedIn();
    final isUserSkipped = await AuthService.isUserSkipped();
    final isUserLoggedIn = await AuthService.isUserLoggedIn();

    if ((isAdminLoggedIn || isUserSkipped || isUserLoggedIn) && !_hasNavigated) {
      await Future.delayed(const Duration(milliseconds: 600));
      if (!mounted || _hasNavigated) return;
      _navigateToMain();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _navigateToMain() async {
    if (!mounted || _hasNavigated) return;
    _hasNavigated = true;

    final isAdminLoggedIn = await AuthService.isAdminLoggedIn();
    final isUserSkipped = await AuthService.isUserSkipped();
    final isUserLoggedIn = await AuthService.isUserLoggedIn();

    if (!mounted) return;

    Widget targetScreen;
    if (isAdminLoggedIn) {
      targetScreen = const AdminMainLayout();
    } else if (isUserSkipped || isUserLoggedIn) {
      targetScreen = const MainLayout();
    } else {
      targetScreen = const AdminLoginScreen();
    }

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => targetScreen,
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _navigateToMain, // Tap anywhere to skip splash screen
      child: Scaffold(
        backgroundColor: const Color(0xFF000000), // Pure Flat Black
        body: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final double fadeOpacity = (1.0 - _exitFadeAnimation.value).clamp(0.0, 1.0);
            return Opacity(
              opacity: fadeOpacity,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: AspectRatio(
                    aspectRatio: 576 / 127,
                    child: CustomPaint(
                      painter: YelolineLogoPainter(
                        strokeProgress: _strokeAnimation.value,
                        fillProgress: _fillAnimation.value,
                        subtitleProgress: _subtitleAnimation.value,
                      ),
                      size: Size.infinite,
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class YelolineLogoPainter extends CustomPainter {
  final double strokeProgress;
  final double fillProgress;
  final double subtitleProgress;

  YelolineLogoPainter({
    required this.strokeProgress,
    required this.fillProgress,
    required this.subtitleProgress,
  });

  static const Color primaryYellow = Color(0xFFFFD100);

  // Cached TextPainters to avoid rebuild/font layout costs inside paint()
  static final TextPainter _rTextPainter = TextPainter(
    text: TextSpan(
      text: 'R',
      style: GoogleFonts.inter(
        color: primaryYellow,
        fontSize: 15.5,
        fontWeight: FontWeight.w900,
      ),
    ),
    textDirection: TextDirection.ltr,
  )..layout();

  static final TextPainter _subtitleTextPainter = TextPainter(
    text: TextSpan(
      text: 'CONSTRUCTION',
      style: GoogleFonts.inter(
        color: primaryYellow,
        fontSize: 25,
        fontWeight: FontWeight.w800,
        letterSpacing: 10.0,
      ),
    ),
    textDirection: TextDirection.ltr,
  )..layout();

  @override
  void paint(Canvas canvas, Size size) {
    // Content vector bounds: X from 15.0 to 591.0 (width 576), Y from 15.0 to 142.0 (height 127)
    const double contentMinX = 15.0;
    const double contentMaxX = 591.0;
    const double contentWidth = contentMaxX - contentMinX; // 576.0

    const double contentMinY = 15.0;
    const double contentMaxY = 142.0;
    const double contentHeight = contentMaxY - contentMinY; // 127.0

    final double scale = min(size.width / contentWidth, size.height / contentHeight);
    final double dx = (size.width - contentWidth * scale) / 2 - (contentMinX * scale);
    final double dy = (size.height - contentHeight * scale) / 2 - (contentMinY * scale);

    canvas.save();
    canvas.translate(dx, dy);
    canvas.scale(scale);

    // Paints
    final Paint strokePaint = Paint()
      ..color = primaryYellow
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final Paint wordmarkStrokePaint = Paint()
      ..color = primaryYellow
      ..style = PaintingStyle.stroke
      ..strokeWidth = 9.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final Paint fillPaint = Paint()
      ..color = primaryYellow.withValues(alpha: fillProgress)
      ..style = PaintingStyle.fill;

    // 1. STROKE DRAWING STAGE (0.00 - 0.35)
    if (strokeProgress > 0) {
      canvas.drawPath(_extractAnimatedPathFromMetrics(_LogoPathCache.leftWingMetrics, strokeProgress), strokePaint);
      canvas.drawPath(_extractAnimatedPathFromMetrics(_LogoPathCache.rightWingMetrics, strokeProgress), strokePaint);

      for (final metricsList in _LogoPathCache.wordmarkMetrics) {
        canvas.drawPath(_extractAnimatedPathFromMetrics(metricsList, strokeProgress), wordmarkStrokePaint);
      }
    }

    // 2. SOLID LIQUID GOLD FILL STAGE (0.30 - 0.50)
    if (fillProgress > 0) {
      canvas.drawPath(_LogoPathCache.leftWing, fillPaint);
      canvas.drawPath(_LogoPathCache.rightWing, fillPaint);

      final Paint fillWordmarkPaint = Paint()
        ..color = primaryYellow.withValues(alpha: fillProgress)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 9.5
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;

      for (final path in _LogoPathCache.wordmarkPaths) {
        canvas.drawPath(path, fillWordmarkPaint);
      }
    }

    // 3. REGISTERED (R) TRADEMARK SYMBOL
    if (strokeProgress > 0) {
      const Offset center = Offset(578, 30);
      final double rAlpha = fillProgress > 0 ? fillProgress : strokeProgress;

      final Paint ringPaint = Paint()
        ..color = primaryYellow.withValues(alpha: rAlpha)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.2;

      canvas.drawPath(_extractAnimatedPathFromMetrics(_LogoPathCache.rCircleMetrics, strokeProgress), ringPaint);

      if (strokeProgress > 0.2) {
        final Offset textOffset = Offset(
          center.dx - (_rTextPainter.width / 2),
          center.dy - (_rTextPainter.height / 2),
        );
        _rTextPainter.paint(canvas, textOffset);
      }
    }

    // 4. SUBTITLE "CONSTRUCTION" STAGE (0.45 - 0.70)
    if (subtitleProgress > 0) {
      // Smooth scale + fade for subtitle
      const double targetWidth = 416.0;
      final double currentWidth = _subtitleTextPainter.width;
      final double startX = 142.0 + (targetWidth - currentWidth) / 2;

      canvas.save();
      canvas.translate(startX, 118);
      // Fast paint with cached text layout
      _subtitleTextPainter.paint(canvas, Offset.zero);
      canvas.restore();
    }

    canvas.restore();
  }

  Path _extractAnimatedPathFromMetrics(List<PathMetric> metrics, double progress) {
    final Path path = Path();
    for (final metric in metrics) {
      final double extractLength = metric.length * progress;
      path.addPath(metric.extractPath(0.0, extractLength), Offset.zero);
    }
    return path;
  }

  @override
  bool shouldRepaint(covariant YelolineLogoPainter oldDelegate) {
    return oldDelegate.strokeProgress != strokeProgress ||
        oldDelegate.fillProgress != fillProgress ||
        oldDelegate.subtitleProgress != subtitleProgress;
  }
}

