import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  Upload,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Crop,
  X,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { API_URL } from "../../constants";

const Ads = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cropping state
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropData, setCropData] = useState({
    adType: null,
    files: null,
    isMultiple: false,
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // State for different ad types
  const [adImages, setAdImages] = useState({
    adcode_1: [], // Array of images
    adcode_2: [], // Array of images
    adcode_3: [], // Array of images
    ingamead: null, // Single image
    yellowboardad: null, // Single image
    redboardad: null, // Single image
  });

  // State for social links
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    tiktok: "",
    instagram: "",
    youtube: "",
    telegram: "",
  });

  // Cropping dimensions for different ad types
  const cropDimensions = {
    adcode_1: { width: 320, height: 100 },
    adcode_2: { width: 1000, height: 315 },
    adcode_3: { width: 320, height: 100 },
    ingamead: { width: 320, height: 60 },
    yellowboardad: { width: 320, height: 320 },
    redboardad: { width: 320, height: 320 },
  };

  // Load existing ads on component mount
  useEffect(() => {
    fetchAds();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to create cropped image
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = document.createElement("img");
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, fileName) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropComplete = async () => {
    try {
      if (!croppedAreaPixels || !cropImage) return;

      const croppedImage = await getCroppedImg(
        cropImage,
        croppedAreaPixels,
        `cropped-${cropData.adType}-${Date.now()}.jpg`
      );

      if (croppedImage) {
        // Create a new File object from the cropped blob
        const file = new File([croppedImage], croppedImage.name, {
          type: croppedImage.type,
        });

        // Store the ad type and upload settings before clearing state
        const { adType, isMultiple } = cropData;

        // Close cropper and clean up
        setShowCropper(false);
        URL.revokeObjectURL(cropImage); // Clean up object URL
        setCropImage(null);
        setCropData({ adType: null, files: null, isMultiple: false });

        // Upload the cropped image
        await handleImageUpload(adType, [file], isMultiple);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      setError("Failed to crop image");
    }
  };

  const handleFileSelect = (adType, files, isMultiple) => {
    if (!files || files.length === 0) return;

    // Check if this ad type needs cropping
    if (cropDimensions[adType]) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);

      setCropData({ adType, files, isMultiple });
      setCropImage(imageUrl);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      // Upload directly without cropping
      handleImageUpload(adType, files, isMultiple);
    }
  };

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${API_URL}/admin/ads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        if (response.status === 404) {
          // No ads found, continue with empty state
          return;
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch ads");
      }

      setAdImages(data.ads || adImages);
      setSocialLinks(data.ads?.socialLinks || socialLinks);
    } catch (err) {
      console.error("Error fetching ads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (adType, files, isMultiple = false) => {
    try {
      setError(null);
      setUploading((prev) => ({ ...prev, [adType]: true }));

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const formData = new FormData();
      formData.append("adType", adType);

      // Choose the correct endpoint based on whether it's multiple or single upload
      const endpoint = isMultiple ? "upload-multiple" : "upload";

      if (isMultiple) {
        Array.from(files).forEach((file) => {
          formData.append("images", file);
        });
      } else {
        formData.append("image", files[0]);
      }

      const response = await fetch(`${API_URL}/admin/ads/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      if (isMultiple) {
        setAdImages((prev) => ({
          ...prev,
          [adType]: [...prev[adType], ...data.uploadedImages],
        }));
      } else {
        setAdImages((prev) => ({
          ...prev,
          [adType]: data.uploadedImage,
        }));
      }

      setSuccess(`${adType} image(s) uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.message);
    } finally {
      setUploading((prev) => ({ ...prev, [adType]: false }));
    }
  };

  const handleImageDelete = async (adType, imageIndex = null) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${API_URL}/admin/ads/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adType,
          imageIndex,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      // Update local state
      if (imageIndex !== null) {
        // Delete specific image from array
        setAdImages((prev) => ({
          ...prev,
          [adType]: prev[adType].filter((_, index) => index !== imageIndex),
        }));
      } else {
        // Delete single image
        setAdImages((prev) => ({
          ...prev,
          [adType]: null,
        }));
      }

      setSuccess(`${adType} image deleted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting image:", err);
      setError(err.message);
    }
  };

  const handleSocialLinksUpdate = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${API_URL}/admin/ads/social-links`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ socialLinks }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }

      setSuccess("Social links updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating social links:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${API_URL}/admin/ads/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ads: adImages }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }

      setSuccess("All ads saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving ads:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderImageUpload = (adType, label, isMultiple = false) => {
    const currentImages = adImages[adType];
    const isArray = Array.isArray(currentImages);

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <div className="flex items-center gap-2">
            {cropDimensions[adType] && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Crop className="w-3 h-3 mr-1" />
                {cropDimensions[adType].width}×{cropDimensions[adType].height}px
              </span>
            )}
            <span className="text-sm text-gray-500">
              {isMultiple ? "Multiple images" : "Single image"}
            </span>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            uploading[adType]
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            id={`upload-${adType}`}
            multiple={isMultiple}
            accept="image/*"
            onChange={(e) =>
              handleFileSelect(adType, e.target.files, isMultiple)
            }
            className="hidden"
            disabled={uploading[adType]}
          />
          <label
            htmlFor={`upload-${adType}`}
            className={`flex flex-col items-center ${
              uploading[adType]
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            {uploading[adType] ? (
              <>
                <RefreshCw className="w-8 h-8 text-blue-500 mb-2 animate-spin" />
                <span className="text-sm text-blue-600 font-medium">
                  Uploading...
                </span>
                <span className="text-xs text-blue-500 mt-1">
                  Please wait while your image is being processed
                </span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload {isMultiple ? "images" : "image"} or drag and
                  drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 10MB
                </span>
              </>
            )}
          </label>
        </div>

        {/* Display Current Images */}
        {isArray ? (
          <div className="mt-4">
            {currentImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url || image}
                      alt={`${adType} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleImageDelete(adType, index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No images uploaded yet
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {currentImages ? (
              <div className="relative group">
                <img
                  src={currentImages.url || currentImages}
                  alt={adType}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleImageDelete(adType)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No image uploaded yet
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Image className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Ads and Social Links
            </h1>
            <p className="text-sm text-gray-600">
              Manage advertisement images and social media links
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAds}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Refresh
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Ad Code Sections */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ad Code Images
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderImageUpload("adcode_1", "Ad Code #1", true)}
            {renderImageUpload("adcode_2", "Ad Code #2", true)}
            {renderImageUpload("adcode_3", "Ad Code #3", true)}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Game Board Ads
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderImageUpload("ingamead", "In-Game Ad", false)}
            {renderImageUpload("yellowboardad", "Yellow Board Ad", false)}
            {renderImageUpload("redboardad", "Red Board Ad", false)}
          </div>
        </div>

        {/* Social Links Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Social Media Links
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TikTok */}
              <div>
                <label
                  htmlFor="tiktok"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  TikTok URL
                </label>
                <input
                  type="url"
                  id="tiktok"
                  value={socialLinks.tiktok}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, tiktok: e.target.value })
                  }
                  placeholder="https://tiktok.com/@yourusername"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Instagram */}
              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagram"
                  value={socialLinks.instagram}
                  onChange={(e) =>
                    setSocialLinks({
                      ...socialLinks,
                      instagram: e.target.value,
                    })
                  }
                  placeholder="https://instagram.com/yourusername"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* YouTube */}
              <div>
                <label
                  htmlFor="youtube"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  YouTube URL
                </label>
                <input
                  type="url"
                  id="youtube"
                  value={socialLinks.youtube}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, youtube: e.target.value })
                  }
                  placeholder="https://youtube.com/c/yourchannel"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Telegram */}
              <div className="md:col-span-2">
                <label
                  htmlFor="telegram"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Telegram URL
                </label>
                <input
                  type="url"
                  id="telegram"
                  value={socialLinks.telegram}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, telegram: e.target.value })
                  }
                  placeholder="https://t.me/yourchannel"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Save Social Links Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSocialLinksUpdate}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                {saving ? "Saving..." : "Save Social Links"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropping Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Crop Image - {cropData.adType}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Target: {cropDimensions[cropData.adType]?.width} x{" "}
                  {cropDimensions[cropData.adType]?.height}px
                </span>
                <button
                  onClick={() => {
                    setShowCropper(false);
                    if (cropImage) {
                      URL.revokeObjectURL(cropImage);
                    }
                    setCropImage(null);
                    setCropData({
                      adType: null,
                      files: null,
                      isMultiple: false,
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative w-full h-96 mb-4">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={
                  cropDimensions[cropData.adType]?.width /
                  cropDimensions[cropData.adType]?.height
                }
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
                style={{
                  containerStyle: {
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  },
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600">Zoom:</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-500">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCropper(false);
                    if (cropImage) {
                      URL.revokeObjectURL(cropImage);
                    }
                    setCropImage(null);
                    setCropData({
                      adType: null,
                      files: null,
                      isMultiple: false,
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  <Crop className="w-4 h-4 mr-2 inline" />
                  Crop & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ads;
