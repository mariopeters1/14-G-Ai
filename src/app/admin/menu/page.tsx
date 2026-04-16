"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  X,
  Trash2,
  DollarSign,
  UtensilsCrossed,
  Salad,
  Cookie,
  ChefHat,
  Search,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface Modifier {
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: { src: string; hint?: string };
  modifiers: Modifier[];
  available: boolean;
}

interface MenuData {
  appetizers: MenuItem[];
  mainCourses: MenuItem[];
  desserts: MenuItem[];
}

type MenuCategoryKey = keyof MenuData;

// ─── Initial Data ───────────────────────────────────────────────

const initialMenuData: MenuData = {
  appetizers: [
    {
      id: "app1",
      name: "Gator Bites",
      description: "Crispy fried alligator tail served with a zesty datil pepper aioli. A true taste of Florida.",
      price: 18.0,
      image: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FGator_Bites_with.jpeg?alt=media&token=608f7f95-9e53-45ab-a340-00165eeec108", hint: "gator bites" },
      modifiers: [{ name: "Extra Aioli", price: 1.5 }, { name: "Make it Spicy", price: 1.0 }],
      available: true,
    },
    {
      id: "app2",
      name: "Key West Conch Fritters",
      description: "Golden brown and delicious fritters packed with fresh conch, served with a lime-mustard sauce.",
      price: 16.0,
      image: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FConch%20fritters.jpeg?alt=media&token=6856c76e-870f-4567-aa3e-3745a3810bc0", hint: "conch fritters" },
      modifiers: [],
      available: true,
    },
  ],
  mainCourses: [
    {
      id: "main1",
      name: "Pan-Seared Gulf Snapper",
      description: "Locally sourced snapper with a citrus butter sauce, served over coconut-infused rice and seasonal vegetables.",
      price: 38.0,
      image: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FPan-Seared%20Gulf%20Snapper.jpeg?alt=media&token=c10ec2b2-a659-4f34-a26f-9c2fe46c812c", hint: "seared snapper" },
      modifiers: [{ name: "Add Grilled Shrimp", price: 12.0 }, { name: "Blackened Seasoning", price: 2.0 }],
      available: true,
    },
    {
      id: "main2",
      name: "Floridian Skirt Steak",
      description: "Marinated in sour orange and fresh herbs, this grilled skirt steak is served with yucca fries and chimichurri.",
      price: 42.0,
      image: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FFloridian%20Skirt%20Steak.jpeg?alt=media&token=2fb45026-429b-4a89-91cb-e7d5268fbd05", hint: "skirt steak" },
      modifiers: [{ name: "Add Blue Cheese", price: 4.0 }, { name: "Sautéed Onions", price: 3.0 }],
      available: true,
    },
  ],
  desserts: [
    {
      id: "des1",
      name: "Key Lime Pie",
      description: "An iconic Florida dessert. Tangy, sweet, and creamy with a graham cracker crust and whipped cream.",
      price: 12.0,
      image: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FKey%20Lime%20Pie.jpeg?alt=media&token=bedfa68c-0441-4370-82be-ef0d0666197a", hint: "key lime pie" },
      modifiers: [],
      available: true,
    },
  ],
};

const categoryLabels: Record<MenuCategoryKey, { label: string; icon: React.ReactNode }> = {
  appetizers: { label: "Appetizers", icon: <Salad className="w-5 h-5" /> },
  mainCourses: { label: "Main Courses", icon: <UtensilsCrossed className="w-5 h-5" /> },
  desserts: { label: "Desserts", icon: <Cookie className="w-5 h-5" /> },
};

// ─── Component ──────────────────────────────────────────────────

