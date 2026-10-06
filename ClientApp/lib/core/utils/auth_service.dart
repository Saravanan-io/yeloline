import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _keyIsAdminLoggedIn = 'is_admin_logged_in';
  static const String _keyIsUserSkipped = 'is_user_skipped';
  static const String _keyIsUserLoggedIn = 'is_user_logged_in';
  static const String _keyUserName = 'user_name';
  static const String _keyUserMobile = 'user_mobile';

  // Client Portal keys
  static const String _keyIsClientPortalLoggedIn = 'is_client_portal_logged_in';
  static const String _keyClientPortalSite = 'client_portal_site';
  static const String _keyClientPortalName = 'client_portal_name';
  static const String _keyClientPortalPhone = 'client_portal_phone';

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

  // ----------------- Client Portal Helpers -----------------
  static Future<bool> isClientPortalLoggedIn() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return prefs.getBool(_keyIsClientPortalLoggedIn) ?? false;
    } catch (e) {
      return false;
    }
  }

  static Future<String?> getClientPortalSite() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return prefs.getString(_keyClientPortalSite);
    } catch (e) {
      return null;
    }
  }

  static Future<String?> getClientPortalName() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return prefs.getString(_keyClientPortalName);
    } catch (e) {
      return null;
    }
  }

  static Future<String?> getClientPortalPhone() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
      return prefs.getString(_keyClientPortalPhone);
    } catch (e) {
      return null;
    }
  }

  static Future<void> setClientPortalLoggedIn(
    bool value, {
    String? siteName,
    String? clientName,
    String? clientPhone,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsClientPortalLoggedIn, value);
      if (siteName != null) await prefs.setString(_keyClientPortalSite, siteName);
      if (clientName != null) await prefs.setString(_keyClientPortalName, clientName);
      if (clientPhone != null) await prefs.setString(_keyClientPortalPhone, clientPhone);
    } catch (_) {}
  }

  static Future<void> logoutClientPortal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyIsClientPortalLoggedIn, false);
      await prefs.remove(_keyClientPortalSite);
      await prefs.remove(_keyClientPortalName);
      await prefs.remove(_keyClientPortalPhone);
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
