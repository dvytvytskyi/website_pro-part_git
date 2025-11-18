import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.pro-part.online/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'fyr_8f968d115244e76d209a26f5177c5c998aca0e8dbce4a6e9071b2bc43b78f6d2';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '5c8335f9c7e476cbe77454fd32532cc68f57baf86f7f96e6bafcf682f98b275bc579d73484cf5bada7f4cd7d071b122778b71f414fb96b741c5fe60394d1795f';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dgv0rxd60';

/**
 * Generate Cloudinary URL from public_id
 */
export function generateCloudinaryUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  resourceType?: 'image' | 'video' | 'raw';
}): string {
  if (!publicId || typeof publicId !== 'string' || publicId.trim() === '') {
    return '';
  }

  const resourceType = options?.resourceType || 'image';
  const transformations: string[] = [];
  
  if (options?.width || options?.height) {
    const w = options.width ? `w_${options.width}` : '';
    const h = options.height ? `h_${options.height}` : '';
    const crop = 'c_fill';
    if (w && h) {
      transformations.push(`${w},${h},${crop}`);
    } else if (w) {
      transformations.push(`${w},${crop}`);
    } else if (h) {
      transformations.push(`${h},${crop}`);
    } else {
      transformations.push(crop);
    }
  }
  
  if (options?.quality) {
    transformations.push(`q_${options.quality === 'auto' ? 'auto' : options.quality}`);
  }
  
  if (options?.format && options.format !== 'auto') {
    transformations.push(`f_${options.format}`);
  } else {
    transformations.push('f_auto');
  }
  
  const transformationString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${transformationString}${publicId}`;
}

/**
 * Normalize image URL - ensure Cloudinary URLs are properly formatted
 * and add optimizations if needed
 * Also handles public_id strings that need to be converted to Cloudinary URLs
 */
export function normalizeImageUrl(url: string | null | undefined, options?: {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();
  
  // If it's already a full URL (including reely URLs), return as is - don't modify it
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    // Check if it's a reely URL - return as is without any modifications
    if (trimmedUrl.includes('reely') || trimmedUrl.includes('alnair')) {
      return trimmedUrl;
    }
    // For other full URLs, continue processing (might be Cloudinary)
  }
  
  // Check if it's a public_id (doesn't start with http and doesn't contain slashes that indicate a path)
  // Public IDs are usually simple strings without http:// or https://
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('/')) {
    // Might be a public_id - try to generate Cloudinary URL
    // But only if it doesn't look like a data URL or other format
    if (!trimmedUrl.startsWith('data:') && !trimmedUrl.includes('://')) {
      return generateCloudinaryUrl(trimmedUrl, options);
    }
  }

  // If it's already a Cloudinary URL, ensure it's properly formatted
  if (trimmedUrl.includes('res.cloudinary.com') || trimmedUrl.includes('cloudinary.com')) {
    // Check if URL already has transformations (look for transformation parameters after /upload/)
    const uploadIndex = trimmedUrl.indexOf('/upload/');
    const hasTransformations = uploadIndex !== -1 && 
      (trimmedUrl.includes('/v') || trimmedUrl.includes('/c_') || trimmedUrl.includes('/w_') || trimmedUrl.includes('/h_'));
    
    if (!hasTransformations && options && uploadIndex !== -1) {
      // Add Cloudinary transformations for optimization
      const transformations: string[] = [];
      
      if (options.width || options.height) {
        const w = options.width ? `w_${options.width}` : '';
        const h = options.height ? `h_${options.height}` : '';
        const crop = 'c_fill';
        if (w && h) {
          transformations.push(`${w},${h},${crop}`);
        } else if (w) {
          transformations.push(`${w},${crop}`);
        } else if (h) {
          transformations.push(`${h},${crop}`);
        } else {
          transformations.push(crop);
        }
      }
      
      if (options.quality) {
        transformations.push(`q_${options.quality === 'auto' ? 'auto' : options.quality}`);
      }
      
      if (options.format && options.format !== 'auto') {
        transformations.push(`f_${options.format}`);
      } else {
        transformations.push('f_auto');
      }
      
      // Insert transformations into URL
      // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{version}/{public_id}.{format}
      const urlParts = trimmedUrl.split('/upload/');
      if (urlParts.length === 2) {
        const transformationString = transformations.join(',');
        // Check if there's a version in the path
        const afterUpload = urlParts[1];
        const versionMatch = afterUpload.match(/^(v\d+\/)/);
        
        if (versionMatch) {
          // Insert transformations after version
          return `${urlParts[0]}/upload/${versionMatch[1]}${transformationString}/${afterUpload.substring(versionMatch[1].length)}`;
        } else {
          // No version, insert transformations directly
          return `${urlParts[0]}/upload/${transformationString}/${afterUpload}`;
        }
      }
    }
    
    return trimmedUrl;
  }

  // If it's a relative URL, make it absolute (assuming it's from API)
  if (trimmedUrl.startsWith('/')) {
    // Check if it looks like a Cloudinary path
    if (trimmedUrl.includes('cloudinary') || trimmedUrl.match(/^\/v\d+\//)) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload${trimmedUrl}`;
    }
    // Otherwise, assume it's from the API domain
    return `${API_BASE_URL.replace('/api', '')}${trimmedUrl}`;
  }

  // Default: return as is (might be a data URL or other format)
  return trimmedUrl;
}

/**
 * Normalize array of image URLs
 */
export function normalizeImageUrls(urls: (string | null | undefined)[] | null | undefined, options?: {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}): string[] {
  if (!urls || !Array.isArray(urls)) {
    return [];
  }

  return urls
    .map(url => normalizeImageUrl(url, options))
    .filter(url => url && url.trim().length > 0);
}

// Log API configuration on startup (in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:');
  console.log('  API_BASE_URL:', API_BASE_URL);
  console.log('  API_KEY present:', !!API_KEY);
  console.log('  API_SECRET present:', !!API_SECRET);
  console.log('  ⚠️ If API_BASE_URL points to production, ensure production backend is updated!');
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add authentication headers to requests
apiClient.interceptors.request.use(
  (config) => {
    // Always add API key and secret
    config.headers['Content-Type'] = 'application/json';
    
    // Ensure API key and secret are set
    if (!API_KEY || !API_SECRET) {
      console.error('❌ CRITICAL: API_KEY or API_SECRET is missing!');
      console.error('API_KEY:', API_KEY ? 'present' : 'missing');
      console.error('API_SECRET:', API_SECRET ? 'present' : 'missing');
    }
    
    // Set API headers - try both cases to ensure compatibility
    config.headers['X-Api-Key'] = API_KEY;
    config.headers['X-Api-Secret'] = API_SECRET;
    // Also set lowercase versions for backend compatibility
    config.headers['x-api-key'] = API_KEY;
    config.headers['x-api-secret'] = API_SECRET;
    
    // Add JWT token if available (for authenticated users)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      const apiKeyValue = config.headers['X-Api-Key'] as string;
      const apiSecretValue = config.headers['X-Api-Secret'] as string;
      
      console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'X-Api-Key': apiKeyValue ? `${apiKeyValue.substring(0, 20)}...` : 'missing',
          'X-Api-Secret': apiSecretValue ? `${apiSecretValue.substring(0, 20)}...` : 'missing',
          'Authorization': config.headers.Authorization ? '***' : 'missing',
        },
        apiKeyLength: apiKeyValue?.length || 0,
        apiSecretLength: apiSecretValue?.length || 0,
        apiKeyStartsWith: apiKeyValue ? apiKeyValue.substring(0, 4) : 'N/A',
        apiSecretStartsWith: apiSecretValue ? apiSecretValue.substring(0, 4) : 'N/A',
      });
      
      // Validate API keys format
      if (apiKeyValue && !apiKeyValue.startsWith('fyr_')) {
        console.warn('⚠️ API Key does not start with "fyr_" - might be invalid format');
      }
      // Note: API Secret doesn't have a prefix, it's just a hash
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Log detailed error info in development
      if (process.env.NODE_ENV === 'development') {
        const errorData = error.response.data as any;
        const errorMessage = errorData?.message || errorData?.error || 'Unknown error';
        
        console.error('❌ API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          message: errorMessage,
          data: error.response.data,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          requestHeaders: {
            'x-api-key': error.config?.headers?.['x-api-key'] ? 'present' : 'missing',
            'x-api-secret': error.config?.headers?.['x-api-secret'] ? 'present' : 'missing',
          },
        });
        
        // Special handling for 403 errors
        if (error.response.status === 403) {
          console.error('❌ 403 Forbidden - Possible causes:');
          console.error('   1. API Key/Secret are incorrect');
          console.error('   2. API Key/Secret are not active in the database');
          console.error('   3. Backend middleware is not properly checking API Key/Secret');
          console.error('   4. API Key/Secret format is incorrect');
          
          const apiKeyValue = error.config?.headers?.['x-api-key'] as string;
          const apiSecretValue = error.config?.headers?.['x-api-secret'] as string;
          
          if (apiKeyValue) {
            console.error('   API Key sent:', apiKeyValue.substring(0, 30) + '...');
            console.error('   API Key starts with:', apiKeyValue.substring(0, 4));
            console.error('   Expected: "fyr_"');
          }
          if (apiSecretValue) {
            console.error('   API Secret sent:', apiSecretValue.substring(0, 30) + '...');
            console.error('   API Secret length:', apiSecretValue.length);
            console.error('   Note: API Secret is a hash without prefix');
          }
        }
      }
      
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Optionally redirect to login
          // window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Properties API
export interface PropertyFilters {
  propertyType?: 'off-plan' | 'secondary';
  developerId?: string;
  cityId?: string;
  areaId?: string;
  areaIds?: string[]; // For client-side filtering with multiple areas
  bedrooms?: string; // Comma-separated: "1,2,3"
  sizeFrom?: number;
  sizeTo?: number;
  priceFrom?: number | string; // USD (can be number or string from URL params)
  priceTo?: number | string; // USD (can be number or string from URL params)
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'price' | 'priceFrom' | 'size' | 'sizeFrom';
  sortOrder?: 'ASC' | 'DESC';
  page?: number; // Page number for server-side pagination
  limit?: number; // Items per page for server-side pagination
}

export interface Property {
  id: string;
  propertyType: 'off-plan' | 'secondary';
  name: string;
  description: string;
  photos: string[];
  
  // Country and city can be null for off-plan properties
  country: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    code: string;
  } | null;
  city: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
  } | null;
  
  // For off-plan properties: area is a string "areaName, cityName" (e.g., "Dubai Marina, Dubai") or null
  // For secondary properties: area is an object with full area details
  area: string | {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    description?: {
      title?: string;
      description?: string;
    };
    infrastructure?: {
      title?: string;
      description?: string;
    };
    images?: string[];
  } | null;
  
  developer: {
    id: string;
    name: string;
    logo?: string | null;
    description?: string;
    images?: string[];
  } | null;
  latitude: number;
  longitude: number;
  
  // Off-plan fields
  priceFrom?: number | null;
  priceFromAED?: number | null;
  bedroomsFrom?: number | null;
  bedroomsTo?: number | null;
  bathroomsFrom?: number | null; // Always null for off-plan
  bathroomsTo?: number | null; // Always null for off-plan
  sizeFrom?: number | null;
  sizeFromSqft?: number | null;
  sizeTo?: number | null;
  sizeToSqft?: number | null;
  paymentPlan?: string | null;
  units?: Array<{
    id: string;
    unitId: string;
    type: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'office';
    price: number;
    priceAED: number | null;
    totalSize: number;
    totalSizeSqft: number | null;
    balconySize: number | null;
    balconySizeSqft: number | null;
    planImage: string | null;
  }> | null;
  
  // Secondary fields (always null for off-plan)
  price?: number | null; // Always null for off-plan
  priceAED?: number | null; // Always null for off-plan
  bedrooms?: number;
  bathrooms?: number;
  size?: number | null; // Always null for off-plan
  sizeSqft?: number | null; // Always null for off-plan
  
  // Common fields
  facilities: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    iconName: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Public Data API
export interface PublicData {
  properties?: Property[]; // Properties might be included in public data
  countries: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    code: string;
  }>;
  cities: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    countryId: string;
  }>;
  areas: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    cityId: string;
  }>;
  developers: Array<{
    id: string;
    name: string;
    logo: string | null;
  }>;
  facilities: Array<{
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    iconName: string;
  }>;
}

