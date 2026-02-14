import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Download,
  Shield,
  GraduationCap,
  Award,
  FileCheck,
  Loader2,
} from "lucide-react";

interface Document {
  id: number;
  documentType: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  status: "pending" | "verified" | "rejected" | "expired" | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  issuingAuthority: string | null;
  verifiedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
}

interface DocumentVerificationProps {
  coachId: number;
  applicationId?: number;
  readOnly?: boolean;
}

const documentTypes = [
  { value: "id_proof", label: "Government ID", icon: Shield, description: "Passport, driver's license, or national ID" },
  { value: "degree", label: "University Degree", icon: GraduationCap, description: "Bachelor's, Master's, or PhD diploma" },
  { value: "teaching_cert", label: "Teaching Certificate", icon: Award, description: "TEFL, CELTA, TESOL, or equivalent" },
  { value: "sle_results", label: "SLE Test Results", icon: FileCheck, description: "Official SLE evaluation results" },
  { value: "language_cert", label: "Language Certificate", icon: FileText, description: "DELF, TEF, IELTS, etc." },
  { value: "background_check", label: "Background Check", icon: Shield, description: "Criminal record check (for government clients)" },
  { value: "other", label: "Other Document", icon: FileText, description: "Any other supporting document" },
];

const statusConfig = {
  pending: { color: "yellow", icon: Clock, label: "Pending Review" },
  verified: { color: "green", icon: CheckCircle, label: "Verified" },
  rejected: { color: "red", icon: XCircle, label: "Rejected" },
  expired: { color: "gray", icon: AlertCircle, label: "Expired" },
};

export default function DocumentVerification({ coachId, applicationId, readOnly = false }: DocumentVerificationProps) {
  const [selectedType, setSelectedType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get existing documents
  const { data: documents, refetch: refetchDocuments } = trpc.documents.list.useQuery(
    { coachId },
    { enabled: !!coachId }
  );

  // Upload mutation
  const uploadDocument = trpc.documents.upload.useMutation({
    onSuccess: () => {
      refetchDocuments();
      resetForm();
      setShowUploadForm(false);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // Delete mutation
  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      refetchDocuments();
    },
  });

  const resetForm = () => {
    setSelectedType("");
    setTitle("");
    setDescription("");
    setIssuingAuthority("");
    setIssueDate("");
    setExpiryDate("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF, JPEG, PNG, and WebP files are allowed");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType || !title) {
      alert("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    // Convert file to base64 for upload
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadDocument.mutate({
        coachId,
        applicationId,
        documentType: selectedType as "id_proof" | "degree" | "teaching_cert" | "sle_results" | "language_cert" | "background_check" | "other",
        title,
        description: description || undefined,
        issuingAuthority: issuingAuthority || undefined,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        fileData: base64,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument.mutate({ documentId });
    }
  };

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find(dt => dt.value === type) || documentTypes[documentTypes.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Document Verification
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Upload your credentials for verification
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && !readOnly && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Upload New Document
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Document Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {documentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedType === type.value
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${selectedType === type.value ? "text-teal-600" : "text-gray-400"}`} />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bachelor's Degree in French"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Issuing Authority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issuing Authority
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g., University of Ottawa"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date (if applicable)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add any additional details about this document..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-teal-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, JPEG, PNG, or WebP (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                resetForm();
                setShowUploadForm(false);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !selectedType || !title}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents && documents.length > 0 ? (
          documents.map((doc: any) => {
            const typeInfo = getDocumentTypeInfo(doc.documentType);
            const status = statusConfig[doc.status || "pending"];
            const StatusIcon = status.icon;
            const TypeIcon = typeInfo.icon;

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-start gap-4"
              >
                {/* Type Icon */}
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TypeIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{doc.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{typeInfo.label}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 dark:bg-${status.color}-900/30 text-${status.color}-700 dark:text-${status.color}-300`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  {doc.issuingAuthority && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Issued by: {doc.issuingAuthority}
                    </p>
                  )}

                  {doc.rejectionReason && doc.status === "rejected" && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Rejection reason:</strong> {doc.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={doc.fileUrl}
                      download={doc.fileName}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    {!readOnly && doc.status !== "verified" && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-xl">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">No Documents Yet</h4>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Upload your credentials to get verified
            </p>
          </div>
        )}
      </div>

      {/* Verification Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Document Verification Process
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Our team reviews all documents within 2-3 business days. Verified coaches receive a 
              "Verified" badge on their profile and may qualify for reduced commission rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
