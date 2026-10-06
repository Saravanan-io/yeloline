class Project {
  final String id;
  final String title;
  final String location;
  final String category; // 'Completed', 'Ongoing'
  final String type; // e.g. '4 BHK Villa'
  final String area; // e.g. '5,896 sq.ft.'
  final String status; // 'Completed', 'Ongoing'
  final String heroImageUrl;
  final List<String> galleryImages;
  final String description;
  final List<String> highlights;
  final List<String> features;
  final List<String> materials;

  const Project({
    required this.id,
    required this.title,
    required this.location,
    required this.category,
    required this.type,
    required this.area,
    required this.status,
    required this.heroImageUrl,
    required this.galleryImages,
    required this.description,
    required this.highlights,
    required this.features,
    required this.materials,
  });

  factory Project.fromMap(Map<String, dynamic> map, [String? docId]) {
    final rawGallery = map['gallery_images'] ?? map['galleryImages'];
    final List<String> parsedGallery = [];
    if (rawGallery is List) {
      for (final item in rawGallery) {
        String? urlStr;
        if (item is String && item.isNotEmpty) {
          urlStr = item;
        } else if (item is Map && item['url'] != null) {
          urlStr = item['url'].toString();
        }
        if (urlStr != null && urlStr.isNotEmpty) {
          if (urlStr.startsWith('blob:')) {
            urlStr = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';
          }
          parsedGallery.add(urlStr);
        }
      }
    }

    final rawHero = map['heroImageUrl'] ?? map['cover_image'] ?? '';
    var hero = (rawHero is String && rawHero.isNotEmpty) ? rawHero : '';
    if (hero.isEmpty || hero.startsWith('blob:')) {
      hero = parsedGallery.isNotEmpty
          ? parsedGallery.first
          : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';
    }

    final rawStatus = map['status']?.toString() ?? 'Completed';
    final rawCategory = map['category']?.toString() ?? rawStatus;

    return Project(
      id: docId ?? map['project_id']?.toString() ?? map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? 'Project',
      location: map['location']?.toString() ?? 'Erode, Tamil Nadu',
      category: rawCategory,
      type: map['type']?.toString() ?? map['category']?.toString() ?? 'Residential',
      area: map['area']?.toString() ?? (map['area_sqft'] != null ? '${map['area_sqft']} sq.ft.' : '3,000 sq.ft.'),
      status: rawStatus,
      heroImageUrl: hero,
      galleryImages: parsedGallery.isNotEmpty ? parsedGallery : [hero],
      description: map['description']?.toString() ?? map['overview']?.toString() ?? '',
      highlights: List<String>.from(map['highlights'] ?? []),
      features: List<String>.from(map['features'] ?? map['quality_standards'] ?? []),
      materials: List<String>.from(map['materials'] ?? map['quality_standards'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'project_id': id,
      'id': id,
      'title': title,
      'location': location,
      'category': category,
      'type': type,
      'area': area,
      'status': status,
      'heroImageUrl': heroImageUrl,
      'cover_image': heroImageUrl,
      'gallery_images': galleryImages,
      'description': description,
      'overview': description,
      'highlights': highlights,
      'features': features,
      'materials': materials,
    };
  }

  // All mock project data completely removed
  static const List<Project> sampleProjects = [];
}