// Investment API
export interface InvestmentRequest {
  propertyId: string;
  amount: number; // USD
  date: string; // ISO date
  notes?: string;
  // For non-registered users
  userEmail?: string;
  userPhone?: string;
  userFirstName?: string;
  userLastName?: string;
}

export interface Investment {
  id: string;
  userId: string | null;
  propertyId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    name: string;
    propertyType: 'off-plan' | 'secondary';
    country: { id: string; nameEn: string; };
    city: { id: string; nameEn: string; };
    area: { id: string; nameEn: string; };
    developer: { id: string; name: string; };
  };
}

// API Functions

/**
 * Get properties with filters
 * Note: Since /api/properties requires JWT, we use /api/public/data and filter client-side
 */
export interface GetPropertiesResult {
  properties: Property[];
  total: number;
}

export async function getProperties(filters?: PropertyFilters, useCache: boolean = true): Promise<GetPropertiesResult> {
  try {
    // Create cache key from filters (including page and limit for server-side pagination)
    const cacheKey = JSON.stringify({
      propertyType: filters?.propertyType,
      developerId: filters?.developerId,
      cityId: filters?.cityId,
      areaId: filters?.areaId,
      bedrooms: filters?.bedrooms,
      sizeFrom: filters?.sizeFrom,
      sizeTo: filters?.sizeTo,
      priceFrom: filters?.priceFrom,
      priceTo: filters?.priceTo,
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
      page: filters?.page,
      limit: filters?.limit,
    });
    
    // Check cache
    if (useCache) {
      const cached = propertiesCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < PROPERTIES_CACHE_DURATION) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Using cached properties');
          console.log('  Cache key:', cacheKey);
          console.log('  Cached total:', cached.result.total);
          console.log('  Cached properties count:', cached.result.properties.length);
          console.log('  Cache age:', Math.round((Date.now() - cached.timestamp) / 1000), 'seconds');
          // Check if cached data has old photo sources
          if (cached.result.properties.length > 0) {
            const firstProp = cached.result.properties[0];
            if (firstProp.photos && firstProp.photos.length > 0) {
              const hasAlnair = firstProp.photos.some((p: string) => p.includes('alnair'));
              const hasReelly = firstProp.photos.some((p: string) => p.includes('reelly'));
              if (hasAlnair && !hasReelly) {
                console.warn('⚠️ WARNING: Cached data contains OLD photos from alnair!');
                console.warn('⚠️ Clearing cache and fetching fresh data...');
                propertiesCache.delete(cacheKey);
                // Don't return cached result, fetch fresh data instead
              } else {
                return cached.result;
              }
            } else {
        return cached.result;
            }
          } else {
            return cached.result;
          }
        } else {
          return cached.result;
        }
      }
    }
    
    // First, try to get properties from /api/properties (if user is authenticated)
    const params = new URLSearchParams();
    
    if (filters?.propertyType) params.append('propertyType', filters.propertyType);
    if (filters?.developerId) params.append('developerId', filters.developerId);
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.areaId) {
      params.append('areaId', filters.areaId);
    }
    if (filters?.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters?.sizeFrom) params.append('sizeFrom', filters.sizeFrom.toString());
    if (filters?.sizeTo) params.append('sizeTo', filters.sizeTo.toString());
    if (filters?.priceFrom) params.append('priceFrom', filters.priceFrom.toString());
    if (filters?.priceTo) params.append('priceTo', filters.priceTo.toString());
    if (filters?.search) params.append('search', filters.search);
    // Always include sort parameters (default to createdAt DESC if not specified)
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'DESC';
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    // Use page and limit from filters if provided, otherwise default to 100 items for client-side pagination
    const frontendPage = filters?.page || 1;
    const frontendLimit = filters?.limit || 100;
    params.append('page', frontendPage.toString());
    params.append('limit', frontendLimit.toString());
    
    const url = `/properties?${params.toString()}`;
    const fullUrl = `${API_BASE_URL}${url}`;
    
    // Debug: log the sort parameters and headers
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 API Request Details:');
      console.log('  Endpoint:', url);
      console.log('  Full URL:', fullUrl);
      console.log('  Property Type:', filters?.propertyType);
      console.log('  Page:', filters?.page || 1);
      console.log('  Limit:', filters?.limit || 100);
      console.log('  Sort By:', filters?.sortBy || 'createdAt');
      console.log('  Sort Order:', filters?.sortOrder || 'DESC');
      console.log('  All Params:', Object.fromEntries(params.entries()));
      console.log('  API Base URL:', API_BASE_URL);
      console.log('  API Key present:', !!API_KEY);
      console.log('  API Secret present:', !!API_SECRET);
      
      // Validate URL is properly encoded
      try {
        new URL(fullUrl);
        console.log('✅ URL is valid');
      } catch (e) {
        console.error('❌ Invalid URL:', fullUrl, e);
      }
    }
    
    // Try regular endpoint first (should work with API Key/Secret now)
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Making API request to:', fullUrl);
        console.log('📡 Request method: GET');
        console.log('📡 Request headers:', {
          'X-Api-Key': API_KEY ? 'present' : 'missing',
          'X-Api-Secret': API_SECRET ? 'present' : 'missing',
        });
        console.log('📡 API Base URL:', API_BASE_URL);
        console.log('📡 Endpoint path:', url);
      }
      
      const response = await apiClient.get<ApiResponse<Property[]>>(url);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Successfully got response from /api/properties endpoint');
        console.log('  Status:', response.status);
        console.log('  Response URL:', response.config.url);
        console.log('  Request URL:', fullUrl);
        console.log('  Success:', response.data.success);
        console.log('  Data type:', typeof response.data.data);
        console.log('  Is array:', Array.isArray(response.data.data));
        
        // Log FULL response structure to understand what backend returns
        console.log('🔍 FULL API RESPONSE STRUCTURE:');
        console.log('  Response keys:', Object.keys(response.data));
        if (response.data.data && typeof response.data.data === 'object') {
          console.log('  Data keys:', Object.keys(response.data.data));
          if ('pagination' in response.data.data) {
            console.log('  📊 PAGINATION INFO:', response.data.data.pagination);
            console.log('    ⚠️ TOTAL FROM BACKEND:', response.data.data.pagination.total);
            console.log('    ⚠️ If this is 959, backend is returning OLD data!');
          }
          if ('data' in response.data.data && Array.isArray(response.data.data.data)) {
            console.log('  📦 Properties array length:', response.data.data.data.length);
            
            // Check photo sources in ALL properties
            const propertiesWithAlnairPhotos = response.data.data.data.filter((p: any) => 
              p.photos && Array.isArray(p.photos) && p.photos.some((photo: string) => photo && photo.includes('alnair'))
            );
            const propertiesWithReellyPhotos = response.data.data.data.filter((p: any) => 
              p.photos && Array.isArray(p.photos) && p.photos.some((photo: string) => photo && photo.includes('reelly'))
            );
            
            console.log('  📸 PHOTO SOURCES:');
            console.log('    Properties with alnair photos:', propertiesWithAlnairPhotos.length, propertiesWithAlnairPhotos.length > 0 ? '❌ OLD DATA' : '✅ OK');
            console.log('    Properties with reelly photos:', propertiesWithReellyPhotos.length, propertiesWithReellyPhotos.length > 0 ? '✅ NEW DATA' : '❌ NO NEW DATA');
            if (propertiesWithAlnairPhotos.length > 0) {
              console.error('    ❌❌❌ BACKEND IS RETURNING OLD DATA WITH alnair.ae PHOTOS! ❌❌❌');
              console.error('    ❌ Backend database needs to be updated!');
            }
            
            // Check bathroomsFrom/To for off-plan properties
            const offPlanProperties = response.data.data.data.filter((p: any) => p.propertyType === 'off-plan');
            const offPlanWithBathrooms = offPlanProperties.filter((p: any) => 
              p.bathroomsFrom !== null || p.bathroomsTo !== null
            );
            console.log('  🛁 BATHROOMS FOR OFF-PLAN:');
            console.log('    Off-plan properties:', offPlanProperties.length);
            console.log('    Off-plan with bathroomsFrom/To:', offPlanWithBathrooms.length, offPlanWithBathrooms.length > 0 ? '❌ OLD DATA' : '✅ OK');
            if (offPlanWithBathrooms.length > 0) {
              console.error('    ❌❌❌ BACKEND IS RETURNING OLD DATA (bathroomsFrom/To should be null for off-plan)! ❌❌❌');
              console.error('    ❌ Backend database needs to be updated!');
            }
            
            // Check priceFromAED for off-plan properties
            const offPlanWithNullPriceFromAED = offPlanProperties.filter((p: any) => 
              p.priceFrom !== null && p.priceFrom !== undefined && p.priceFrom > 0 &&
              (p.priceFromAED === null || p.priceFromAED === undefined || p.priceFromAED === 0)
            );
            console.log('  💰 PRICE_FROM_AED FOR OFF-PLAN:');
            console.log('    Off-plan with priceFrom but null priceFromAED:', offPlanWithNullPriceFromAED.length, offPlanWithNullPriceFromAED.length > 0 ? '❌ NOT CALCULATED' : '✅ OK');
            if (offPlanWithNullPriceFromAED.length > 0) {
              console.error('    ❌❌❌ BACKEND IS NOT CALCULATING priceFromAED AUTOMATICALLY! ❌❌❌');
              console.error('    ❌ Backend needs to calculate priceFromAED = priceFrom * 3.673');
            }
            
            // Summary
            console.log('  📋 SUMMARY:');
            console.log('    Total properties from backend:', response.data.data.data.length);
            console.log('    Total in pagination:', response.data.data.pagination?.total);
            if (propertiesWithAlnairPhotos.length > 0 || offPlanWithBathrooms.length > 0 || offPlanWithNullPriceFromAED.length > 0) {
              console.error('    ❌❌❌ BACKEND IS RETURNING OLD DATA! ❌❌❌');
              console.error('    ❌ Frontend cannot fix this - backend database needs to be updated!');
              console.error('    ❌ Please check backend database and ensure it contains only NEW properties!');
        } else {
              console.log('    ✅ Backend data looks correct!');
            }
            
            // Log first property in detail
            if (response.data.data.data.length > 0) {
              const firstProperty = response.data.data.data[0];
              console.log('🔍 RAW FIRST PROPERTY FROM API (before normalization):');
              console.log('  ID:', firstProperty.id);
              console.log('  Name:', firstProperty.name);
              console.log('  Property Type:', firstProperty.propertyType);
              console.log('  Photos:', firstProperty.photos);
              console.log('  Photos count:', Array.isArray(firstProperty.photos) ? firstProperty.photos.length : 'not an array');
              if (Array.isArray(firstProperty.photos) && firstProperty.photos.length > 0) {
                console.log('  First photo URL:', firstProperty.photos[0]);
                console.log('  Photo source (alnair/reelly):', firstProperty.photos[0]?.includes('alnair') ? 'alnair ❌ OLD DATA' : firstProperty.photos[0]?.includes('reelly') ? 'reelly ✅ NEW DATA' : 'unknown');
              }
              console.log('  Price From:', firstProperty.priceFrom);
              console.log('  Price From AED:', firstProperty.priceFromAED, firstProperty.priceFromAED === null ? '❌ NULL (should be calculated)' : '✅ OK');
              console.log('  Size From:', firstProperty.sizeFrom);
              console.log('  Size To:', firstProperty.sizeTo);
              console.log('  Size From Sqft:', firstProperty.sizeFromSqft, firstProperty.sizeFromSqft === null ? '❌ NULL (should be calculated)' : '✅ OK');
              console.log('  Size To Sqft:', firstProperty.sizeToSqft, firstProperty.sizeToSqft === null ? '❌ NULL (should be calculated)' : '✅ OK');
              console.log('  Area:', firstProperty.area);
              console.log('  Bedrooms From:', firstProperty.bedroomsFrom);
              console.log('  Bedrooms To:', firstProperty.bedroomsTo);
              console.log('  Bathrooms From:', firstProperty.bathroomsFrom, firstProperty.propertyType === 'off-plan' && firstProperty.bathroomsFrom !== null ? '❌ Should be NULL for off-plan' : '✅ OK');
              console.log('  Bathrooms To:', firstProperty.bathroomsTo, firstProperty.propertyType === 'off-plan' && firstProperty.bathroomsTo !== null ? '❌ Should be NULL for off-plan' : '✅ OK');
              console.log('  Created At:', firstProperty.createdAt);
              console.log('  Updated At:', firstProperty.updatedAt);
            }
          }
        }
      }
      
      // Handle paginated response structure from /api/properties
      // Expected structure: { success: true, data: { data: Property[], pagination: { total, page, limit, totalPages } } }
      let data: any[] = [];
      let totalCount = 0;
      
      if (response.data.data) {
        // Check if response has pagination structure
        if (typeof response.data.data === 'object' && 'data' in response.data.data && Array.isArray(response.data.data.data)) {
          // New structure: { data: { data: Property[], pagination: { total, ... } } }
          data = response.data.data.data;
          
          // Extract total from pagination object
          if (response.data.data.pagination && typeof response.data.data.pagination.total === 'number') {
            totalCount = response.data.data.pagination.total;
          } else if (typeof response.data.data.total === 'number') {
            // Fallback: check if total is directly in data object
            totalCount = response.data.data.total;
          }
          
              if (process.env.NODE_ENV === 'development') {
            console.log('✅ Using paginated response structure');
            console.log(`  Properties count: ${data.length}`);
            console.log(`  Total from pagination: ${totalCount}`);
            console.log(`  ⚠️⚠️⚠️ BACKEND RETURNS ${totalCount} PROPERTIES ⚠️⚠️⚠️`);
            console.log(`  ⚠️ If this is 959, backend database contains OLD data!`);
            console.log(`  ⚠️ Frontend cannot fix this - backend needs to update its database!`);
            if (response.data.data.pagination) {
              console.log(`  Page: ${response.data.data.pagination.page}`);
              console.log(`  Limit: ${response.data.data.pagination.limit}`);
              console.log(`  Total pages: ${response.data.data.pagination.totalPages}`);
            }
          }
        } else if (Array.isArray(response.data.data)) {
          // Old structure: { data: Property[] } (direct array)
          data = response.data.data;
          totalCount = data.length;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Using direct array response structure (old format)');
            console.log(`  Properties count: ${data.length}`);
          }
        } else {
          console.error('❌ Unexpected response structure from /api/properties');
          console.error('  Response data:', response.data);
          throw new Error('Unexpected response structure from /api/properties endpoint');
        }
      }
      
      // Ensure data is always an array
      if (!Array.isArray(data)) {
        if (data === null || data === undefined) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API returned null/undefined data, using empty array');
          }
          data = [];
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ API returned non-array data after parsing:', {
              type: typeof data,
              value: data,
            });
          }
          data = [];
        }
      }
      
      // Log RAW data from API BEFORE normalization (to see what API actually returns)
      if (process.env.NODE_ENV === 'development' && data.length > 0) {
        // Log first property with photos and first property without photos
        const propertyWithPhotos = data.find((p: any) => p.photos && Array.isArray(p.photos) && p.photos.length > 0);
        const propertyWithoutPhotos = data.find((p: any) => !p.photos || !Array.isArray(p.photos) || p.photos.length === 0);
        
        if (propertyWithPhotos) {
          const firstPhoto = Array.isArray(propertyWithPhotos.photos) && propertyWithPhotos.photos.length > 0 ? propertyWithPhotos.photos[0] : null;
          console.log(`🔍 RAW property WITH photos from API (BEFORE normalization):`, {
            propertyId: propertyWithPhotos.id,
            propertyName: propertyWithPhotos.name,
            photosType: typeof propertyWithPhotos.photos,
            photosIsArray: Array.isArray(propertyWithPhotos.photos),
            photosValue: propertyWithPhotos.photos,
            photosLength: Array.isArray(propertyWithPhotos.photos) ? propertyWithPhotos.photos.length : 'N/A',
            firstPhoto: firstPhoto,
            firstPhotoType: firstPhoto ? typeof firstPhoto : 'N/A',
            firstPhotoIsObject: firstPhoto ? (typeof firstPhoto === 'object' && firstPhoto !== null) : false,
            firstPhotoKeys: firstPhoto && typeof firstPhoto === 'object' && firstPhoto !== null ? Object.keys(firstPhoto) : 'N/A',
            firstPhotoStringified: firstPhoto ? JSON.stringify(firstPhoto) : 'N/A',
          });
        }
        
        if (propertyWithoutPhotos) {
          console.log(`🔍 RAW property WITHOUT photos from API (BEFORE normalization):`, {
            propertyId: propertyWithoutPhotos.id,
            propertyName: propertyWithoutPhotos.name,
            hasPhotosField: 'photos' in propertyWithoutPhotos,
            photosType: typeof propertyWithoutPhotos.photos,
            photosValue: propertyWithoutPhotos.photos,
            photosIsArray: Array.isArray(propertyWithoutPhotos.photos),
            photosLength: Array.isArray(propertyWithoutPhotos.photos) ? propertyWithoutPhotos.photos.length : 'N/A',
            allKeys: Object.keys(propertyWithoutPhotos),
            // Check for alternative photo fields
            hasImage: 'image' in propertyWithoutPhotos,
            hasImageUrl: 'imageUrl' in propertyWithoutPhotos,
            hasGallery: 'gallery' in propertyWithoutPhotos,
            hasImages: 'images' in propertyWithoutPhotos,
            imageValue: (propertyWithoutPhotos as any).image,
            imageUrlValue: (propertyWithoutPhotos as any).imageUrl,
            galleryValue: (propertyWithoutPhotos as any).gallery,
            imagesValue: (propertyWithoutPhotos as any).images,
          });
        }
      }
      
      // Normalize photos array for each property
      // API can return photos in various formats: string[], object[], object, string
      // Ensure photos is always an array of strings
      data = data.map((property: any) => {
        // Helper function to extract URL from various formats
        const extractUrl = (item: any): string | null => {
          if (!item) return null;
          
          // If it's already a string, return it
          if (typeof item === 'string' && item.trim().length > 0) {
            return item.trim();
          }
          
          // If it's an object, try to extract URL from common fields
          if (typeof item === 'object' && item !== null) {
            // Check common URL fields in order of preference
            const urlFields = ['url', 'src', 'imageUrl', 'image', 'photo'];
            for (const field of urlFields) {
              if (item[field] && typeof item[field] === 'string' && item[field].trim().length > 0) {
                return item[field].trim();
              }
            }
            
            // If no URL field found, try Object.values to find string values
            const values = Object.values(item);
            for (const value of values) {
              if (typeof value === 'string' && value.trim().length > 0) {
                return value.trim();
              }
            }
          }
          
          return null;
        };
        
        // Normalize photos
        if (!property.photos) {
          // Check alternative fields
          const altUrl = extractUrl(property.image) ||
                        extractUrl(property.imageUrl) ||
                        null;
          property.photos = altUrl ? [altUrl] : [];
        } else if (Array.isArray(property.photos)) {
          // Array: can be string[] or object[]
          const extractedUrls: string[] = [];
          
          for (const item of property.photos) {
            const url = extractUrl(item);
            if (url) {
              extractedUrls.push(url);
            }
          }
          
          property.photos = extractedUrls;
        } else if (typeof property.photos === 'string') {
          // String: try to parse as JSON or use as single URL
          try {
            const parsed = JSON.parse(property.photos);
            if (Array.isArray(parsed)) {
              const extractedUrls: string[] = [];
              for (const item of parsed) {
                const url = extractUrl(item);
                if (url) extractedUrls.push(url);
              }
              property.photos = extractedUrls;
            } else {
              const url = extractUrl(parsed);
              property.photos = url ? [url] : [];
            }
          } catch {
            // Not JSON, use as single URL
            const url = extractUrl(property.photos);
            property.photos = url ? [url] : [];
          }
        } else if (typeof property.photos === 'object' && property.photos !== null) {
          // Object: extract values
          const values = Object.values(property.photos);
          const extractedUrls: string[] = [];
          
          for (const value of values) {
            const url = extractUrl(value);
            if (url) extractedUrls.push(url);
          }
          
          property.photos = extractedUrls;
        } else {
          // Unknown format
          property.photos = [];
        }
        
        // Final validation: ensure all elements are strings
        property.photos = property.photos.filter((photo: any): photo is string => {
          return typeof photo === 'string' && photo.trim().length > 0;
        });
        
        // Normalize numeric fields - ensure they are numbers, not strings
        // This is important because API might return strings
        if (property.bedroomsFrom !== null && property.bedroomsFrom !== undefined) {
          property.bedroomsFrom = typeof property.bedroomsFrom === 'string' ? parseInt(property.bedroomsFrom, 10) : property.bedroomsFrom;
        }
        if (property.bedroomsTo !== null && property.bedroomsTo !== undefined) {
          property.bedroomsTo = typeof property.bedroomsTo === 'string' ? parseInt(property.bedroomsTo, 10) : property.bedroomsTo;
        }
        if (property.sizeFrom !== null && property.sizeFrom !== undefined) {
          property.sizeFrom = typeof property.sizeFrom === 'string' ? parseFloat(property.sizeFrom) : property.sizeFrom;
        }
        if (property.sizeTo !== null && property.sizeTo !== undefined) {
          property.sizeTo = typeof property.sizeTo === 'string' ? parseFloat(property.sizeTo) : property.sizeTo;
        }
        if (property.sizeFromSqft !== null && property.sizeFromSqft !== undefined) {
          property.sizeFromSqft = typeof property.sizeFromSqft === 'string' ? parseFloat(property.sizeFromSqft) : property.sizeFromSqft;
        }
        if (property.sizeToSqft !== null && property.sizeToSqft !== undefined) {
          property.sizeToSqft = typeof property.sizeToSqft === 'string' ? parseFloat(property.sizeToSqft) : property.sizeToSqft;
        }
        if (property.priceFrom !== null && property.priceFrom !== undefined) {
          property.priceFrom = typeof property.priceFrom === 'string' ? parseFloat(property.priceFrom) : property.priceFrom;
        }
        if (property.priceFromAED !== null && property.priceFromAED !== undefined) {
          property.priceFromAED = typeof property.priceFromAED === 'string' ? parseFloat(property.priceFromAED) : property.priceFromAED;
        }
        
        // Calculate priceFromAED if missing but priceFrom exists (USD to AED conversion: 1 USD = 3.673 AED)
        if (property.propertyType === 'off-plan') {
          if ((property.priceFromAED === null || property.priceFromAED === undefined || property.priceFromAED === 0) && 
              property.priceFrom !== null && property.priceFrom !== undefined && property.priceFrom > 0) {
            property.priceFromAED = Math.round(property.priceFrom * 3.673);
            if (process.env.NODE_ENV === 'development') {
              console.log(`💱 Calculated priceFromAED for ${property.name}: ${property.priceFrom} USD * 3.673 = ${property.priceFromAED} AED`);
            }
          }
          
          // For off-plan properties, bathroomsFrom/To should always be null according to new schema
          // If API returns values, set them to null
          if (property.bathroomsFrom !== null || property.bathroomsTo !== null) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚠️ Property ${property.name} (off-plan) has bathroomsFrom/To values, setting to null:`, {
                bathroomsFrom: property.bathroomsFrom,
                bathroomsTo: property.bathroomsTo
              });
            }
            property.bathroomsFrom = null;
            property.bathroomsTo = null;
          }
          
          // Calculate sizeFromSqft/sizeToSqft if missing but sizeFrom/sizeTo exists (m² to sqft: 1 m² = 10.764 sqft)
          if (property.sizeFrom !== null && property.sizeFrom !== undefined && property.sizeFrom > 0) {
            if (property.sizeFromSqft === null || property.sizeFromSqft === undefined || property.sizeFromSqft === 0) {
              property.sizeFromSqft = Math.round(property.sizeFrom * 10.764 * 100) / 100; // Round to 2 decimals
            }
          }
          if (property.sizeTo !== null && property.sizeTo !== undefined && property.sizeTo > 0) {
            if (property.sizeToSqft === null || property.sizeToSqft === undefined || property.sizeToSqft === 0) {
              property.sizeToSqft = Math.round(property.sizeTo * 10.764 * 100) / 100; // Round to 2 decimals
            }
          }
          
          // Fix area if it's incomplete (e.g., "Du" instead of "areaName, cityName")
          if (typeof property.area === 'string' && property.area.length <= 3 && property.city) {
            // If area is too short (like "Du"), try to reconstruct it from city
            const cityName = property.city.nameEn || property.city.nameRu;
            if (cityName) {
              property.area = `${property.area}, ${cityName}`;
              if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️ Fixed incomplete area for ${property.name}: "${property.area}"`);
              }
            }
          }
        }
        
        return property;
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully loaded ${data.length} properties from /api/properties endpoint`);
        console.log(`📊 Total from API: ${totalCount || 'not provided'}`);
        console.log(`📄 Requested page: ${filters?.page || 1}, limit: ${filters?.limit || 100}`);
        if (filters?.propertyType) {
          console.log(`Property type filter: ${filters.propertyType}`);
        }
        // Log sample property to check photos (after normalization)
        if (data.length > 0) {
          const sampleProperty = data[0];
          console.log(`📸 Sample property photos (after normalization):`, {
            propertyId: sampleProperty.id,
            propertyName: sampleProperty.name,
            photosIsArray: Array.isArray(sampleProperty.photos),
            photosLength: Array.isArray(sampleProperty.photos) ? sampleProperty.photos.length : 'N/A',
            firstPhoto: Array.isArray(sampleProperty.photos) && sampleProperty.photos.length > 0 ? sampleProperty.photos[0] : 'N/A',
            allPhotos: sampleProperty.photos,
          });
          
          // Check if photos are valid URLs
          if (Array.isArray(sampleProperty.photos) && sampleProperty.photos.length > 0) {
            sampleProperty.photos.forEach((photo: string, index: number) => {
              if (photo && !photo.startsWith('http://') && !photo.startsWith('https://') && !photo.startsWith('/')) {
                console.warn(`⚠️ Photo ${index} for property ${sampleProperty.name} is not a valid URL:`, photo);
              }
            });
          } else {
            console.warn(`⚠️ Property ${sampleProperty.name} has no photos after normalization`);
          }
          
          // Count properties with and without photos
          const propertiesWithPhotos = data.filter((p: any) => Array.isArray(p.photos) && p.photos.length > 0).length;
          const propertiesWithoutPhotos = data.length - propertiesWithPhotos;
          console.log(`📊 Properties with photos: ${propertiesWithPhotos} / ${data.length}, without photos: ${propertiesWithoutPhotos}`);
          
          // Log full property data for first 3 properties to diagnose issues
          if (data.length > 0) {
            console.log(`🔍 FULL PROPERTY DATA FROM API (first 3 properties):`);
            data.slice(0, 3).forEach((prop: any, index: number) => {
              console.log(`\n📋 Property ${index + 1} - ${prop.name}:`);
              console.log('  ID:', prop.id);
              console.log('  Property Type:', prop.propertyType);
              console.log('  Bedrooms:', {
                bedroomsFrom: prop.bedroomsFrom,
                bedroomsFromType: typeof prop.bedroomsFrom,
                bedroomsTo: prop.bedroomsTo,
                bedroomsToType: typeof prop.bedroomsTo,
                bedrooms: prop.bedrooms,
              });
              console.log('  Size:', {
                sizeFrom: prop.sizeFrom,
                sizeFromType: typeof prop.sizeFrom,
                sizeTo: prop.sizeTo,
                sizeToType: typeof prop.sizeTo,
                sizeFromSqft: prop.sizeFromSqft,
                sizeFromSqftType: typeof prop.sizeFromSqft,
                sizeToSqft: prop.sizeToSqft,
                sizeToSqftType: typeof prop.sizeToSqft,
                size: prop.size,
                sizeSqft: prop.sizeSqft,
              });
              console.log('  Price:', {
                priceFrom: prop.priceFrom,
                priceFromType: typeof prop.priceFrom,
                priceFromAED: prop.priceFromAED,
                priceFromAEDType: typeof prop.priceFromAED,
                price: prop.price,
                priceAED: prop.priceAED,
              });
              console.log('  Area:', {
                area: prop.area,
                areaType: typeof prop.area,
                areaValue: JSON.stringify(prop.area).substring(0, 100),
              });
              console.log('  All Keys:', Object.keys(prop).sort());
              
              // Check for alternative field names
              const altFields = [
                'bedroomFrom', 'bedroomTo', 'bedroom',
                'sizeFromM2', 'sizeToM2', 'sizeM2',
                'priceFromUSD', 'priceUSD',
              ];
              altFields.forEach(field => {
                if (prop[field] !== undefined) {
                  console.log(`  ⚠️ Found alternative field "${field}":`, prop[field]);
                }
              });
            });
          }
        }
      }
      
      // Apply client-side sorting as backup (in case server doesn't sort correctly)
      // Always sort, even if server should have sorted (to ensure consistency)
      const sortBy = filters?.sortBy || 'createdAt';
      const sortOrder = filters?.sortOrder || 'DESC';
      
      if (data.length > 0) {
        // Create a stable copy for sorting
        const sortedData = [...data];
        
        sortedData.sort((a, b) => {
          let aValue: number | string, bValue: number | string;
          
          switch (sortBy) {
            case 'name':
              aValue = (a.name || '').toLowerCase();
              bValue = (b.name || '').toLowerCase();
              // String comparison
              if (sortOrder === 'ASC') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
              } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
              }
            
            case 'price':
            case 'priceFrom':
              // Use USD prices for comparison
              // IMPORTANT: priceFrom/price may come as strings from API, need to convert to number
              if (a.propertyType === 'off-plan') {
                const priceFrom = a.priceFrom;
                if (typeof priceFrom === 'number' && !isNaN(priceFrom)) {
                  aValue = priceFrom;
                } else if (typeof priceFrom === 'string') {
                  aValue = parseFloat(priceFrom) || 0;
                } else {
                  aValue = 0;
                }
              } else {
                const price = a.price;
                if (typeof price === 'number' && !isNaN(price)) {
                  aValue = price;
                } else if (typeof price === 'string') {
                  aValue = parseFloat(price) || 0;
                } else {
                  aValue = 0;
                }
              }
              
              if (b.propertyType === 'off-plan') {
                const priceFrom = b.priceFrom;
                if (typeof priceFrom === 'number' && !isNaN(priceFrom)) {
                  bValue = priceFrom;
                } else if (typeof priceFrom === 'string') {
                  bValue = parseFloat(priceFrom) || 0;
                } else {
                  bValue = 0;
                }
              } else {
                const price = b.price;
                if (typeof price === 'number' && !isNaN(price)) {
                  bValue = price;
                } else if (typeof price === 'string') {
                  bValue = parseFloat(price) || 0;
                } else {
                  bValue = 0;
                }
              }
              
              // Debug log for price sorting
              if (process.env.NODE_ENV === 'development') {
                const indexA = sortedData.indexOf(a);
                const indexB = sortedData.indexOf(b);
                if (indexA < 5 || indexB < 5) {
                  console.log(`Price sort (API): ${a.name} (${aValue}) vs ${b.name} (${bValue}), order: ${sortOrder}`);
                }
              }
              break;
            
            case 'size':
            case 'sizeFrom':
              // Use m² for comparison
              // IMPORTANT: sizeFrom/size may come as strings from API, need to convert to number
              if (a.propertyType === 'off-plan') {
                const sizeFrom = a.sizeFrom;
                if (typeof sizeFrom === 'number' && !isNaN(sizeFrom)) {
                  aValue = sizeFrom;
                } else if (typeof sizeFrom === 'string') {
                  aValue = parseFloat(sizeFrom) || 0;
                } else {
                  aValue = 0;
                }
              } else {
                const size = a.size;
                if (typeof size === 'number' && !isNaN(size)) {
                  aValue = size;
                } else if (typeof size === 'string') {
                  aValue = parseFloat(size) || 0;
                } else {
                  aValue = 0;
                }
              }
              
              if (b.propertyType === 'off-plan') {
                const sizeFrom = b.sizeFrom;
                if (typeof sizeFrom === 'number' && !isNaN(sizeFrom)) {
                  bValue = sizeFrom;
                } else if (typeof sizeFrom === 'string') {
                  bValue = parseFloat(sizeFrom) || 0;
                } else {
                  bValue = 0;
                }
              } else {
                const size = b.size;
                if (typeof size === 'number' && !isNaN(size)) {
                  bValue = size;
                } else if (typeof size === 'string') {
                  bValue = parseFloat(size) || 0;
                } else {
                  bValue = 0;
                }
              }
              break;
            
            case 'createdAt':
              aValue = new Date(a.createdAt || 0).getTime();
              bValue = new Date(b.createdAt || 0).getTime();
              break;
            
            default:
              // Default to createdAt if sortBy is unknown
              aValue = new Date(a.createdAt || 0).getTime();
              bValue = new Date(b.createdAt || 0).getTime();
              break;
          }
          
          // Handle null/undefined/NaN values for numeric comparisons
          if (typeof aValue === 'number') {
            if (isNaN(aValue) || aValue == null) aValue = 0;
          }
          if (typeof bValue === 'number') {
            if (isNaN(bValue) || bValue == null) bValue = 0;
          }
          
          // Numeric comparison
          if (sortOrder === 'ASC') {
            return (aValue as number) - (bValue as number);
          } else {
            return (bValue as number) - (aValue as number);
          }
        });
        
        // Replace the array
        data = sortedData;
      }
      
      // Debug: log first few properties to verify sorting
      if (process.env.NODE_ENV === 'development' && data.length > 0) {
        console.log('First 3 properties after sort:', data.slice(0, 3).map(p => ({
          name: p.name,
          price: p.propertyType === 'off-plan' ? p.priceFrom : p.price,
          size: p.propertyType === 'off-plan' ? p.sizeFrom : p.size,
          createdAt: p.createdAt,
        })));
      }
      
      // Return with total count
      const result: GetPropertiesResult = {
        properties: data,
        total: totalCount || data.length,
      };
      
      // Cache the result
      if (useCache) {
        propertiesCache.set(cacheKey, {
          result,
          timestamp: Date.now(),
        });
        // Limit cache size (keep only last 10 entries)
        if (propertiesCache.size > 10) {
          const firstKey = propertiesCache.keys().next().value;
          if (firstKey) {
            propertiesCache.delete(firstKey);
          }
        }
      }
      
      return result;
    } catch (error: any) {
      // ❌ FALLBACK DISABLED: Do not use /api/public/data as fallback
      // The /api/properties endpoint should always work with API Key/Secret
      // If it fails, it's a configuration issue that needs to be fixed
      
      console.error('❌ CRITICAL ERROR: Failed to load properties from /api/properties endpoint!');
      console.error('❌ This endpoint MUST work with API Key/Secret authentication!');
      
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        
        if (error.response.status === 403 || error.response.status === 401) {
          console.error('❌ Authentication failed!');
          console.error('❌ Please check:');
          console.error('   1. API Key/Secret are correctly set in environment variables');
          console.error('   2. API Key/Secret are valid and active on the backend');
          console.error('   3. Backend middleware is properly configured to accept API Key/Secret');
        } else {
          console.error('❌ Unexpected error status:', error.response.status);
        }
      } else if (error.request) {
        console.error('❌ No response received from server');
        console.error('❌ Request config:', error.config);
            } else {
        console.error('❌ Error setting up request:', error.message);
      }
      
        if (process.env.NODE_ENV === 'development') {
        console.error('Request URL that failed:', error.config?.url);
        console.error('Request params:', error.config?.params);
        console.error('Request headers:', {
          'x-api-key': error.config?.headers?.['x-api-key'] ? 'present' : 'missing',
          'x-api-secret': error.config?.headers?.['x-api-secret'] ? 'present' : 'missing',
          'API_BASE_URL': API_BASE_URL,
        });
      }
      
      // Throw error instead of using fallback
      throw new Error(`Failed to load properties from /api/properties endpoint: ${error.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      // Check if the error message gives us a hint
      if (error.response.data?.message) {
        console.error('Error message from server:', error.response.data.message);
      }
    }
    throw error;
  }
}

