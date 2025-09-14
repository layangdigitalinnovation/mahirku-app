import React, { useState } from "react";
import {
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  Brain,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/DataTable";
import { createThinkingStyleColumns } from "@/components/table/columns/thinkingStyleColumn";
import {
  useGetAllThinkingStyles,
  useGetThinkingStyleStats,
  useCreateThinkingStyle,
  useUpdateThinkingStyle,
  useDeleteThinkingStyle,
  useRestoreThinkingStyle,
  useBulkUpdateThinkingStyles,
} from "@/hooks/useThinkingStylesAdmin";
import {
  ThinkingStyle,
  CreateThinkingStylePayload,
  UpdateThinkingStylePayload,
} from "@/services/api/thinkingStylesAdmin";

const ThinkingStylesManagement = () => {
  // Backend hooks
  const { data: thinkingStylesData, isLoading } = useGetAllThinkingStyles();
  const { data: statistics } = useGetThinkingStyleStats();
  const createMutation = useCreateThinkingStyle();
  const updateMutation = useUpdateThinkingStyle();
  const deleteMutation = useDeleteThinkingStyle();
  const restoreMutation = useRestoreThinkingStyle();
  const bulkUpdateMutation = useBulkUpdateThinkingStyles();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "create" | "edit" | "view" | "bulk"
  >("create");
  const [currentStyle, setCurrentStyle] = useState<ThinkingStyle | null>(null);
  const [bulkUpdates, setBulkUpdates] = useState<UpdateThinkingStylePayload[]>(
    []
  );

  // Form state
  const [formData, setFormData] = useState<CreateThinkingStylePayload>({
    digit: 0,
    type: "",
    code: "",
    description: "",
    theory: "",
    isActive: true,
  });

  const thinkingStyles = thinkingStylesData?.data.thinkingStyles || [];

  // Helper functions
  const resetForm = () => {
    setFormData({
      digit: 0,
      type: "",
      code: "",
      description: "",
      theory: "",
      isActive: true,
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStyle(null);
    resetForm();
  };

  const openModal = (
    type: "create" | "edit" | "view" | "bulk",
    style: ThinkingStyle | null = null
  ) => {
    setModalType(type);
    setCurrentStyle(style);
    setShowModal(true);

    if (type === "edit" && style) {
      setFormData({
        digit: style.digit,
        type: style.type,
        code: style.code,
        description: style.description,
        theory: style.theory,
        isActive: style.isActive,
      });
    } else if (type === "create") {
      resetForm();
    } else if (type === "bulk") {
      setBulkUpdates(
        thinkingStyles.map((style) => ({
          id: style.id,
          digit: style.digit,
          type: style.type,
          code: style.code,
          description: style.description,
          theory: style.theory,
          isActive: style.isActive,
        }))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === "create") {
      createMutation.mutate(formData, {
        onSuccess: () => {
          closeModal();
        },
      });
    } else if (modalType === "edit" && currentStyle) {
      updateMutation.mutate(
        { id: currentStyle.id, payload: formData },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkUpdates.length) return;

    const validUpdates = bulkUpdates.filter(
      (update) =>
        update.type &&
        update.code &&
        update.digit &&
        update.description &&
        update.theory &&
        update.isActive &&
        update.id !== undefined
    );

    bulkUpdateMutation.mutate(
      { updates: validUpdates as UpdateThinkingStylePayload[] },
      {
        onSuccess: () => {
          closeModal();
        },
      }
    );
  };

  const handleDelete = async (styleId: number) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan thinking style ini?")) {
      deleteMutation.mutate(styleId);
    }
  };

  const handleRestore = async (styleId: number) => {
    restoreMutation.mutate(styleId);
  };

  // Create columns with action handlers
  const columns = createThinkingStyleColumns({
    onView: (style) => openModal("view", style),
    onEdit: (style) => openModal("edit", style),
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  const getDigitBadge = (digit: number) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-orange-100 text-orange-800",
      "bg-yellow-100 text-yellow-800",
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800",
      "bg-indigo-100 text-indigo-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-gray-100 text-gray-800",
    ];

    const colorClass = colors[digit - 1] || "bg-gray-100 text-gray-800";

    return (
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${colorClass}`}
      >
        {digit}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="container w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thinking Styles Management
              </h1>
              <p className="text-gray-600">
                Kelola thinking styles untuk sistem assessment
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openModal("bulk")}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Pembaruan Massal
              </button>
              <button
                onClick={() => openModal("create")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Gaya Baru
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Styles
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics?.data?.summary?.total || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Styles
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics?.data?.summary?.active || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Inactive Styles
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics?.data?.summary?.inactive || 0}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Thinking Styles Table */}
        <DataTable
          columns={columns}
          data={thinkingStyles}
          searchKey="type"
          showPagination={true}
          isLoading={isLoading}
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={showModal && (modalType === "create" || modalType === "edit")}
        onOpenChange={closeModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalType === "create"
                ? "Tambah Gaya Berpikir Baru"
                : "Ubah Gaya Berpikir"}
            </DialogTitle>
            <DialogDescription>
              {modalType === "create"
                ? "Buat gaya berpikir baru dengan detail di bawah ini."
                : "Perbarui informasi gaya berpikir."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digit *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="9"
                  value={formData.digit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      digit: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <Input
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theory *
              </label>
              <Textarea
                value={formData.theory}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, theory: e.target.value }))
                }
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {modalType === "create" ? "Buat" : "Perbarui"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog
        open={showModal && modalType === "view"}
        onOpenChange={closeModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thinking Style Details</DialogTitle>
            <DialogDescription>
              View detailed information about this thinking style.
            </DialogDescription>
          </DialogHeader>

          {currentStyle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Digit:</span>
                  <div className="mt-1">
                    {getDigitBadge(currentStyle.digit)}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Code:</span>
                  <p className="text-gray-900 mt-1">{currentStyle.code}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-500">Type:</span>
                  <p className="text-gray-900 mt-1 text-lg font-semibold">
                    {currentStyle.type}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-500">
                    Description:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {currentStyle.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-500">Theory:</span>
                  <p className="text-gray-900 mt-1">{currentStyle.theory}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <div className="mt-1">
                    <Badge
                      variant={
                        currentStyle.isActive ? "default" : "destructive"
                      }
                    >
                      {currentStyle.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <p className="text-gray-900 mt-1">
                    {new Date(currentStyle.createdAt).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Modal */}
      <Dialog
        open={showModal && modalType === "bulk"}
        onOpenChange={closeModal}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pembaruan Massal Gaya Berpikir</DialogTitle>
            <DialogDescription>
              Perbarui beberapa gaya berpikir sekaligus. Anda dapat mengubah
              status dan informasi dasar untuk setiap gaya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {bulkUpdates.map((update, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getDigitBadge(update.digit as number)}
                      <span className="font-medium text-gray-900">
                        {update.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({update.code})
                      </span>
                    </div>
                    <Button
                      variant={update.isActive ? "default" : "destructive"}
                      size="sm"
                      onClick={() => {
                        const updatedBulk = [...bulkUpdates];
                        updatedBulk[index].isActive =
                          !updatedBulk[index].isActive;
                        setBulkUpdates(updatedBulk);
                      }}
                    >
                      {update.isActive ? (
                        <ToggleRight className="w-4 h-4 mr-2" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 mr-2" />
                      )}
                      {update.isActive ? "Active" : "Inactive"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Type
                      </label>
                      <Input
                        value={update.type}
                        onChange={(e) => {
                          const updatedBulk = [...bulkUpdates];
                          updatedBulk[index].type = e.target.value;
                          setBulkUpdates(updatedBulk);
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Code
                      </label>
                      <Input
                        value={update.code}
                        onChange={(e) => {
                          const updatedBulk = [...bulkUpdates];
                          updatedBulk[index].code = e.target.value;
                          setBulkUpdates(updatedBulk);
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Batal
            </Button>
            <Button onClick={handleBulkUpdate}>
              <Save className="w-4 h-4 mr-2" />
              Terapkan Pembaruan Massal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThinkingStylesManagement;
