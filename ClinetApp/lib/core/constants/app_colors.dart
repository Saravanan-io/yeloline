import 'package:flutter/material.dart';

class AppColors {
  // Brand Yellows & Gold
  static const Color primaryYellow = Color(0xFFFFB800);
  static const Color accentGold = Color(0xFFF59E0B);
  static const Color lightYellowBg = Color(0xFFFFFBEB);
  static const Color darkYellow = Color(0xFFD97706);

  // Dark Accents & Surfaces
  static const Color darkCharcoal = Color(0xFF0F172A);
  static const Color headerDark = Color(0xFF1E293B);
  static const Color cardDark = Color(0xFF111827);

  // Neutrals & Backgrounds
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color cardWhite = Color(0xFFFFFFFF);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color inputBackground = Color(0xFFF1F5F9);

  // Typography Colors
  static const Color textPrimary = Color(0xFF000000);
  static const Color textSecondary = Color(0xFF1E293B);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textOnDark = Color(0xFFFFFFFF);

  // Status & Accents
  static const Color successGreen = Color(0xFF10B981);
  static const Color infoBlue = Color(0xFF3B82F6);
  static const Color warningOrange = Color(0xFFF97316);

  // Gradients
  static const LinearGradient yellowGradient = LinearGradient(
    colors: [Color(0xFFFFC72C), Color(0xFFFF9E00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
