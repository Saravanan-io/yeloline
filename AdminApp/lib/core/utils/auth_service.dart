import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _keyIsAdminLoggedIn = 'is_admin_logged_in';
  static const String _keyIsUserSkipped = 'is_user_skipped';
  static const String _keyIsUserLoggedIn = 'is_user_logged_in';
  static const String _keyUserName = 'user_name';
  static const String _keyUserMobile = 'user_mobile';

  static Future<bool> isAdminLoggedIn() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return prefs.getBool(_keyIsAdminLoggedIn) ?? false;
    } catch (e) {
      return false;
    }
  }

  static Future<void> setAdminLoggedIn(bool value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsAdminLoggedIn, value);
      if (value) {
        await prefs.setBool(_keyIsUserSkipped, false);
        await prefs.setBool(_keyIsUserLoggedIn, false);
      }
    } catch (_) {}
  }

  static Future<bool> isUserLoggedIn() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return prefs.getBool(_keyIsUserLoggedIn) ?? prefs.getBool(_keyIsUserSkipped) ?? false;
    } catch (e) {
      return false;
    }
  }

  static Future<void> setUserLoggedIn(bool value, {String? name, String? mobile}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsUserLoggedIn, value);
      await prefs.setBool(_keyIsUserSkipped, value);
      if (name != null) await prefs.setString(_keyUserName, name);
      if (mobile != null) await prefs.setString(_keyUserMobile, mobile);
    } catch (_) {}
  }

  static Future<bool> isUserSkipped() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return prefs.getBool(_keyIsUserSkipped) ?? false;
    } catch (e) {
      return false;
    }
  }

  static Future<void> setUserSkipped(bool value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsUserSkipped, value);
    } catch (_) {}
  }

  static Future<void> logoutAdmin() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsAdminLoggedIn, false);
    } catch (_) {}
  }

  static Future<void> clearAllSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (_) {}
  }
}
