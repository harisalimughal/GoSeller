const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electrician', 'Plumber', 'AC Technician', 'Carpenter', 'Painter',
      'Tutor', 'Driver', 'Chef', 'Photographer', 'Beautician',
      'Tailor', 'Mechanic', 'Gardener', 'Security Guard', 'Housekeeper',
      'Interior Designer', 'Architect', 'Lawyer', 'Doctor', 'Consultant',
      'IT Services', 'Marketing', 'Design', 'Writing', 'Translation',
      'Event Planning', 'Wedding Services', 'Cleaning', 'Moving', 'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  // Pricing
  pricingType: {
    type: String,
    enum: ['hourly', 'daily', 'fixed', 'negotiable'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceRange: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  // Service Details
  serviceArea: [{
    type: String,
    trim: true
  }],
  availability: {
    monday: { available: { type: Boolean, default: true }, hours: String },
    tuesday: { available: { type: Boolean, default: true }, hours: String },
    wednesday: { available: { type: Boolean, default: true }, hours: String },
    thursday: { available: { type: Boolean, default: true }, hours: String },
    friday: { available: { type: Boolean, default: true }, hours: String },
    saturday: { available: { type: Boolean, default: true }, hours: String },
    sunday: { available: { type: Boolean, default: true }, hours: String }
  },
  experience: {
    years: { type: Number, min: 0 },
    description: String
  },
  qualifications: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    validUntil: Date
  }],
  // Media
  images: [{
    type: String,
    required: true
  }],
  portfolio: [{
    title: String,
    description: String,
    image: String,
    beforeImage: String,
    afterImage: String
  }],
  // Contact & Location
  contactInfo: {
    phone: String,
    whatsapp: String,
    email: String,
    website: String
  },
  location: {
    address: String,
    city: String,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Tags & SEO
  tags: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  // SQL Level Features
  SQL_level: {
    type: String,
    enum: ['Free', 'Basic', 'Normal', 'High', 'VIP'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'draft'],
    default: 'pending'
  },
  // SEO Fields
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [{
    type: String,
    trim: true
  }],
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    enum: ['id_proof', 'address_proof', 'certification', 'portfolio', 'insurance'],
    required: true
  }],
  // PSS, EDR, EMO Verification
  verificationStatus: {
    pss: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, verifiedAt: Date, verifiedBy: String },
    edr: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, verifiedAt: Date, verifiedBy: String },
    emo: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, verifiedAt: Date, verifiedBy: String }
  },
  // Business Details
  businessDetails: {
    businessName: String,
    businessType: { type: String, enum: ['individual', 'company', 'partnership'] },
    registrationNumber: String,
    taxNumber: String,
    insurance: {
      hasInsurance: { type: Boolean, default: false },
      provider: String,
      policyNumber: String,
      validUntil: Date
    }
  },
  // Service Specific
  serviceFeatures: [{
    type: String,
    trim: true
  }],
  serviceInclusions: [{
    type: String,
    trim: true
  }],
  serviceExclusions: [{
    type: String,
    trim: true
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
serviceSchema.index({ slug: 1 });
serviceSchema.index({ sellerId: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ SQL_level: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ verified: 1 });
serviceSchema.index({ views: -1 });
serviceSchema.index({ inquiries: -1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ 'location.city': 1 });
serviceSchema.index({ 'location.area': 1 });

// Pre-save middleware
serviceSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  this.updatedAt = new Date();
  next();
});

// Instance methods
serviceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

serviceSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

serviceSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

serviceSchema.methods.isAvailable = function(day) {
  return this.availability[day.toLowerCase()]?.available || false;
};

serviceSchema.methods.getPriceDisplay = function() {
  if (this.pricingType === 'negotiable') {
    return 'Negotiable';
  }
  if (this.priceRange.min && this.priceRange.max) {
    return `${this.currency} ${this.priceRange.min} - ${this.priceRange.max}`;
  }
  return `${this.currency} ${this.price}`;
};

serviceSchema.methods.isFullyVerified = function() {
  return this.verificationStatus.pss.status === 'approved' &&
         this.verificationStatus.edr.status === 'approved' &&
         this.verificationStatus.emo.status === 'approved';
};

// Static methods
serviceSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true, status: 'approved' });
};

serviceSchema.statics.findByCategory = function(category) {
  return this.find({
    category,
    isActive: true,
    status: 'approved'
  }).populate('sellerId', 'name shopName location SQL_level verified');
};

serviceSchema.statics.findBySQLLevel = function(sqlLevel) {
  return this.find({
    SQL_level: sqlLevel,
    isActive: true,
    status: 'approved'
  }).populate('sellerId', 'name shopName location SQL_level verified');
};

serviceSchema.statics.findTrending = function(limit = 10) {
  return this.find({
    isActive: true,
    status: 'approved'
  })
  .populate('sellerId', 'name shopName SQL_level verified')
  .sort({ views: -1, inquiries: -1 })
  .limit(limit);
};

serviceSchema.statics.searchServices = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    status: 'approved'
  };

  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    searchQuery.price = {};
    if (filters.minPrice) searchQuery.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) searchQuery.price.$lte = parseFloat(filters.maxPrice);
  }

  if (filters.sqlLevel) {
    searchQuery.SQL_level = filters.sqlLevel;
  }

  if (filters.location) {
    searchQuery['location.city'] = { $regex: filters.location, $options: 'i' };
  }

  if (filters.verified) {
    searchQuery.verified = filters.verified === 'true';
  }

  return this.find(searchQuery)
    .populate('sellerId', 'name shopName location SQL_level verified')
    .sort({ createdAt: -1 });
};

serviceSchema.statics.getPopularTags = function(limit = 20) {
  return this.aggregate([
    { $match: { isActive: true, status: 'approved' } },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

serviceSchema.statics.getServiceStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalServices: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalInquiries: { $sum: '$inquiries' },
        averageRating: { $avg: '$rating.average' },
        categoryStats: {
          $push: '$category'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Service', serviceSchema);