/**
 * Get single property by ID
 */
export async function getProperty(id: string): Promise<Property> {
  try {
    const response = await apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
    let property = response.data.data;
    
    // Normalize property data (same as in getProperties)
    property = normalizeProperty(property);
    
          if (process.env.NODE_ENV === 'development') {
      console.log(`✅ PropertyDetail - Loaded property ${id}:`, {
        name: property.name,
        propertyType: property.propertyType,
        priceFromAED: property.priceFromAED,
        priceAED: property.priceAED,
        priceFrom: property.priceFrom,
        price: property.price,
      });
    }
    
    return property;
  } catch (error: any) {
    // If 403 or 401, try to get from public data endpoint
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.warn(`Status ${error.response.status} on /properties/${id}, trying to find property in public data...`);
      
      try {
        // Get all data from public endpoint
        const publicData = await getPublicData();
        
        if (publicData.properties && Array.isArray(publicData.properties)) {
          let property = publicData.properties.find(p => p.id === id);
          
          if (property) {
            // Normalize property data
            property = normalizeProperty(property);
          
          if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Found property ${id} in public data`);
            }
            return property;
          } else {
            throw new Error('Property not found in public data');
          }
        } else {
          throw new Error('Properties not found in public data structure');
        }
      } catch (publicDataError: any) {
        console.error('Error fetching property from public data:', publicDataError);
        throw new Error(`Property not found: ${publicDataError.message || 'Unknown error'}`);
      }
    }
    
    // For other errors, log and rethrow
    console.error('Error fetching property:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Helper function to normalize property data
function normalizeProperty(property: any): Property {
  // Normalize numeric fields - ensure they are numbers, not strings
  if (property.bedroomsFrom !== null && property.bedroomsFrom !== undefined) {
    property.bedroomsFrom = typeof property.bedroomsFrom === 'string' ? parseInt(property.bedroomsFrom, 10) : property.bedroomsFrom;
  }
  if (property.bedroomsTo !== null && property.bedroomsTo !== undefined) {
    property.bedroomsTo = typeof property.bedroomsTo === 'string' ? parseInt(property.bedroomsTo, 10) : property.bedroomsTo;
  }
  if (property.sizeFrom !== null && property.sizeFrom !== undefined) {
    property.sizeFrom = typeof property.sizeFrom === 'string' ? parseFloat(property.sizeFrom) : property.sizeFrom;
  }
  if (property.sizeTo !== null && property.sizeTo !== undefined) {
    property.sizeTo = typeof property.sizeTo === 'string' ? parseFloat(property.sizeTo) : property.sizeTo;
  }
  if (property.sizeFromSqft !== null && property.sizeFromSqft !== undefined) {
    property.sizeFromSqft = typeof property.sizeFromSqft === 'string' ? parseFloat(property.sizeFromSqft) : property.sizeFromSqft;
  }
  if (property.sizeToSqft !== null && property.sizeToSqft !== undefined) {
    property.sizeToSqft = typeof property.sizeToSqft === 'string' ? parseFloat(property.sizeToSqft) : property.sizeToSqft;
  }
  if (property.priceFrom !== null && property.priceFrom !== undefined) {
    property.priceFrom = typeof property.priceFrom === 'string' ? parseFloat(property.priceFrom) : property.priceFrom;
  }
  if (property.priceFromAED !== null && property.priceFromAED !== undefined) {
    property.priceFromAED = typeof property.priceFromAED === 'string' ? parseFloat(property.priceFromAED) : property.priceFromAED;
  }
  if (property.price !== null && property.price !== undefined) {
    property.price = typeof property.price === 'string' ? parseFloat(property.price) : property.price;
  }
  if (property.priceAED !== null && property.priceAED !== undefined) {
    property.priceAED = typeof property.priceAED === 'string' ? parseFloat(property.priceAED) : property.priceAED;
  }
  if (property.size !== null && property.size !== undefined) {
    property.size = typeof property.size === 'string' ? parseFloat(property.size) : property.size;
  }
  if (property.sizeSqft !== null && property.sizeSqft !== undefined) {
    property.sizeSqft = typeof property.sizeSqft === 'string' ? parseFloat(property.sizeSqft) : property.sizeSqft;
  }
  
  // Calculate priceFromAED if missing but priceFrom exists (USD to AED conversion: 1 USD = 3.673 AED)
  if (property.propertyType === 'off-plan') {
    if ((property.priceFromAED === null || property.priceFromAED === undefined || property.priceFromAED === 0) && 
        property.priceFrom !== null && property.priceFrom !== undefined && property.priceFrom > 0) {
      property.priceFromAED = Math.round(property.priceFrom * 3.673);
        if (process.env.NODE_ENV === 'development') {
        console.log(`💱 PropertyDetail - Calculated priceFromAED for ${property.name}: ${property.priceFrom} USD * 3.673 = ${property.priceFromAED} AED`);
      }
    }
    
    // For off-plan properties, bathroomsFrom/To should always be null
    if (property.bathroomsFrom !== null || property.bathroomsTo !== null) {
      property.bathroomsFrom = null;
      property.bathroomsTo = null;
    }
    
    // Calculate sizeFromSqft/sizeToSqft if missing but sizeFrom/sizeTo exists (m² to sqft: 1 m² = 10.764 sqft)
    if (property.sizeFrom !== null && property.sizeFrom !== undefined && property.sizeFrom > 0) {
      if (property.sizeFromSqft === null || property.sizeFromSqft === undefined || property.sizeFromSqft === 0) {
        property.sizeFromSqft = Math.round(property.sizeFrom * 10.764 * 100) / 100;
      }
    }
    if (property.sizeTo !== null && property.sizeTo !== undefined && property.sizeTo > 0) {
      if (property.sizeToSqft === null || property.sizeToSqft === undefined || property.sizeToSqft === 0) {
        property.sizeToSqft = Math.round(property.sizeTo * 10.764 * 100) / 100;
      }
                }
              } else {
    // For secondary properties, calculate priceAED if missing but price exists
    if ((property.priceAED === null || property.priceAED === undefined || property.priceAED === 0) && 
        property.price !== null && property.price !== undefined && property.price > 0) {
      property.priceAED = Math.round(property.price * 3.673);
              if (process.env.NODE_ENV === 'development') {
        console.log(`💱 PropertyDetail - Calculated priceAED for ${property.name}: ${property.price} USD * 3.673 = ${property.priceAED} AED`);
      }
    }
    
    // Calculate sizeSqft if missing but size exists
    if (property.size !== null && property.size !== undefined && property.size > 0) {
      if (property.sizeSqft === null || property.sizeSqft === undefined || property.sizeSqft === 0) {
        property.sizeSqft = Math.round(property.size * 10.764 * 100) / 100;
      }
    }
  }
  
  // Helper function to extract URL (same as in getProperties)
  const extractUrl = (item: any): string | null => {
    if (!item) return null;
    if (typeof item === 'string' && item.trim().length > 0) {
      return item.trim();
    }
    if (typeof item === 'object' && item !== null) {
      const urlFields = ['url', 'src', 'imageUrl', 'image', 'photo'];
      for (const field of urlFields) {
        if (item[field] && typeof item[field] === 'string' && item[field].trim().length > 0) {
          return item[field].trim();
        }
      }
      const values = Object.values(item);
      for (const value of values) {
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
      }
    }
    return null;
  };
  
  // Normalize photos array
  if (!property.photos) {
    property.photos = [];
  } else if (Array.isArray(property.photos)) {
    const extractedUrls: string[] = [];
    for (const item of property.photos) {
      const url = extractUrl(item);
      if (url) extractedUrls.push(url);
    }
    property.photos = extractedUrls;
  } else if (typeof property.photos === 'string') {
    try {
      const parsed = JSON.parse(property.photos);
      if (Array.isArray(parsed)) {
        const extractedUrls: string[] = [];
        for (const item of parsed) {
          const url = extractUrl(item);
          if (url) extractedUrls.push(url);
        }
        property.photos = extractedUrls;
      } else {
        const url = extractUrl(parsed);
        property.photos = url ? [url] : [];
      }
    } catch {
      const url = extractUrl(property.photos);
      property.photos = url ? [url] : [];
    }
  } else if (typeof property.photos === 'object' && property.photos !== null) {
    const values = Object.values(property.photos);
    const extractedUrls: string[] = [];
    for (const value of values) {
      const url = extractUrl(value);
      if (url) extractedUrls.push(url);
    }
    property.photos = extractedUrls;
  } else {
    property.photos = [];
  }
  
  // Final validation
  property.photos = property.photos.filter((photo: any): photo is string => {
    return typeof photo === 'string' && photo.trim().length > 0;
  });
  
  // Normalize units if they exist
  if (property.units && Array.isArray(property.units)) {
    property.units = property.units.map((unit: any) => {
      // Normalize unit price fields
      if (unit.price !== null && unit.price !== undefined) {
        unit.price = typeof unit.price === 'string' ? parseFloat(unit.price) : unit.price;
      }
      if (unit.priceAED !== null && unit.priceAED !== undefined) {
        unit.priceAED = typeof unit.priceAED === 'string' ? parseFloat(unit.priceAED) : unit.priceAED;
      } else if (unit.price !== null && unit.price !== undefined && unit.price > 0) {
        // Calculate priceAED if missing
        unit.priceAED = Math.round(unit.price * 3.673);
      }
      
      // Normalize unit size fields
      if (unit.totalSize !== null && unit.totalSize !== undefined) {
        unit.totalSize = typeof unit.totalSize === 'string' ? parseFloat(unit.totalSize) : unit.totalSize;
      }
      if (unit.totalSizeSqft !== null && unit.totalSizeSqft !== undefined) {
        unit.totalSizeSqft = typeof unit.totalSizeSqft === 'string' ? parseFloat(unit.totalSizeSqft) : unit.totalSizeSqft;
      } else if (unit.totalSize !== null && unit.totalSize !== undefined && unit.totalSize > 0) {
        // Calculate totalSizeSqft if missing
        unit.totalSizeSqft = Math.round(unit.totalSize * 10.764 * 100) / 100;
      }
      
      if (unit.balconySize !== null && unit.balconySize !== undefined) {
        unit.balconySize = typeof unit.balconySize === 'string' ? parseFloat(unit.balconySize) : unit.balconySize;
      }
      if (unit.balconySizeSqft !== null && unit.balconySizeSqft !== undefined) {
        unit.balconySizeSqft = typeof unit.balconySizeSqft === 'string' ? parseFloat(unit.balconySizeSqft) : unit.balconySizeSqft;
      } else if (unit.balconySize !== null && unit.balconySize !== undefined && unit.balconySize > 0) {
        // Calculate balconySizeSqft if missing
        unit.balconySizeSqft = Math.round(unit.balconySize * 10.764 * 100) / 100;
      }
      
      return unit;
    });
  }
  
  return property as Property;
}

// Cache for public data to avoid multiple requests
let publicDataCache: PublicData | null = null;
let publicDataCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for properties requests
interface PropertiesCacheEntry {
  result: GetPropertiesResult;
  timestamp: number;
}

const propertiesCache = new Map<string, PropertiesCacheEntry>();
const PROPERTIES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Get public data (countries, cities, areas, developers, facilities)
 * Uses cache to avoid multiple requests
 */
export async function getPublicData(forceRefresh = false): Promise<PublicData> {
  // Return cached data if available and not expired
  const now = Date.now();
  if (!forceRefresh && publicDataCache && (now - publicDataCacheTime) < CACHE_DURATION) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Using cached public data');
    }
    return publicDataCache;
  }

  try {
    // Use longer timeout for /public/data as it can be very large (26K+ properties)
    const response = await apiClient.get<ApiResponse<PublicData>>('/public/data', {
      timeout: 120000, // 2 minutes timeout for large data
    });
    const data = response.data.data;
    
    // Cache the data
    publicDataCache = data;
    publicDataCacheTime = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Loaded and cached public data');
      if (data.properties && Array.isArray(data.properties)) {
        const uniqueAreaIds = [...new Set(data.properties.map(p => {
          if (typeof p.area === 'object' && p.area !== null) {
            return p.area.id;
          }
          return null;
        }).filter(Boolean))];
        console.log(`Public data contains ${data.properties.length} properties with ${uniqueAreaIds.length} unique area IDs`);
        
        // Show all unique area IDs (for debugging)
        if (uniqueAreaIds.length > 0) {
          console.log('All unique area IDs in public data:', uniqueAreaIds);
        }
        
        // Check if we have areas data and compare with properties
        if (data.areas && Array.isArray(data.areas)) {
          const areaIdsFromAreas = data.areas.map(a => a.id);
          console.log(`Areas data contains ${areaIdsFromAreas.length} areas`);
          console.log('First 10 area IDs from areas:', areaIdsFromAreas.slice(0, 10));
          
          // Check if properties use area IDs that exist in areas
          const areaIdsInProperties = uniqueAreaIds.filter((id): id is string => id !== null);
          const missingAreaIds = areaIdsInProperties.filter(id => !areaIdsFromAreas.includes(id));
          if (missingAreaIds.length > 0) {
            console.warn('⚠️ Some area IDs in properties are not found in areas list:', missingAreaIds);
          }
        }
      }
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching public data:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Clear public data cache (useful for testing or forced refresh)
 */
export function clearPublicDataCache(): void {
  publicDataCache = null;
  publicDataCacheTime = 0;
  if (process.env.NODE_ENV === 'development') {
    console.log('Public data cache cleared');
  }
}

/**
 * Clear properties cache (useful for testing or forced refresh)
 */
export function clearPropertiesCache(): void {
  const cacheSize = propertiesCache.size;
  propertiesCache.clear();
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗑️ Properties cache cleared (removed ${cacheSize} entries)`);
  }
}

/**
 * Clear ALL caches (properties + public data)
 */
export function clearAllCaches(): void {
  clearPropertiesCache();
  clearPublicDataCache();
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️ All caches cleared');
  }
}

/**
 * Submit investment (for registered users)
 */
export async function submitInvestment(data: InvestmentRequest): Promise<Investment> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Submitting investment (authenticated):', {
        propertyId: data.propertyId,
        amount: data.amount,
        date: data.date,
        hasNotes: !!data.notes,
      });
    }
    
    const response = await apiClient.post<ApiResponse<Investment>>('/investments', data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Investment submitted successfully:', response.data.data);
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error submitting investment:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Throw a more user-friendly error
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to submit investment';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Area interface
 */
export interface Area {
  id: string;
  nameEn: string;
  nameRu: string;
  nameAr: string;
  cityId: string;
  city: {
    id: string;
    nameEn: string;
    nameRu: string;
    nameAr: string;
    countryId: string;
    country: {
      id: string;
      nameEn: string;
      nameRu: string;
      nameAr: string;
      code: string;
    } | null;
  };
  projectsCount: {
    total: number;
    offPlan: number;
    secondary: number;
  };
  description: {
    title: string;
    description: string;
  } | null;
  infrastructure: {
    title: string;
    description: string;
  } | null;
  images: string[] | null;
}

/**
 * Get all areas
 * Falls back to /public/data if /public/areas is not available
 */
// Cache for areas requests
interface AreasCacheEntry {
  areas: Area[];
  timestamp: number;
  cityId?: string;
}

const areasCache = new Map<string, AreasCacheEntry>();
const AREAS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function clearAreasCache(): void {
  areasCache.clear();
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️ Areas cache cleared');
  }
}

