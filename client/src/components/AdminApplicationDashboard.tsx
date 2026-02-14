import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import {
  Search,
  Filter,
  ChevronDown,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader,
  Eye,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: number;
  userId: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  teachingLanguage: string;
  yearsTeaching?: number;
  createdAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export function AdminApplicationDashboard() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'firstName' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedApplications, setSelectedApplications] = useState<Set<number>>(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [bulkNotes, setBulkNotes] = useState('');

  // API calls - use type assertions for new endpoints
  const { data: stats } = (trpc.admin as any).getApplicationStats?.useQuery?.() || { data: null };
  const { data: applicationsData, isLoading, refetch } = (trpc.admin as any).getApplicationsForDashboard?.useQuery?.(
    {
      status: statusFilter as any,
      language: languageFilter as any,
      search: searchTerm,
      sortBy,
      sortOrder,
      limit: 100,
    },
    { enabled: true }
  ) || { data: null, isLoading: false, refetch: async () => {} };

  const bulkApproveMutation = (trpc.admin as any).bulkApproveApplications?.useMutation?.() || { mutateAsync: async () => {} };
  const bulkRejectMutation = (trpc.admin as any).bulkRejectApplications?.useMutation?.() || { mutateAsync: async () => {} };
  const approveMutation = trpc.admin.approveCoachApplication.useMutation();
  const rejectMutation = trpc.admin.rejectCoachApplication.useMutation();

  // Labels
  const labels = {
    en: {
      title: 'Coach Applications',
      subtitle: 'Manage and review pending coach applications',
      stats: 'Statistics',
      total: 'Total',
      submitted: 'Submitted',
      underReview: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      filters: 'Filters',
      status: 'Status',
      language: 'Language',
      search: 'Search applications...',
      sortBy: 'Sort By',
      date: 'Date',
      name: 'Name',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      view: 'View Details',
      selectAll: 'Select All',
      selected: 'Selected',
      bulkApprove: 'Approve Selected',
      bulkReject: 'Reject Selected',
      applicationName: 'Name',
      applicationEmail: 'Email',
      applicationLanguage: 'Language',
      applicationYears: 'Years',
      applicationStatus: 'Status',
      applicationDate: 'Applied',
      noResults: 'No applications found',
      confirmBulkApprove: 'Approve all selected applications?',
      confirmBulkReject: 'Reject all selected applications?',
      rejectReason: 'Rejection Reason',
      approveNotes: 'Approval Notes (optional)',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
    fr: {
      title: 'Candidatures de Coach',
      subtitle: 'Gérer et examiner les candidatures de coach en attente',
      stats: 'Statistiques',
      total: 'Total',
      submitted: 'Soumis',
      underReview: 'En examen',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      filters: 'Filtres',
      status: 'Statut',
      language: 'Langue',
      search: 'Rechercher les candidatures...',
      sortBy: 'Trier par',
      date: 'Date',
      name: 'Nom',
      actions: 'Actions',
      approve: 'Approuver',
      reject: 'Rejeter',
      view: 'Voir les détails',
      selectAll: 'Sélectionner tout',
      selected: 'Sélectionné',
      bulkApprove: 'Approuver la sélection',
      bulkReject: 'Rejeter la sélection',
      applicationName: 'Nom',
      applicationEmail: 'Email',
      applicationLanguage: 'Langue',
      applicationYears: 'Années',
      applicationStatus: 'Statut',
      applicationDate: 'Candidature',
      noResults: 'Aucune candidature trouvée',
      confirmBulkApprove: 'Approuver toutes les candidatures sélectionnées?',
      confirmBulkReject: 'Rejeter toutes les candidatures sélectionnées?',
      rejectReason: 'Raison du rejet',
      approveNotes: 'Notes d\'approbation (optionnel)',
      cancel: 'Annuler',
      confirm: 'Confirmer',
    },
  };

  const l = labels[language];

  const applications: Application[] = (applicationsData as any)?.applications || [];

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'under_review':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleApplicationSelection = (id: number) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedApplications(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedApplications.size === applications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(applications.map((a: Application) => a.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApplications.size === 0) return;
    try {
      await bulkApproveMutation.mutateAsync({
        applicationIds: Array.from(selectedApplications),
        notes: bulkNotes,
      });
      setSelectedApplications(new Set());
      setBulkNotes('');
      setBulkAction(null);
      refetch();
    } catch (error) {
      console.error('Bulk approve failed:', error);
    }
  };

  const handleBulkReject = async () => {
    if (selectedApplications.size === 0 || !bulkNotes) return;
    try {
      await bulkRejectMutation.mutateAsync({
        applicationIds: Array.from(selectedApplications),
        reason: bulkNotes,
      });
      setSelectedApplications(new Set());
      setBulkNotes('');
      setBulkAction(null);
      refetch();
    } catch (error) {
      console.error('Bulk reject failed:', error);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(isEn ? 'en-CA' : 'fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{l.title}</h1>
        <p className="text-slate-600 dark:text-slate-400">{l.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{l.total}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{l.submitted}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.underReview}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{l.underReview}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{l.approved}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{l.rejected}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {l.filters}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={l.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">{l.status}: All</option>
              <option value="submitted">{l.submitted}</option>
              <option value="under_review">{l.underReview}</option>
              <option value="approved">{l.approved}</option>
              <option value="rejected">{l.rejected}</option>
            </select>

            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">{l.language}: All</option>
              <option value="french">French</option>
              <option value="english">English</option>
              <option value="both">Both</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="createdAt">{l.sortBy}: {l.date}</option>
              <option value="firstName">{l.sortBy}: {l.name}</option>
              <option value="status">{l.sortBy}: {l.status}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedApplications.size > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {selectedApplications.size} {l.selected}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setBulkAction('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {l.bulkApprove}
                </Button>
                <Button
                  onClick={() => setBulkAction('reject')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  {l.bulkReject}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              {l.noResults}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4">
                      <button onClick={toggleAllSelection}>
                        {selectedApplications.size === applications.length ? (
                          <CheckSquare className="w-5 h-5 text-teal-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {l.applicationName}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {l.applicationEmail}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {l.applicationLanguage}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {l.applicationStatus}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {l.applicationDate}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {l.actions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app: Application) => (
                    <tr key={app.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800">
                      <td className="py-3 px-4">
                        <button onClick={() => toggleApplicationSelection(app.id)}>
                          {selectedApplications.has(app.id) ? (
                            <CheckSquare className="w-5 h-5 text-teal-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {app.fullName || `${app.firstName} ${app.lastName}`}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                        {app.email}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                        {app.teachingLanguage}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1">{app.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                        {formatDate(new Date(app.createdAt))}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {app.status === 'submitted' || app.status === 'under_review' ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  approveMutation.mutate({ applicationId: app.id });
                                  refetch();
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                  const reason = prompt('Rejection reason:');
                                  if (reason) {
                                    rejectMutation.mutate({ applicationId: app.id, reason });
                                    refetch();
                                  }
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Modal */}
      {bulkAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {bulkAction === 'approve' ? l.bulkApprove : l.bulkReject}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder={bulkAction === 'approve' ? l.approveNotes : l.rejectReason}
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBulkAction(null);
                    setBulkNotes('');
                  }}
                >
                  {l.cancel}
                </Button>
                <Button
                  className={bulkAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  onClick={bulkAction === 'approve' ? handleBulkApprove : handleBulkReject}
                >
                  {l.confirm}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
