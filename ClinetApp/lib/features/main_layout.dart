import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/constants/app_colors.dart';
import '../models/project_model.dart';
import '../widgets/common/custom_bottom_nav.dart';
import '../widgets/common/custom_header.dart';
import 'about/about_screen.dart';
import 'contact/contact_screen.dart';
import 'home/home_screen.dart';
import 'projects/project_details_screen.dart';
import 'projects/projects_screen.dart';
import 'quote/get_quote_screen.dart';
import 'renovation/renovation_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;
  Project? _selectedProject;
  bool _showingAboutScreen = false;
  String _projectsCategory = 'ALL';
  final GlobalKey<GetQuoteScreenState> _quoteScreenKey = GlobalKey<GetQuoteScreenState>();

  void _navigateToTab(int index, [String? category]) {
    setState(() {
      _currentIndex = index;
      _selectedProject = null;
      _showingAboutScreen = false;
      _projectsCategory = category ?? 'ALL';
    });
  }

  void _showProjectDetails(Project project) {
    setState(() {
      _selectedProject = project;
    });
  }

  void _showAboutUs() {
    setState(() {
      _showingAboutScreen = true;
    });
  }

  void _handleBackNavigation() {
    if (_selectedProject != null) {
      setState(() => _selectedProject = null);
    } else if (_showingAboutScreen) {
      _navigateToTab(0);
    } else if (_currentIndex == 2 && (_quoteScreenKey.currentState?.canGoBack() ?? false)) {
      _quoteScreenKey.currentState!.goBack();
    } else if (_currentIndex != 0) {
      _navigateToTab(0);
    } else {
      _showExitConfirmationDialog(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Logout button is ONLY visible on the Home page
    final bool isHomePage = _currentIndex == 0 && !_showingAboutScreen && _selectedProject == null;

    // Bottom navigation bar is visible on Home, Projects, Get Quote Step 1 ONLY, Renovation, and Contact
    final bool showBottomNav = !_showingAboutScreen &&
        _selectedProject == null &&
        (_currentIndex != 2 || (_quoteScreenKey.currentState?.currentStep ?? 0) == 0);

    String? headerTitle;
    bool showHeaderBack = !isHomePage;

    if (_showingAboutScreen) {
      headerTitle = 'About Us';
    } else {
      switch (_currentIndex) {
        case 1:
          headerTitle = 'Our Projects';
          break;
        case 2:
          headerTitle = 'Get Construction Quote';
          break;
        case 3:
          headerTitle = 'Renovation Van';
          break;
        case 4:
          headerTitle = 'Contact Us';
          break;
        default:
          headerTitle = null; // Shows logo.png brand header on Home
      }
    }

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: AppColors.darkCharcoal,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) {
          if (didPop) return;
          _handleBackNavigation();
        },
        child: _selectedProject != null
            ? ProjectDetailsScreen(
                project: _selectedProject!,
                onBack: _handleBackNavigation,
                onGetQuote: () => _navigateToTab(2),
                onContact: () => _navigateToTab(4),
              )
            : Scaffold(
                appBar: CustomHeader(
                  title: headerTitle,
                  showBackButton: showHeaderBack,
                  showLogoutButton: isHomePage,
                  onBackTap: _handleBackNavigation,
                ),
                body: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: _buildBody(),
                ),
                bottomNavigationBar: showBottomNav
                    ? CustomBottomNav(
                        currentIndex: _currentIndex,
                        onTap: (index) {
                          _navigateToTab(index);
                        },
                      )
                    : null,
              ),
      ),
    );
  }

  Future<void> _showExitConfirmationDialog(BuildContext context) async {
    final bool? shouldExit = await showDialog<bool>(
      context: context,
      barrierDismissible: false, // Prevents closing when touching outside the alert box
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          backgroundColor: AppColors.cardWhite,
          surfaceTintColor: Colors.white,
          titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
          contentPadding: const EdgeInsets.symmetric(horizontal: 20),
          actionsPadding: const EdgeInsets.all(16),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: AppColors.lightYellowBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.exit_to_app_rounded,
                  color: AppColors.darkYellow,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Exit App?',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          content: const Text(
            'Are you sure you want to exit Yeloline Construction?',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          actions: [
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, false),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: AppColors.borderLight, width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'No',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryYellow,
                      foregroundColor: AppColors.darkCharcoal,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Yes',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );

    if (shouldExit == true) {
      SystemNavigator.pop();
    }
  }

  Widget _buildBody() {
    if (_showingAboutScreen) {
      return AboutScreen(onContactTap: () => _navigateToTab(4));
    }

    switch (_currentIndex) {
      case 0:
        return HomeScreen(
          onNavigateTab: (idx, [cat]) {
            if (idx == 0) {
              _showAboutUs();
            } else {
              _navigateToTab(idx, cat ?? 'ALL');
            }
          },
          onSelectProject: _showProjectDetails,
        );
      case 1:
        return ProjectsScreen(
          onSelectProject: _showProjectDetails,
          initialCategory: _projectsCategory,
        );
      case 2:
        return GetQuoteScreen(
          key: _quoteScreenKey,
          onGoHome: () => _navigateToTab(0),
          onGoProjects: () => _navigateToTab(1),
          onStepChanged: (_) => setState(() {}),
        );
      case 3:
        return const RenovationScreen();
      case 4:
        return const ContactScreen();
      default:
        return HomeScreen(
          onNavigateTab: _navigateToTab,
          onSelectProject: _showProjectDetails,
        );
    }
  }
}