export async function getAreas(cityId?: string, useCache: boolean = true): Promise<Area[]> {
  try {
    const cacheKey = cityId || 'all';
    
    // Check cache first
    if (useCache) {
      const cached = areasCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < AREAS_CACHE_DURATION) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Using cached areas (${cached.areas.length} areas, cityId: ${cityId || 'all'})`);
        }
        return cached.areas;
      }
    }
    
    const params = cityId ? { cityId } : {};
    const url = '/public/areas';
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Fetching areas from: ${API_BASE_URL}${url}`, params);
    }
    
    const response = await apiClient.get<ApiResponse<Area[]>>(url, { params });
    let areas = response.data.data;
    
    // Debug: Log first area structure to see what fields API returns
    if (process.env.NODE_ENV === 'development' && areas.length > 0) {
      const firstArea = areas[0];
      console.log('🔍 First area structure from API (BEFORE normalization):', {
        id: firstArea.id,
        nameEn: firstArea.nameEn,
        allKeys: Object.keys(firstArea),
        hasImages: 'images' in firstArea,
        hasImageUrl: 'imageUrl' in firstArea,
        hasImage: 'image' in firstArea,
        hasPhoto: 'photo' in firstArea,
        hasCloudinaryId: 'cloudinaryId' in firstArea,
        hasPublicId: 'publicId' in firstArea,
        imagesValue: (firstArea as any).images,
        imagesType: typeof (firstArea as any).images,
        imagesIsArray: Array.isArray((firstArea as any).images),
        imagesLength: Array.isArray((firstArea as any).images) ? (firstArea as any).images.length : 'N/A',
        firstImageValue: Array.isArray((firstArea as any).images) && (firstArea as any).images.length > 0 ? (firstArea as any).images[0] : 'N/A',
        firstImageType: Array.isArray((firstArea as any).images) && (firstArea as any).images.length > 0 ? typeof (firstArea as any).images[0] : 'N/A',
        firstImageKeys: Array.isArray((firstArea as any).images) && (firstArea as any).images.length > 0 && typeof (firstArea as any).images[0] === 'object' ? Object.keys((firstArea as any).images[0]) : 'N/A',
        firstImageStringified: Array.isArray((firstArea as any).images) && (firstArea as any).images.length > 0 ? JSON.stringify((firstArea as any).images[0], null, 2) : 'N/A',
        imageUrlValue: (firstArea as any).imageUrl,
        imageValue: (firstArea as any).image,
        photoValue: (firstArea as any).photo,
        cloudinaryIdValue: (firstArea as any).cloudinaryId,
        publicIdValue: (firstArea as any).publicId,
        // Log full object to see all fields
        fullObject: JSON.stringify(firstArea, null, 2).substring(0, 1000),
      });
      
      // Log a few more areas to see patterns
      if (areas.length > 1) {
        const sampleAreas = areas.slice(0, 5);
        console.log('🔍 Sample areas image data (first 5):', sampleAreas.map((a: any) => ({
          nameEn: a.nameEn,
          id: a.id,
          images: a.images,
          imagesType: typeof a.images,
          imagesIsArray: Array.isArray(a.images),
          imagesLength: Array.isArray(a.images) ? a.images.length : 'N/A',
          firstImage: Array.isArray(a.images) && a.images.length > 0 ? a.images[0] : 'N/A',
          firstImageType: Array.isArray(a.images) && a.images.length > 0 ? typeof a.images[0] : 'N/A',
          firstImageKeys: Array.isArray(a.images) && a.images.length > 0 && typeof a.images[0] === 'object' ? Object.keys(a.images[0]) : 'N/A',
          firstImageStringified: Array.isArray(a.images) && a.images.length > 0 ? JSON.stringify(a.images[0]) : 'N/A',
          imageUrl: a.imageUrl,
          image: a.image,
          photo: a.photo,
          cloudinaryId: a.cloudinaryId,
          publicId: a.publicId,
          // Check all string fields that might contain image data
          allStringFields: Object.keys(a).filter(key => typeof a[key] === 'string' && (a[key].includes('cloudinary') || a[key].includes('image') || a[key].includes('photo'))),
        })));
      }
      
      // Count areas with different image field types
      const areasWithImages = areas.filter((a: any) => {
        return Array.isArray(a.images) && a.images.length > 0;
      }).length;
      const areasWithImageUrl = areas.filter((a: any) => a.imageUrl && typeof a.imageUrl === 'string').length;
      const areasWithImage = areas.filter((a: any) => a.image && typeof a.image === 'string').length;
      const areasWithPhoto = areas.filter((a: any) => a.photo && typeof a.photo === 'string').length;
      const areasWithCloudinaryId = areas.filter((a: any) => a.cloudinaryId && typeof a.cloudinaryId === 'string').length;
      const areasWithPublicId = areas.filter((a: any) => a.publicId && typeof a.publicId === 'string').length;
      
      console.log('📊 Areas image fields statistics:', {
        total: areas.length,
        withImages: areasWithImages,
        withImageUrl: areasWithImageUrl,
        withImage: areasWithImage,
        withPhoto: areasWithPhoto,
        withCloudinaryId: areasWithCloudinaryId,
        withPublicId: areasWithPublicId,
      });
    }
    
    // Normalize image URLs for all areas
    // Also check for alternative image fields (imageUrl, image, photo, etc.)
    areas = areas.map((area: any, index: number) => {
      let imageUrls: string[] = [];
      let foundInField = '';
      
      // Helper function to extract URL from various formats (same as for properties)
      const extractUrl = (item: any): string | null => {
        if (!item) return null;
        
        // If it's already a string, return it
        if (typeof item === 'string' && item.trim().length > 0) {
          return item.trim();
        }
        
        // If it's an object, try to extract URL from common fields
        if (typeof item === 'object' && item !== null) {
          const urlFields = ['url', 'src', 'imageUrl', 'image', 'photo'];
          for (const field of urlFields) {
            if (item[field] && typeof item[field] === 'string' && item[field].trim().length > 0) {
              return item[field].trim();
            }
          }
          
          // If no URL field found, try Object.values to find string values
          const values = Object.values(item);
          for (const value of values) {
            if (typeof value === 'string' && value.trim().length > 0) {
              return value.trim();
            }
          }
        }
        
        return null;
      };
      
      
      // Check multiple possible fields for images
      // After backend fix: images is now always string[] (never null)
      // Format: [] (empty array) or ["https://res.cloudinary.com/.../areas/area-name-0.jpg", ...]
      // NOTE: Some URLs may be wrapped in extra quotes or have JSON artifacts like "\"{https://..." or "...jpg}\""
      if (Array.isArray(area.images) && area.images.length > 0) {
        // After migration: images are clean string[] with Cloudinary URLs
        // But some may have JSON encoding artifacts that need cleaning
        const extractedUrls: string[] = [];
        for (const item of area.images) {
          // Should be simple strings with full Cloudinary URLs
          if (typeof item === 'string' && item.trim().length > 0) {
            let cleaned = item.trim();
            
            // Clean JSON artifacts: remove escaped quotes, braces, etc.
            // Examples: "\"{https://..." -> "https://..." or "\"https://...\"" -> "https://..." or "...jpg}\"" -> "...jpg"
            cleaned = cleaned
              .replace(/^\\?"\{?/g, '') // Remove leading \", {, or \{
              .replace(/\}?\\?"$/g, '') // Remove trailing }, \", or }\"
              .replace(/^\\"/g, '') // Remove leading \"
              .replace(/\\"$/g, '') // Remove trailing \"
              .trim();
            
            // Try to extract URL if it's still wrapped
            if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
              // Try to extract URL from malformed string
              const urlMatch = cleaned.match(/https?:\/\/[^\s"{}]+/);
              if (urlMatch) {
                cleaned = urlMatch[0];
              }
            }
            
            // Validate it's a proper URL
            if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
              extractedUrls.push(cleaned);
            } else {
              // Log unexpected format for debugging
              console.warn(`⚠️ API: Area "${area.nameEn}" has non-URL image value after cleaning:`, {
                original: item.substring(0, 100),
                cleaned: cleaned.substring(0, 100),
              });
            }
          } else if (item) {
            // Log unexpected type (should not happen after migration)
            console.warn(`⚠️ API: Area "${area.nameEn}" has non-string image item:`, {
              type: typeof item,
              value: typeof item === 'object' ? JSON.stringify(item).substring(0, 100) : String(item).substring(0, 100),
            });
          }
        }
        
        if (extractedUrls.length === 0 && area.images.length > 0) {
          // This should not happen after migration, but log it if it does
          console.warn(`⚠️ API: No valid URLs extracted from ${area.images.length} images for area "${area.nameEn}"`, {
            firstImage: area.images[0],
            firstImageType: typeof area.images[0],
            firstImageValue: typeof area.images[0] === 'string' ? area.images[0].substring(0, 150) : JSON.stringify(area.images[0]).substring(0, 150),
          });
        }
        
        imageUrls = extractedUrls;
        foundInField = 'images';
      } else if (area.imageUrl && typeof area.imageUrl === 'string') {
        const url = extractUrl(area.imageUrl);
        if (url) imageUrls = [url];
        foundInField = 'imageUrl';
      } else if (area.image && typeof area.image === 'string') {
        const url = extractUrl(area.image);
        if (url) imageUrls = [url];
        foundInField = 'image';
      } else if (area.photo && typeof area.photo === 'string') {
        const url = extractUrl(area.photo);
        if (url) imageUrls = [url];
        foundInField = 'photo';
      } else if (area.cloudinaryId && typeof area.cloudinaryId === 'string') {
        // If API returns cloudinaryId/public_id, generate URL
        const generatedUrl = generateCloudinaryUrl(area.cloudinaryId, {
          width: 800,
          height: 600,
          quality: 'auto',
          format: 'auto'
        });
        if (generatedUrl) {
          imageUrls = [generatedUrl];
          foundInField = 'cloudinaryId';
        }
      } else if (area.publicId && typeof area.publicId === 'string') {
        // If API returns publicId, generate URL
        const generatedUrl = generateCloudinaryUrl(area.publicId, {
          width: 800,
          height: 600,
          quality: 'auto',
          format: 'auto'
        });
        if (generatedUrl) {
          imageUrls = [generatedUrl];
          foundInField = 'publicId';
        }
      }
      
      // Process image URLs - after migration, URLs are already clean Cloudinary URLs
      if (imageUrls.length > 0) {
        const processedUrls: string[] = [];
        
        for (const url of imageUrls) {
          if (!url || typeof url !== 'string' || url.trim().length === 0) {
            continue;
          }
          
          const trimmedUrl = url.trim();
          
          // After migration: URLs should already be full Cloudinary URLs
          // Just validate and filter out placeholders
          if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
            // Check if it's a placeholder
            const isPlaceholder = trimmedUrl.includes('unsplash.com') ||
              trimmedUrl.includes('placeholder') ||
              trimmedUrl.includes('via.placeholder.com') ||
              trimmedUrl.includes('dummyimage.com') ||
              trimmedUrl.includes('placehold.it') ||
              trimmedUrl.includes('fakeimg.pl');
            
            if (!isPlaceholder) {
              processedUrls.push(trimmedUrl);
            }
          } else {
            // Fallback: if it's not a full URL, try to normalize (for backward compatibility)
            const normalized = normalizeImageUrl(trimmedUrl, {
              width: 800,
              height: 600,
              quality: 'auto',
              format: 'auto'
            });
            
            if (normalized && normalized.trim().length > 0) {
              processedUrls.push(normalized);
            }
          }
        }
        
        if (processedUrls.length > 0) {
          area.images = processedUrls;
        } else {
          // All URLs were filtered out (placeholders or invalid)
          area.images = [];
        }
      } else {
        // No images found - set empty array
        area.images = [];
      }
      
      return area;
    });
    
    if (process.env.NODE_ENV === 'development') {
      const areasWithImages = areas.filter(a => a.images && Array.isArray(a.images) && a.images.length > 0).length;
      const areasWithDescription = areas.filter(a => a.description).length;
      const areasWithInfrastructure = areas.filter(a => a.infrastructure).length;
      
      console.log(`✅ Successfully loaded ${areas.length} areas from /api/public/areas`);
      console.log(`📸 Areas with images: ${areasWithImages}/${areas.length}`);
      console.log(`📝 Areas with description: ${areasWithDescription}/${areas.length}`);
      console.log(`🏗️ Areas with infrastructure: ${areasWithInfrastructure}/${areas.length}`);
      
      if (areasWithImages > 0) {
        const sampleAreas = areas.filter(a => a.images && Array.isArray(a.images) && a.images.length > 0).slice(0, 5);
        console.log('✅ Sample areas with images:', sampleAreas.map(a => ({
          nameEn: a.nameEn,
          imagesCount: a.images?.length || 0,
          firstImage: a.images?.[0]?.substring(0, 60) + '...' || 'N/A'
        })));
      }
      
      const areasWithoutImages = areas.filter(a => !a.images || !Array.isArray(a.images) || a.images.length === 0);
      if (areasWithoutImages.length > 0) {
        console.warn(`⚠️ ${areasWithoutImages.length} areas without images from /api/public/areas`);
        if (areasWithoutImages.length <= 10) {
          console.warn('Areas without images:', areasWithoutImages.map(a => a.nameEn));
        }
      }
    }
    
    // Cache the result
    if (useCache) {
      areasCache.set(cacheKey, {
        areas,
        timestamp: Date.now(),
        cityId,
      });
      
      // Limit cache size
      if (areasCache.size > 10) {
        const firstKey = areasCache.keys().next().value;
        if (firstKey) {
          areasCache.delete(firstKey);
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Cached ${areas.length} areas (cityId: ${cityId || 'all'})`);
      }
    }
    
    return areas;
  } catch (error: any) {
    // If 404, fallback to /public/data
    if (error.response?.status === 404) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ /public/areas endpoint not found (404), falling back to /public/data');
      }
      
      try {
        // Get areas from public data
        const publicData = await getPublicData(true);
        const areasFromData = publicData.areas || [];
        
        if (process.env.NODE_ENV === 'development') {
          // Check how many areas already have images from /public/data
          // Note: Areas from /public/data don't have images field in the type, but might have it in actual data
          const areasWithImagesFromData = areasFromData.filter(a => (a as any).images && Array.isArray((a as any).images) && (a as any).images.length > 0);
          console.log(`📊 Fallback: Loaded ${areasFromData.length} areas from /public/data`);
          console.log(`📸 Fallback: ${areasWithImagesFromData.length} areas already have images from /public/data`);
          
          if (areasWithImagesFromData.length > 0) {
            console.log('Sample areas with images from /public/data:', areasWithImagesFromData.slice(0, 5).map(a => ({
              nameEn: a.nameEn,
              imagesCount: ((a as any).images?.length || 0) as number
            })));
          }
        }
        
        // Try to get properties ONLY if we need images (not for counts - counts should come from backend)
        let properties: Property[] = [];
        const areasWithoutImages = areasFromData.filter(a => !(a as any).images || !Array.isArray((a as any).images) || (a as any).images.length === 0);
        
        if (areasWithoutImages.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`⚠️ Fallback: ${areasWithoutImages.length} areas need images from properties`);
          }
          
          try {
            // Load only a limited number of properties for images (not all 26K!)
            // Use limit to avoid loading all secondary properties
            const result = await getProperties({ limit: 1000 });
            properties = result.properties || [];
          
          if (process.env.NODE_ENV === 'development') {
              console.log(`📦 Fallback: Loaded ${properties.length} properties for area images (limited to 1000)`);
          }
        } catch (propError: any) {
            // If properties fail, continue without images
          if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Fallback: Could not load properties for area images:', propError);
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Fallback: All areas already have images from /public/data, skipping properties loading');
          }
        }
        
        // Get best property image for each area
        // Use the first property with photos for each area
        const areaImagesMap = new Map<string, string>();
        const areaPropertiesMap = new Map<string, Property[]>();
        const areaNameToIdMap = new Map<string, string>(); // For faster lookup by name
        
        // Build name to ID map
        areasFromData.forEach(area => {
          areaNameToIdMap.set(area.nameEn.toLowerCase(), area.id);
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🗺️ Fallback: Built area name map with ${areaNameToIdMap.size} areas`);
          console.log(`📦 Fallback: Processing ${properties.length} properties for area images`);
        }
        
        let matchedCount = 0;
        let unmatchedCount = 0;
        const unmatchedAreaNames = new Set<string>();
        
        // Group properties by area using improved matching
        properties.forEach(property => {
          if (property.photos && property.photos.length > 0) {
            let areaId: string | null = null;
            if (typeof property.area === 'string') {
              // Off-plan: area is "areaName, cityName"
              const areaName = property.area.split(',')[0].trim();
              
              // Try multiple matching strategies (same as main logic)
              // 1. Exact lowercase match
              areaId = areaNameToIdMap.get(areaName.toLowerCase()) || null;
              
              // 2. Try exact match (case-sensitive)
              if (!areaId) {
              const area = areasFromData.find(a => a.nameEn === areaName);
              areaId = area?.id || null;
              }
              
              // 3. Try case-insensitive match
              if (!areaId) {
                const area = areasFromData.find(a => a.nameEn.toLowerCase() === areaName.toLowerCase());
                areaId = area?.id || null;
              }
              
              // 4. Try partial match
              if (!areaId) {
                const area = areasFromData.find(a => 
                  a.nameEn.toLowerCase().includes(areaName.toLowerCase()) ||
                  areaName.toLowerCase().includes(a.nameEn.toLowerCase())
                );
                areaId = area?.id || null;
              }
              
              // 5. Try removing "Area" prefix
              if (!areaId) {
                const normalizedName = areaName.replace(/^Area\s+/i, '').trim();
                areaId = areaNameToIdMap.get(normalizedName.toLowerCase()) || null;
                if (!areaId) {
                  const area = areasFromData.find(a => 
                    a.nameEn.toLowerCase() === normalizedName.toLowerCase() ||
                    a.nameEn.toLowerCase().replace(/^area\s+/, '') === normalizedName.toLowerCase()
                  );
                  areaId = area?.id || null;
                }
              }
              
              if (!areaId) {
                unmatchedAreaNames.add(areaName);
                if (process.env.NODE_ENV === 'development' && unmatchedCount < 5) {
                  console.warn(`⚠️ Fallback: Could not find area ID for property area name: "${areaName}" (property: ${property.name})`);
                  unmatchedCount++;
                }
              }
            } else if (typeof property.area === 'object' && property.area !== null) {
              // Secondary: area is an object
              areaId = property.area.id || null;
              
              // Also try to match by name if ID doesn't match
              if (!areaId && property.area && typeof property.area === 'object' && property.area.nameEn) {
                const areaName = property.area.nameEn;
                const areaByName = areasFromData.find(a => 
                  a.nameEn === areaName || 
                  a.nameEn.toLowerCase() === areaName.toLowerCase()
                );
                areaId = areaByName?.id || null;
              }
            }
            
            if (areaId) {
              if (!areaPropertiesMap.has(areaId)) {
                areaPropertiesMap.set(areaId, []);
              }
              areaPropertiesMap.get(areaId)!.push(property);
              
              // Use first property's first photo for the area
              if (!areaImagesMap.has(areaId)) {
                areaImagesMap.set(areaId, property.photos[0]);
                matchedCount++;
                if (process.env.NODE_ENV === 'development' && matchedCount <= 10) {
                  const area = areasFromData.find(a => a.id === areaId);
                  console.log(`✅ Fallback: Mapped image for area: ${area?.nameEn || areaId} (from property: ${property.name})`);
                }
              }
            }
          }
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📸 Fallback: Created image map: ${areaImagesMap.size} areas have images from properties`);
          if (unmatchedAreaNames.size > 0) {
            console.warn(`⚠️ Fallback: Total unmatched area names: ${unmatchedAreaNames.size}`);
            console.warn('Sample unmatched names:', Array.from(unmatchedAreaNames).slice(0, 10));
          }
        }
        
        // Calculate projectsCount for each area
        // NOTE: This is a fallback - ideally backend should provide counts
        // We only use loaded properties (limited to 1000) for counts, which may be inaccurate
        const areasWithCounts: Area[] = areasFromData.map(area => {
          // Use cached properties if available, otherwise filter
          let areaProperties: Property[] = [];
          if (areaPropertiesMap.has(area.id)) {
            areaProperties = areaPropertiesMap.get(area.id)!;
          } else {
            // Only filter if we have properties loaded (limited set)
            if (properties.length > 0) {
            areaProperties = properties.filter(p => {
              if (typeof p.area === 'string') {
                // Off-plan: area is "areaName, cityName"
                const areaName = p.area.split(',')[0].trim();
                return areaName === area.nameEn;
              } else {
                // Secondary: area is an object
                return p.area?.id === area.id;
              }
            });
            }
          }
          
          // Counts are approximate since we only loaded 1000 properties
          const offPlanCount = areaProperties.filter(p => p.propertyType === 'off-plan').length;
          const secondaryCount = areaProperties.filter(p => p.propertyType === 'secondary').length;
          
          // If we have limited properties, counts may be inaccurate
          // Set to 0 if we don't have enough data to be confident
          const totalCount = properties.length < 100 ? 0 : areaProperties.length;
          
          // Get image - FIRST check if area already has images from /public/data
          let areaImages: string[] | null = null;
          
          // Priority 1: Use images from /public/data if available
          const areaImagesFromData = (area as any).images;
          if (areaImagesFromData && Array.isArray(areaImagesFromData) && areaImagesFromData.length > 0) {
            areaImages = normalizeImageUrls(areaImagesFromData, {
              width: 800,
              height: 600,
              quality: 'auto',
              format: 'auto'
            });
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Fallback: Using images from /public/data for area: ${area.nameEn} (${areaImages.length} images)`);
            }
          } 
          // Priority 2: Use images from properties (areaImagesMap)
          else if (areaImagesMap.has(area.id)) {
            const imageUrl = normalizeImageUrl(areaImagesMap.get(area.id)!, {
              width: 800,
              height: 600,
              quality: 'auto',
              format: 'auto'
            });
            areaImages = [imageUrl];
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Fallback: Using image from properties for area: ${area.nameEn}`);
            }
          } 
          // Priority 3: Try to find from areaProperties
          else if (areaProperties.length > 0) {
            const propertyWithPhoto = areaProperties.find(p => p.photos && p.photos.length > 0);
            if (propertyWithPhoto && propertyWithPhoto.photos) {
              const imageUrl = normalizeImageUrl(propertyWithPhoto.photos[0], {
                width: 800,
                height: 600,
                quality: 'auto',
                format: 'auto'
              });
              areaImages = [imageUrl];
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Fallback: Found image from area properties for: ${area.nameEn}`);
              }
            }
          }
          
          return {
            id: area.id,
            nameEn: area.nameEn,
            nameRu: area.nameRu,
            nameAr: area.nameAr,
            cityId: area.cityId,
            city: (() => {
              const city = publicData.cities.find(c => c.id === area.cityId);
              const country = city ? publicData.countries.find(c => c.id === city.countryId) : null;
              return {
                id: city?.id || '',
                nameEn: city?.nameEn || '',
                nameRu: city?.nameRu || '',
                nameAr: city?.nameAr || '',
                countryId: city?.countryId || '',
                country: country ? {
                  id: country.id,
                  nameEn: country.nameEn,
                  nameRu: country.nameRu,
                  nameAr: country.nameAr,
                  code: country.code,
                } : null,
              };
            })(),
            projectsCount: {
              total: totalCount,
              offPlan: offPlanCount,
              secondary: secondaryCount,
            },
            description: (area as any).description || null,
            infrastructure: (area as any).infrastructure || null,
            images: areaImages,
          };
        });
        
        // Filter by cityId if provided
        const filteredAreas = cityId 
          ? areasWithCounts.filter(a => a.cityId === cityId)
          : areasWithCounts;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Loaded ${filteredAreas.length} areas from /public/data (fallback)`);
        }
        
        return filteredAreas;
      } catch (fallbackError: any) {
        console.error('❌ Error in fallback to /public/data:', fallbackError);
        throw fallbackError;
      }
    }
    
    // For other errors, throw as usual
    console.error('❌ Error fetching areas:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response URL:', error.response.config?.url);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Get area by ID
 */
export async function getAreaById(areaId: string): Promise<Area | null> {
  try {
    const areas = await getAreas();
    const area = areas.find(a => a.id === areaId);
    return area || null;
  } catch (error: any) {
    console.error('Error fetching area by ID:', error);
    return null;
  }
}

/**
 * Developer interface
 */
export interface Developer {
  id: string;
  name: string;
  logo: string | null;
  description: {
    title: string;
    description: string;
  } | null;
  images: string[] | null;
  projectsCount: {
    total: number;
    offPlan: number;
    secondary: number;
  };
  createdAt?: string;
}

/**
 * Get all developers
 * Falls back to /public/data if /public/developers is not available
 */
export async function getDevelopers(): Promise<Developer[]> {
  try {
    const url = '/public/developers';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching developers from:', `${API_BASE_URL}${url}`);
    }
    
    const response = await apiClient.get<ApiResponse<any[]>>(url);
    let developers = response.data.data;
    
    // Process developers: handle description (can be JSON string or object)
    const processedDevelopers: Developer[] = developers.map((dev: any) => {
      let description: { title: string; description: string } | null = null;
      
      if (dev.description) {
        // If description is a string, try to parse it as JSON
        if (typeof dev.description === 'string') {
          try {
            const parsed = JSON.parse(dev.description);
            if (parsed && (parsed.title || parsed.description)) {
              description = {
                title: parsed.title || '',
                description: parsed.description || '',
              };
            }
          } catch {
            // If parsing fails, treat as plain text
            description = {
              title: '',
              description: dev.description,
            };
          }
        } else if (typeof dev.description === 'object') {
          // Already an object
          description = {
            title: dev.description.title || '',
            description: dev.description.description || '',
          };
        }
      }
      
      return {
        id: dev.id,
        name: dev.name,
        logo: dev.logo,
        description,
        images: dev.images || null,
        projectsCount: dev.projectsCount || {
          total: 0,
          offPlan: 0,
          secondary: 0,
        },
        createdAt: dev.createdAt,
      };
    });
    
    if (process.env.NODE_ENV === 'development') {
      const developersWithImages = processedDevelopers.filter(d => d.images && Array.isArray(d.images) && d.images.length > 0).length;
      const developersWithDescription = processedDevelopers.filter(d => d.description).length;
      const developersWithLogo = processedDevelopers.filter(d => d.logo).length;
      
      console.log(`✅ Successfully loaded ${processedDevelopers.length} developers from /api/public/developers`);
      console.log(`📸 Developers with images: ${developersWithImages}/${processedDevelopers.length}`);
      console.log(`📝 Developers with description: ${developersWithDescription}/${processedDevelopers.length}`);
      console.log(`🖼️ Developers with logo: ${developersWithLogo}/${processedDevelopers.length}`);
    }
    
    return processedDevelopers;
  } catch (error: any) {
    // If 404, fallback to /public/data
    if (error.response?.status === 404) {
      console.warn('⚠️ /public/developers endpoint not found (404), falling back to /public/data');
      
      try {
        // Get developers from public data
        console.log('🔄 Fallback: Fetching public data...');
        const publicData = await getPublicData(true);
        console.log('✅ Fallback: Received public data:', {
          hasDevelopers: !!publicData.developers,
          developersType: Array.isArray(publicData.developers) ? 'array' : typeof publicData.developers,
          developersLength: Array.isArray(publicData.developers) ? publicData.developers.length : 'N/A',
        });
        
        const developersFromData = publicData.developers || [];
        
        console.log(`📊 Fallback: Loaded ${developersFromData.length} developers from /public/data`);
        
        if (!Array.isArray(developersFromData)) {
          console.error('❌ Fallback: developers is not an array:', developersFromData);
          return [];
        }
        
        if (developersFromData.length === 0) {
          console.warn('⚠️ Fallback: No developers found in /public/data');
          console.log('Available keys in publicData:', Object.keys(publicData));
          return [];
        }
        
        console.log('✅ Fallback: Sample developer:', developersFromData[0]);
        
        // Try to get properties to calculate counts (optional - don't fail if this fails)
        let properties: Property[] = [];
        try {
          console.log('🔄 Fallback: Loading properties for counts...');
          // Load only a limited number of properties for counts (not all 26K!)
          const result = await getProperties({ limit: 1000 });
          properties = result.properties || [];
          
          console.log(`📦 Fallback: Loaded ${properties.length} properties for developer counts (limited to 1000)`);
        } catch (propError: any) {
          console.warn('⚠️ Fallback: Could not load properties for developer counts (continuing without counts):', propError.message);
          // Continue without properties - counts will be 0
        }
        
        // Calculate projectsCount for each developer
        console.log('🔄 Fallback: Calculating projectsCount...');
        const developersWithCounts: Developer[] = developersFromData.map(developer => {
          const developerProperties = properties.filter(p => p.developer?.id === developer.id);
          
          const offPlanCount = developerProperties.filter(p => p.propertyType === 'off-plan').length;
          const secondaryCount = developerProperties.filter(p => p.propertyType === 'secondary').length;
          
          // Counts are approximate since we only loaded 1000 properties
          const totalCount = properties.length < 100 ? 0 : developerProperties.length;
          
          return {
            id: developer.id,
            name: developer.name,
            logo: developer.logo,
            description: null, // Not available in /public/data
            images: null, // Not available in /public/data
            projectsCount: {
              total: totalCount,
              offPlan: offPlanCount,
              secondary: secondaryCount,
            },
          };
        });
        
        console.log(`✅ Fallback: Successfully loaded ${developersWithCounts.length} developers from /public/data`);
        
        return developersWithCounts;
      } catch (fallbackError: any) {
        console.error('❌ Error in fallback to /public/data:', fallbackError);
        console.error('Fallback error details:', {
          message: fallbackError.message,
          stack: fallbackError.stack,
          response: fallbackError.response?.data,
        });
        // Return empty array instead of throwing, so page can still render
        console.warn('⚠️ Returning empty developers array due to fallback error');
        return [];
      }
    }
    
    // For other errors, throw as usual
    console.error('❌ Error fetching developers:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response URL:', error.response.config?.url);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Get developer by ID
 */
export async function getDeveloperById(developerId: string): Promise<Developer | null> {
  try {
    const developers = await getDevelopers();
    const developer = developers.find(d => d.id === developerId);
    return developer || null;
  } catch (error: any) {
    console.error('Error fetching developer by ID:', error);
    return null;
  }
}

/**
 * Submit investment (for non-registered users)
 */
export async function submitInvestmentPublic(data: InvestmentRequest): Promise<Investment> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Submitting investment (public):', {
        propertyId: data.propertyId,
        amount: data.amount,
        date: data.date,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        hasNotes: !!data.notes,
      });
    }
    
    const response = await apiClient.post<ApiResponse<Investment>>('/investments/public', data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Investment submitted successfully (public):', response.data.data);
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error submitting investment (public):', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Throw a more user-friendly error
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to submit investment';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

// ============================================
// News API
// ============================================

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  titleRu: string;
  description?: string;
  descriptionRu?: string;
  image: string;
  publishedAt: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsContent {
  id: string;
  newsId: string;
  type: 'text' | 'image' | 'video';
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  order: number;
}

export interface NewsDetail extends NewsItem {
  contents?: NewsContent[];
}

export interface GetNewsResult {
  news: NewsItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get list of news articles
 * @param page - Page number (starts from 1)
 * @param limit - Items per page (default: 12)
 * @returns News list with pagination info
 */
export async function getNews(page: number = 1, limit: number = 12): Promise<GetNewsResult> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', 'publishedAt');
    params.append('sortOrder', 'DESC');

    const url = `/public/news?${params.toString()}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching news from:', `${API_BASE_URL}${url}`);
    }

    const response = await apiClient.get<ApiResponse<{
      data: NewsItem[];
      total: number;
      page: number;
      limit: number;
    }>>(url);

    if (process.env.NODE_ENV === 'development') {
      console.log('📰 News API response:', {
        success: response.data.success,
        dataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data),
        keys: response.data.data && typeof response.data.data === 'object' ? Object.keys(response.data.data) : 'N/A',
        fullResponse: JSON.stringify(response.data, null, 2).substring(0, 500),
      });
    }

    if (!response.data.success) {
      throw new Error('Failed to fetch news');
    }

    const data = response.data.data;
    
    // Handle different response structures
    let newsArray: NewsItem[] = [];
    let total = 0;
    let currentPage = page;
    let currentLimit = limit;

    if (Array.isArray(data)) {
      // Direct array response
      newsArray = data;
      total = data.length;
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ News: Direct array response, length:', data.length);
      }
    } else if (data && typeof data === 'object') {
      // Paginated response: { data: NewsItem[], total: number, page: number, limit: number }
      if ('data' in data && Array.isArray((data as any).data)) {
        newsArray = (data as any).data;
        total = (data as any).total || newsArray.length;
        currentPage = (data as any).page || page;
        currentLimit = (data as any).limit || limit;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ News: Paginated response', {
            newsCount: newsArray.length,
            total,
            page: currentPage,
            limit: currentLimit,
          });
        }
      } else {
        // Try to find array in other keys
        const possibleKeys = ['news', 'items', 'results', 'list'];
        for (const key of possibleKeys) {
          if (Array.isArray((data as any)[key])) {
            newsArray = (data as any)[key];
            total = (data as any).total || newsArray.length;
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ News: Found array in key "${key}"`, newsArray.length);
            }
            break;
          }
        }
        if (newsArray.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ News: No array found in response data');
          }
          newsArray = [];
          total = 0;
        }
      }
    }

    // Convert publishedAt from string to Date for compatibility
    const newsWithDates = newsArray.map(item => ({
      ...item,
      publishedAt: item.publishedAt,
    }));

    return {
      news: newsWithDates,
      total,
      page: currentPage,
      limit: currentLimit,
    };
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (process.env.NODE_ENV === 'development') {
        console.error('📰 News API Error Details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          message: axiosError.message,
          code: axiosError.code,
          responseData: axiosError.response?.data,
          url: axiosError.config?.url,
          method: axiosError.config?.method,
        });
      }
      
      if (axiosError.response?.status === 404) {
        // No news found, return empty result
        return {
          news: [],
          total: 0,
          page,
          limit,
        };
      }
      
      // CORS error or network error
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message.includes('CORS') || axiosError.message.includes('Access-Control')) {
        throw new Error('CORS error: Backend server is not allowing requests from this origin. Please check CORS configuration on the backend.');
      }
      
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch news');
    }
    throw error;
  }
}

/**
 * Get news article by slug
 * @param slug - News article slug or ID
 * @returns News article details with contents
 */
export async function getNewsBySlug(slug: string): Promise<NewsDetail | null> {
  try {
    const url = `/public/news/${slug}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Fetching news article from:', `${API_BASE_URL}${url}`);
    }

    const response = await apiClient.get<ApiResponse<NewsDetail>>(url);

    if (!response.data.success) {
      throw new Error('Failed to fetch news article');
    }

    const news = response.data.data;

    // Sort contents by order if present
    if (news.contents && Array.isArray(news.contents)) {
      news.contents.sort((a, b) => a.order - b.order);
    }

    return news;
  } catch (error) {
    console.error('Error fetching news article:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw new Error(axiosError.response?.data?.message || 'Failed to fetch news article');
    }
    throw error;
  }
}

export default apiClient;


