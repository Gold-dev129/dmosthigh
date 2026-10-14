import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../api/productService.js';
import { uploadService } from '../../api/uploadService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Plus,
  Trash2,
  Save,
  Layers,
  Sparkles,
} from 'lucide-react';

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['tees', 'hoodies', 'sweatpants', 'headwear', 'jackets', 'accessories'];

export const AdminProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  // Core Product Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tees');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  // Color 1 + Image 1
  const [color1, setColor1] = useState('Black');
  const [image1Url, setImage1Url] = useState('');
  const [image1PublicId, setImage1PublicId] = useState('');

  // Color 2 + Image 2 (Optional - only if 2nd color & image uploaded)
  const [color2, setColor2] = useState('');
  const [image2Url, setImage2Url] = useState('');
  const [image2PublicId, setImage2PublicId] = useState('');

  // Load existing product if in Edit mode
  useEffect(() => {
    if (!isEdit) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProductById(id);
        if (!prod) throw new Error('Product not found.');

        setName(prod.name || '');
        setDescription(prod.description || '');
        setCategory(prod.category || 'tees');
        setPrice(prod.price ? String(prod.price) : '');
        setDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
        setSelectedSizes(prod.sizes?.length ? prod.sizes : ['S', 'M', 'L', 'XL']);
        setFeatured(Boolean(prod.featured));
        setActive(prod.active !== undefined ? Boolean(prod.active) : true);

        // Populate Colors & Images accurately
        if (prod.images && prod.images.length > 0) {
          setImage1Url(prod.images[0].url || '');
          setImage1PublicId(prod.images[0].public_id || '');
          setColor1(prod.images[0].color || prod.colors?.[0] || 'Black');

          if (prod.images.length > 1) {
            setImage2Url(prod.images[1].url || '');
            setImage2PublicId(prod.images[1].public_id || '');
            setColor2(prod.images[1].color || prod.colors?.[1] || '');
          } else {
            // Strictly single image uploaded - do not set second color!
            setImage2Url('');
            setImage2PublicId('');
            setColor2('');
          }
        } else if (prod.colors && prod.colors.length > 0) {
          setColor1(prod.colors[0] || 'Black');
          setColor2(prod.colors.length > 1 ? (prod.colors[1] || '') : '');
        }
      } catch (err) {
        toastError(err.message || 'Failed to load product for editing.');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isEdit, navigate]);

  // Size toggle
  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  /**
   * Upload Image 1 to Cloudinary via backend uploadService
   */
  const handleFileUpload1 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading1(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const uploaded = await uploadService.uploadImages(formData);
      if (uploaded && uploaded.length > 0) {
        setImage1Url(uploaded[0].url);
        setImage1PublicId(uploaded[0].public_id);
        success(`Image for Color 1 (${color1}) uploaded to Cloudinary!`);
      } else {
        throw new Error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      console.warn('Backend Cloudinary upload failed, falling back to local preview:', err.message);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImage1Url(uploadEvent.target.result);
        setImage1PublicId(`local_${Date.now()}`);
        toastError(`Could not upload to Cloudinary server (${err.message}). Using local preview.`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading1(false);
    }
  };

  /**
   * Upload Image 2 to Cloudinary via backend uploadService
   */
  const handleFileUpload2 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading2(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const uploaded = await uploadService.uploadImages(formData);
      if (uploaded && uploaded.length > 0) {
        setImage2Url(uploaded[0].url);
        setImage2PublicId(uploaded[0].public_id);
        success(`Image for Color 2 (${color2}) uploaded to Cloudinary!`);
      } else {
        throw new Error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      console.warn('Backend Cloudinary upload failed, falling back to local preview:', err.message);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImage2Url(uploadEvent.target.result);
        setImage2PublicId(`local_${Date.now()}`);
        toastError(`Could not upload to Cloudinary server (${err.message}). Using local preview.`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading2(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toastError('Product name is required.');
    if (!description.trim()) return toastError('Product description is required.');
    if (!price || Number(price) <= 0) return toastError('Valid product price is required.');

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      return toastError('Discount price must be strictly less than the regular price.');
    }

    if (selectedSizes.length === 0) {
      return toastError('Please select at least one available size.');
    }

    // Build colors and images arrays associating Color 1 -> Image 1 and Color 2 -> Image 2
    const colorsList = [];
    const imagesList = [];

    const c1 = color1.trim() || 'Standard';
    if (image1Url.trim()) {
      colorsList.push(c1);
      imagesList.push({
        url: image1Url.trim(),
        public_id: image1PublicId.trim() || `img_1_${Date.now()}`,
        color: c1,
      });
    }

    // Strictly only include Color 2 if Image 2 is actually provided!
    if (image2Url.trim()) {
      const c2 = color2.trim() || 'Secondary';
      colorsList.push(c2);
      imagesList.push({
        url: image2Url.trim(),
        public_id: image2PublicId.trim() || `img_2_${Date.now()}`,
        color: c2,
      });
    }

    if (imagesList.length === 0) {
      return toastError('Please upload at least one product image.');
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.toLowerCase().trim(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: 999,
      sizes: selectedSizes,
      colors: colorsList,
      images: imagesList,
      featured,
      active,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await productService.updateProduct(id, payload);
        success(`"${payload.name}" updated successfully!`);
      } else {
        await productService.createProduct(payload);
        success(`Product "${payload.name}" created successfully!`);
      }
      navigate('/admin/products');
    } catch (err) {
      toastError(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="RETRIEVING PRODUCT SPECIFICATIONS..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl 2xl:max-w-6xl">
      {/* Top Header */}
      <div className="border-b border-neutral-850 pb-4 flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#FFE600] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <span className="text-[10px] sm:text-xs text-neutral-500 uppercase font-black tracking-widest">
          {isEdit ? 'EDITING PRODUCT' : 'NEW PRODUCT'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Section 1: General Info */}
        <div className="bg-[#101010] border border-neutral-800 p-3.5 min-[380px]:p-4 sm:p-8 space-y-4 sm:space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#FFE600] border-b border-neutral-800 pb-3">
            1. PRODUCT SPECIFICATIONS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="D.MOST.HIGH Heavyweight Boxy Tee"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-base sm:text-sm text-white focus:border-[#FFE600] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="280 GSM combed cotton. Oversized relaxed fit with dropped shoulders. High-density screenprint on chest and back."
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white uppercase font-bold focus:border-[#FFE600] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                Regular Price (₦) *
              </label>
              <input
                type="number"
                required
                min="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="80000"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none font-bold"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                Discount Price (₦) (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Leave blank if no discount"
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-[#FFE600] focus:border-[#FFE600] focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Sizes */}
        <div className="bg-[#101010] border border-neutral-800 p-4 sm:p-8 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#FFE600] border-b border-neutral-800 pb-3">
            2. AVAILABLE SIZES
          </h2>

          <div className="flex flex-wrap gap-2.5">
            {STANDARD_SIZES.map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border transition-all ${
                    isSelected
                      ? 'border-[#FFE600] bg-[#FFE600] text-black shadow-md'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  {size} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: TWO COLORS + TWO COLOR-SPECIFIC IMAGES */}
        <div className="bg-[#101010] border border-neutral-800 p-4 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#FFE600]">
              3. TWO COLOR VARIANTS & CORRESPONDING IMAGES
            </h2>
            <span className="text-[10px] text-neutral-400">
              Each color variant has its own dedicated product image
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Color 1 + Image 1 */}
            <div className="p-5 bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 inline-block" />
                  VARIANT 1 (PRIMARY)
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                  Color 1 Name *
                </label>
                <input
                  type="text"
                  required
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  placeholder="Black"
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Image 1 Upload / URL */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                  Image 1 (Cloudinary Upload or URL) *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload1}
                    disabled={uploading1}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-black file:uppercase file:bg-[#FFE600] file:text-black hover:file:bg-yellow-400 cursor-pointer"
                  />
                  {uploading1 && <span className="text-xs text-[#FFE600] animate-pulse">Uploading...</span>}
                </div>
                <input
                  type="url"
                  placeholder="Or paste image URL"
                  value={image1Url}
                  onChange={(e) => setImage1Url(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Image 1 Preview */}
              {image1Url ? (
                <div className="relative aspect-[4/5] bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center">
                  <img
                    src={image1Url}
                    alt={`Color 1 Preview (${color1})`}
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1 px-2 text-[10px] font-black uppercase text-[#FFE600]">
                    Color 1: {color1}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/5] border border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600 p-4 text-center">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    No Image Uploaded for {color1}
                  </span>
                </div>
              )}
            </div>

            {/* Color 2 + Image 2 */}
            <div className="p-5 bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FFE600] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] inline-block" />
                  VARIANT 2 (OPTIONAL SECOND COLOR)
                </h3>
                {(image2Url || color2) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage2Url('');
                      setImage2PublicId('');
                      setColor2('');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase underline"
                  >
                    Clear Variant 2 (Single Color Only)
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                  Color 2 Name (Optional)
                </label>
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  placeholder="e.g. Yellow (Leave blank if single color)"
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Image 2 Upload / URL */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                  Image 2 (Cloudinary Upload or URL) (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload2}
                    disabled={uploading2}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-black file:uppercase file:bg-[#FFE600] file:text-black hover:file:bg-yellow-400 cursor-pointer"
                  />
                  {uploading2 && <span className="text-xs text-[#FFE600] animate-pulse">Uploading...</span>}
                </div>
                <input
                  type="url"
                  placeholder="Or paste image URL"
                  value={image2Url}
                  onChange={(e) => setImage2Url(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Image 2 Preview */}
              {image2Url ? (
                <div className="relative aspect-[4/5] bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center">
                  <img
                    src={image2Url}
                    alt={`Color 2 Preview (${color2})`}
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1 px-2 text-[10px] font-black uppercase text-[#FFE600]">
                    Color 2: {color2 || 'Secondary'}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/5] border border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600 p-4 text-center">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    No Image Uploaded for Variant 2
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Visibility & Features */}
        <div className="bg-[#101010] border border-neutral-800 p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#FFE600] border-b border-neutral-800 pb-3">
            4. PUBLISHING & VISIBILITY
          </h2>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-[#FFE600]"
              />
              <div>
                <span className="text-xs font-bold text-white uppercase block">
                  Active (Published to Storefront)
                </span>
                <span className="text-[11px] text-neutral-400">
                  Visible to all customers on homepage catalog
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#FFE600]"
              />
              <div>
                <span className="text-xs font-bold text-white uppercase block">
                  Featured Product Tag
                </span>
                <span className="text-[11px] text-neutral-400">
                  Displays special FEATURED highlight badge
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 border border-neutral-700 text-neutral-300 font-bold uppercase text-xs hover:bg-neutral-800 text-center"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || uploading1 || uploading2}
            className="px-8 py-3 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'SAVING PRODUCT...' : isEdit ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
          </button>
        </div>
      </form>
    </div>
  );
};