export default function MenuManagementPage() {
  const [menuData, setMenuData] = useState<MenuData>(initialMenuData);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MenuCategoryKey | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(MenuItem & { category: MenuCategoryKey }) | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formCategory, setFormCategory] = useState<MenuCategoryKey>("appetizers");
  const [formModifiers, setFormModifiers] = useState<Modifier[]>([]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // ─── Computed ─────────────────────────────────────────────

  const allItems = [
    ...menuData.appetizers.map((i) => ({ ...i, category: "appetizers" as MenuCategoryKey })),
    ...menuData.mainCourses.map((i) => ({ ...i, category: "mainCourses" as MenuCategoryKey })),
    ...menuData.desserts.map((i) => ({ ...i, category: "desserts" as MenuCategoryKey })),
  ];

  const filtered = allItems.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalItems = allItems.length;
  const avgPrice = allItems.reduce((s, i) => s + i.price, 0) / totalItems;
  const totalModifiers = allItems.reduce((s, i) => s + i.modifiers.length, 0);
  const availableCount = allItems.filter((i) => i.available).length;

  // ─── Form Handlers ────────────────────────────────────────

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormImage("");
    setFormCategory("appetizers");
    setFormModifiers([]);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (item: MenuItem & { category: MenuCategoryKey }) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormPrice(item.price.toString());
    setFormImage(item.image.src);
    setFormCategory(item.category);
    setFormModifiers([...item.modifiers]);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, category: MenuCategoryKey) => {
    setMenuData((prev) => ({
      ...prev,
      [category]: prev[category].filter((i) => i.id !== id),
    }));
    showToast("Item deleted.");
  };

  const toggleAvailability = (id: string, category: MenuCategoryKey) => {
    setMenuData((prev) => ({
      ...prev,
      [category]: prev[category].map((i) => (i.id === id ? { ...i, available: !i.available } : i)),
    }));
  };

  const addModifier = () => {
    setFormModifiers([...formModifiers, { name: "", price: 0 }]);
  };

  const removeModifier = (index: number) => {
    setFormModifiers(formModifiers.filter((_, i) => i !== index));
  };

  const updateModifier = (index: number, field: "name" | "price", value: string) => {
    const updated = [...formModifiers];
    if (field === "name") updated[index].name = value;
    else updated[index].price = parseFloat(value) || 0;
    setFormModifiers(updated);
  };

  const handleSave = () => {
    if (!formName.trim() || !formPrice) {
      showToast("Name and price are required.", "warning");
      return;
    }

    const newItem: MenuItem = {
      id: editingItem?.id || `item-${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim(),
      price: parseFloat(formPrice),
      image: { src: formImage || "https://placehold.co/600x400/1F1F28/555?text=No+Image" },
      modifiers: formModifiers.filter((m) => m.name.trim()),
      available: editingItem?.available ?? true,
    };

    setMenuData((prev) => {
      const updated = { ...prev };

      // If editing, remove from old category
      if (editingItem) {
        updated[editingItem.category] = updated[editingItem.category].filter((i) => i.id !== editingItem.id);
      }

      updated[formCategory] = [...updated[formCategory], newItem].sort((a, b) => a.name.localeCompare(b.name));
      return updated;
    });

    showToast(editingItem ? `"${formName}" updated.` : `"${formName}" added to menu.`);
    setIsFormOpen(false);
    resetForm();
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
          toastType === "success" ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
            : toastType === "warning" ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
            : "bg-white/10 text-white border-white/20"
        }`}>
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle2 className="w-4 h-4" />}
            {toastType === "warning" && <AlertCircle className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Menu Editor</h1>
          <p className="text-neutral-400 mt-2">Floridian Modern Cuisine — manage items, pricing, modifiers, and availability.</p>
        </div>
        <button onClick={handleAddNew} className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Items", value: totalItems.toString(), icon: <UtensilsCrossed className="w-5 h-5" />, color: "text-white", bg: "bg-white/5" },
          { label: "Avg Price", value: `$${avgPrice.toFixed(0)}`, icon: <DollarSign className="w-5 h-5" />, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          { label: "Modifiers", value: totalModifiers.toString(), icon: <Tag className="w-5 h-5" />, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
          { label: "Available", value: `${availableCount}/${totalItems}`, icon: <Eye className="w-5 h-5" />, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-5">
            <div className={`${kpi.bg} ${kpi.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>{kpi.icon}</div>
            <div className="text-2xl font-light text-white font-mono">{kpi.value}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar: Search + Category Filter */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full bg-[#111116] border border-[#1F1F28] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
              activeCategory === "all" ? "bg-white/10 text-white border-white/20" : "bg-[#111116] text-neutral-500 border-[#1F1F28] hover:text-white"
            }`}
          >
            All
          </button>
          {(Object.keys(categoryLabels) as MenuCategoryKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                activeCategory === key ? "bg-white/10 text-white border-white/20" : "bg-[#111116] text-neutral-500 border-[#1F1F28] hover:text-white"
              }`}
            >
              {categoryLabels[key].icon} {categoryLabels[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-[#111116] border rounded-2xl overflow-hidden transition-all group hover:border-[#3D3D4A] ${
              !item.available ? "opacity-50 border-[#1F1F28]" : "border-[#1F1F28]"
            }`}
          >
            {/* Image */}
            <div className="relative aspect-video overflow-hidden">
              {item.image.src && !item.image.src.includes("placehold") ? (
                <img src={item.image.src} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1F1F28] flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-neutral-600" />
                </div>
              )}
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => toggleAvailability(item.id, item.category)}
                  className="p-2.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                  title={item.available ? "Mark Unavailable" : "Mark Available"}
                >
                  {item.available ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.category)}
                  className="p-2.5 bg-[#EF4444]/20 backdrop-blur-sm rounded-lg hover:bg-[#EF4444]/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[10px] text-white font-medium border border-white/10">
                  {categoryLabels[item.category].label}
                </span>
              </div>
              {/* Availability Badge */}
              {!item.available && (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-[#EF4444]/20 backdrop-blur-sm rounded-lg text-[10px] text-[#EF4444] font-medium border border-[#EF4444]/20">
                    86&apos;d
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">{item.name}</h3>
                <span className="text-[#10B981] font-mono text-lg font-light">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-2">{item.description}</p>

              {/* Modifiers */}
              {item.modifiers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.modifiers.map((mod) => (
                    <span key={mod.name} className="px-2 py-0.5 bg-[#1F1F28] text-neutral-400 text-[10px] rounded-md border border-[#2D2D3A]">
                      {mod.name} <span className="text-[#F59E0B]">+${mod.price.toFixed(2)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button
          onClick={handleAddNew}
          className="border-2 border-dashed border-[#2D2D3A] rounded-2xl flex flex-col items-center justify-center min-h-[300px] hover:border-[#3D3D4A] hover:bg-[#111116]/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-3 group-hover:bg-[#2A2A36] transition-colors">
            <PlusCircle className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm text-neutral-500 group-hover:text-white transition-colors">Add New Item</span>
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-[#111116] border border-dashed border-[#2D2D3A] rounded-2xl p-12 text-center mt-4">
          <UtensilsCrossed className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No menu items match your filters.</p>
        </div>
      )}

      {/* ─── Edit/Add Modal ───────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsFormOpen(false); resetForm(); }} />
          <div className="relative bg-[#111116] border border-[#1F1F28] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-white">
                  {editingItem ? `Edit "${editingItem.name}"` : "Add New Menu Item"}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {editingItem ? "Update the details below." : "Fill in the details for a new menu item."}
                </p>
              </div>
              <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Item Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pan-Seared Grouper"
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the dish..."
                  rows={3}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500"
                />
              </div>

              {/* Price + Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Price ($) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Category *</label>
                  <div className="relative">
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as MenuCategoryKey)}
                      className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer"
                    >
                      <option value="appetizers">Appetizers</option>
                      <option value="mainCourses">Main Courses</option>
                      <option value="desserts">Desserts</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                />
                {formImage && !formImage.includes("placehold") && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-[#2D2D3A] h-32">
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>

              {/* Modifiers */}
              <div className="border-t border-[#1F1F28] pt-5">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Modifiers
                  </label>
                  <button onClick={addModifier} className="px-3 py-1.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-neutral-400 hover:text-white rounded-lg text-xs border border-[#2D2D3A] transition-colors flex items-center gap-1">
                    <PlusCircle className="w-3 h-3" /> Add
                  </button>
                </div>
                {formModifiers.length === 0 && (
                  <p className="text-xs text-neutral-600 text-center py-4 border border-dashed border-[#2D2D3A] rounded-lg">No modifiers added.</p>
                )}
                <div className="space-y-2">
                  {formModifiers.map((mod, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mod.name}
                        onChange={(e) => updateModifier(i, "name", e.target.value)}
                        placeholder="Modifier name"
                        className="flex-1 bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                      />
                      <div className="relative w-24">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500" />
                        <input
                          type="number"
                          step="0.01"
                          value={mod.price || ""}
                          onChange={(e) => updateModifier(i, "price", e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                        />
                      </div>
                      <button onClick={() => removeModifier(i)} className="p-2 hover:bg-[#EF4444]/10 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-neutral-500 hover:text-[#EF4444]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#1F1F28] bg-[#0D0D12] flex justify-end gap-3">
              <button
                onClick={() => { setIsFormOpen(false); resetForm(); }}
                className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-neutral-400 rounded-lg transition-colors text-sm border border-[#2D2D3A]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {editingItem ? "Update Item" : "Add to Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
