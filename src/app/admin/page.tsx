"use client";

import { useState } from "react";
import { NIGERIAN_STATES } from "@/data/states";
import { 
  Shield, 
  Plus, 
  Check, 
  AlertTriangle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

const INCIDENT_TYPES = [
  { value: "KIDNAPPING", label: "Kidnapping", color: "red" },
  { value: "BANDITRY", label: "Banditry", color: "orange" },
  { value: "TERRORISM", label: "Terrorism", color: "gray" },
  { value: "ARMED_ROBBERY", label: "Armed Robbery", color: "purple" },
  { value: "OTHER", label: "Other", color: "gray" },
];

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: "KIDNAPPING",
    state: "",
    lga: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    title: "",
    description: "",
    killed: 0,
    kidnapped: 0,
    rescued: 0,
    injured: 0,
    sourceUrl: "",
    sourceName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create incident");
      }

      setSuccess(true);
      // Reset form
      setFormData({
        type: "KIDNAPPING",
        state: "",
        lga: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
        title: "",
        description: "",
        killed: 0,
        kidnapped: 0,
        rescued: 0,
        injured: 0,
        sourceUrl: "",
        sourceName: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-500">Add security incident</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Incident Report
            </h2>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Incident Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INCIDENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      formData.type === type.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* LGA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LGA (optional)
              </label>
              <input
                type="text"
                value={formData.lga}
                onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                placeholder="e.g., Ikeja"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Brief description of incident"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional details..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Casualties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Casualties
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Killed</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.killed}
                    onChange={(e) => setFormData({ ...formData, killed: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Kidnapped</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.kidnapped}
                    onChange={(e) => setFormData({ ...formData, kidnapped: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Rescued</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rescued}
                    onChange={(e) => setFormData({ ...formData, rescued: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Injured</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.injured}
                    onChange={(e) => setFormData({ ...formData, injured: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  value={formData.sourceName}
                  onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                  placeholder="e.g., Punch"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source URL
                </label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Error/Success */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
              <Check className="w-5 h-5" />
              Incident reported successfully!
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Report Incident
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
