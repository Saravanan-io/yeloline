import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/firebase_service.dart';
import '../../core/utils/url_helper.dart';
import '../../models/project_model.dart';
import '../../widgets/cards/quick_action_card.dart';
import '../../widgets/cards/stat_card.dart';
import '../../widgets/icons/whatsapp_icon.dart';
import '../../widgets/common/app_image.dart';

class HomeScreen extends StatelessWidget {
  final Function(int index, [String? category]) onNavigateTab;
  final Function(Project project)? onSelectProject;

  const HomeScreen({
    super.key,
    required this.onNavigateTab,
    this.onSelectProject,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ColoredBox(
          color: AppColors.darkCharcoal,
          child: SingleChildScrollView(
            physics: const ClampingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Modern Hero Banner Section
                _buildHeroSection(context),

                Container(
                  color: AppColors.backgroundLight,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 14),

                      // Core Services & Navigation Section
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 4,
                                  height: 20,
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryYellow,
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Text(
                                  'Explore Services & Details',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            _buildQuickNavigationGrid(context),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Featured Villa Projects Preview Section
                      _buildFeaturedProjectsSection(context),

                      const SizedBox(height: 28),

                      // Company Statistics Dark Banner
                      _buildCompanyStatsBanner(),

                      const SizedBox(height: 28),

                      // Call to Action Banner
                      _buildQuoteCTABanner(context),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        // Persistent Floating Contact Buttons on Right Side
        Positioned(
          right: 16,
          bottom: 24,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildFloatingContactButton(
                context: context,
                backgroundColor: const Color(0xFF2563EB), // Blue for Call Us
                icon: const Icon(Icons.phone_in_talk_rounded, color: Colors.white, size: 22),
                tooltip: 'Call Us',
                onTap: () => _showContactModal(context, 'Call', '+91 98765 43210'),
              ),
              const SizedBox(height: 12),
              _buildFloatingContactButton(
                context: context,
                backgroundColor: const Color(0xFF25D366), // Official Green for WhatsApp
                icon: const WhatsAppIcon(size: 22, color: Colors.white),
                tooltip: 'WhatsApp',
                onTap: () => _showContactModal(context, 'WhatsApp', '+91 98765 43210'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFloatingContactButton({
    required BuildContext context,
    required Color backgroundColor,
    required Widget icon,
    required String tooltip,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: backgroundColor.withValues(alpha: 0.35),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: backgroundColor,
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Tooltip(
            message: tooltip,
            child: Padding(
              padding: const EdgeInsets.all(13.0),
              child: icon,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.darkCharcoal,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Hero Villa Image Background with Dark Overlay Gradient
          Container(
            height: 220,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: AppColors.darkCharcoal,
              image: DecorationImage(
                image: NetworkImage(
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
                ),
                fit: BoxFit.cover,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.darkCharcoal.withValues(alpha: 0.92),
                    AppColors.darkCharcoal.withValues(alpha: 0.65),
                    AppColors.darkCharcoal.withValues(alpha: 0.95),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // Hero Content Text
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Top Tag Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      gradient: AppColors.yellowGradient,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryYellow.withValues(alpha: 0.4),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Text(
                      'YELOLINE CONSTRUCTION',
                      style: TextStyle(
                        color: AppColors.darkCharcoal,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  RichText(
                    text: const TextSpan(
                      children: [
                        TextSpan(
                          text: 'Building trust.\n',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            height: 1.15,
                            letterSpacing: -0.5,
                          ),
                        ),
                        TextSpan(
                          text: 'Delivering quality homes.',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryYellow,
                            height: 1.15,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'From dream to key, we build with integrity and precision.',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickNavigationGrid(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.55,
      children: [
        QuickActionCard(
          icon: Icons.info_outline_rounded,
          title: 'About Us',
          onTap: () => onNavigateTab(0),
        ),
        QuickActionCard(
          icon: Icons.apartment_rounded,
          title: 'Our Projects',
          onTap: () => onNavigateTab(1),
        ),
        QuickActionCard(
          icon: Icons.request_quote_rounded,
          title: 'Get Quote',
          onTap: () => onNavigateTab(2),
        ),
        QuickActionCard(
          icon: Icons.local_shipping_rounded,
          title: 'Renovation Van',
          onTap: () => onNavigateTab(3),
        ),
      ],
    );
  }

  Widget _buildCompanyStatsBanner() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.verified_rounded, color: AppColors.primaryYellow, size: 18),
              SizedBox(width: 8),
              Text(
                'PHILOSOPHY OF YELOLINE',
                style: TextStyle(
                  color: AppColors.primaryYellow,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: const [
              Expanded(
                child: StatCard(
                  icon: Icons.calendar_today_rounded,
                  title: '2017',
                  subtitle: 'Founded',
                  description: 'Building trust since 2017',
                  isDark: true,
                  isCompact: true,
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: StatCard(
                  icon: Icons.military_tech_rounded,
                  title: '30+',
                  subtitle: 'Projects',
                  description: 'Successfully completed homes',
                  isDark: true,
                  isCompact: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: const [
              Expanded(
                child: SizedBox.shrink(),
              ),
              Expanded(
                flex: 2,
                child: StatCard(
                  icon: Icons.location_on_rounded,
                  title: 'Erode',
                  subtitle: 'Based',
                  description: 'Proudly serving Erode & nearby',
                  isDark: true,
                  isCompact: true,
                ),
              ),
              Expanded(
                child: SizedBox.shrink(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuoteCTABanner(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.yellowGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryYellow.withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Planning your Dream Home?',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.darkCharcoal,
                    letterSpacing: -0.3,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Get an instant material & rate estimate in 3 simple steps.',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: AppColors.darkCharcoal,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: () => onNavigateTab(2),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.darkCharcoal,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Get Quote',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                ),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.primaryYellow),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showContactModal(BuildContext context, String type, String number) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.borderLight,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Icon(
                type == 'Call' ? Icons.phone_in_talk_rounded : Icons.chat_rounded,
                size: 48,
                color: AppColors.primaryYellow,
              ),
              const SizedBox(height: 12),
              Text(
                'Connect via $type',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Our construction experts are ready to assist you.',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.backgroundLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  number,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    if (type == 'Call') {
                      UrlHelper.makePhoneCall(number);
                    } else {
                      UrlHelper.openWhatsApp(number);
                    }
                  },
                  child: Text('Start $type Now', style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFeaturedProjectsSection(BuildContext context) {
    return StreamBuilder<List<Project>>(
      stream: FirebaseService().streamProjects(),
      initialData: Project.sampleProjects,
      builder: (context, snapshot) {
        final all = snapshot.data ?? Project.sampleProjects;
        final completedProjects = all.where((p) {
          final cat = p.category.toLowerCase();
          final status = p.status.toLowerCase();
          return cat.contains('completed') || status.contains('completed');
        }).toList();

        final displayProjects = completedProjects.isNotEmpty ? completedProjects : all;

        if (displayProjects.isEmpty) {
          return const SizedBox.shrink();
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 4,
                        height: 20,
                        decoration: BoxDecoration(
                          color: AppColors.primaryYellow,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Completed Projects',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: () => onNavigateTab(1, 'Completed'),
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      child: Row(
                        children: [
                          Text(
                            'View All ',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.darkYellow,
                            ),
                          ),
                          Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.darkYellow),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            _AutoScrollProjectsList(
              projects: displayProjects,
              onSelectProject: onSelectProject,
              onNavigateTab: onNavigateTab,
            ),
          ],
        );
      },
    );
  }
}

class _AutoScrollProjectsList extends StatefulWidget {
  final List<Project> projects;
  final Function(Project project)? onSelectProject;
  final Function(int index, [String? category]) onNavigateTab;

  const _AutoScrollProjectsList({
    required this.projects,
    required this.onSelectProject,
    required this.onNavigateTab,
  });

  @override
  State<_AutoScrollProjectsList> createState() => _AutoScrollProjectsListState();
}

class _AutoScrollProjectsListState extends State<_AutoScrollProjectsList> {
  late final ScrollController _scrollController;
  Timer? _timer;
  int _currentIndex = 0;
  static const double _cardStepOffset = 264.0;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _startAutoScroll();
  }

  void _startAutoScroll() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (!_scrollController.hasClients || widget.projects.isEmpty) return;

      _currentIndex = (_currentIndex + 1) % widget.projects.length;
      final targetOffset = _currentIndex * _cardStepOffset;

      _scrollController.animateTo(
        targetOffset,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 170,
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: widget.projects.length,
        itemBuilder: (context, index) {
          final project = widget.projects[index];
          final isCompleted = project.category == 'Completed';

          return GestureDetector(
            onTap: () {
              if (widget.onSelectProject != null) {
                widget.onSelectProject!(project);
              } else {
                widget.onNavigateTab(1, 'Completed');
              }
            },
            child: Container(
              width: 250,
              margin: const EdgeInsets.only(right: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.14),
                    blurRadius: 12,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  AppImage(
                    url: project.heroImageUrl,
                    fit: BoxFit.cover,
                    errorWidget: Container(
                      color: AppColors.cardDark,
                      child: const Center(
                        child: Icon(Icons.home_work_rounded, color: AppColors.primaryYellow, size: 40),
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.85),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 12,
                    right: 12,
                    bottom: 12,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isCompleted ? AppColors.successGreen : AppColors.warningOrange,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isCompleted ? Icons.check_circle_rounded : Icons.access_time_rounded,
                                size: 11,
                                color: Colors.white,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                isCompleted ? 'Completed' : 'Ongoing',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          project.title,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.3,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Row(
                          children: [
                            const Icon(Icons.location_on_rounded, color: AppColors.primaryYellow, size: 13),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                project.location,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white70,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

