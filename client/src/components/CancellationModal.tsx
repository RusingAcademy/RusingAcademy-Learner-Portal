import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, DollarSign, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: number;
    coachName: string;
    date: string; // Date string in format YYYY-MM-DD
    time: string;
    duration?: number;
    price: number;
    stripePaymentId?: string;
  };
  onCancelled: () => void;
}

export function CancellationModal({ isOpen, onClose, session, onCancelled }: CancellationModalProps) {
  const { language } = useLanguage();
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const cancelMutation = trpc.learner.cancelSession.useMutation({
    onSuccess: (data: { refundAmount: number }) => {
      toast.success(
        data.refundAmount > 0 
          ? labels.refundSuccess.replace("{amount}", `$${(data.refundAmount / 100).toFixed(2)}`)
          : labels.cancelledNoRefund
      );
      onCancelled();
      onClose();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
      setIsProcessing(false);
    },
  });

  const labels = language === "fr" ? {
    title: "Annuler la session",
    description: "Êtes-vous sûr de vouloir annuler cette session ?",
    coachLabel: "Coach",
    dateLabel: "Date",
    timeLabel: "Heure",
    priceLabel: "Prix payé",
    reasonLabel: "Raison de l'annulation (optionnel)",
    reasonPlaceholder: "Expliquez pourquoi vous annulez cette session...",
    policyTitle: "Politique d'annulation",
    policy24h: "Annulation 24h+ avant : Remboursement complet",
    policyLess24h: "Annulation moins de 24h : Pas de remboursement",
    refundEligible: "Vous êtes éligible à un remboursement complet",
    noRefund: "Aucun remboursement (moins de 24h avant la session)",
    cancelButton: "Annuler la session",
    keepButton: "Garder la session",
    processing: "Traitement en cours...",
    successTitle: "Session annulée",
    refundSuccess: "Votre remboursement de {amount} sera traité dans 5-10 jours ouvrables.",
    cancelledNoRefund: "La session a été annulée. Aucun remboursement n'est applicable.",
    errorTitle: "Erreur",
  } : {
    title: "Cancel Session",
    description: "Are you sure you want to cancel this session?",
    coachLabel: "Coach",
    dateLabel: "Date",
    timeLabel: "Time",
    priceLabel: "Price Paid",
    reasonLabel: "Reason for cancellation (optional)",
    reasonPlaceholder: "Explain why you're cancelling this session...",
    policyTitle: "Cancellation Policy",
    policy24h: "Cancel 24h+ before: Full refund",
    policyLess24h: "Cancel less than 24h: No refund",
    refundEligible: "You are eligible for a full refund",
    noRefund: "No refund (less than 24h before session)",
    cancelButton: "Cancel Session",
    keepButton: "Keep Session",
    processing: "Processing...",
    successTitle: "Session Cancelled",
    refundSuccess: "Your refund of {amount} will be processed within 5-10 business days.",
    cancelledNoRefund: "The session has been cancelled. No refund is applicable.",
    errorTitle: "Error",
  };

  // Check if session is more than 24 hours away
  const sessionDateTime = new Date(session.date);
  const hoursUntilSession = (sessionDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const isRefundEligible = hoursUntilSession >= 24;

  const handleCancel = async () => {
    setIsProcessing(true);
    cancelMutation.mutate({
      sessionId: session.id,
      reason: reason || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {labels.title}
          </DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session Details */}
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{labels.coachLabel}:</span>
              <span className="font-medium">{session.coachName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{labels.dateLabel}:</span>
              <span className="font-medium">
                {sessionDateTime.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{labels.timeLabel}:</span>
              <span className="font-medium">{session.time} ({session.duration} min)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{labels.priceLabel}:</span>
              <span className="font-medium">${session.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className={`rounded-lg p-4 ${isRefundEligible ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              {labels.policyTitle}
            </h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• {labels.policy24h}</li>
              <li>• {labels.policyLess24h}</li>
            </ul>
            <div className={`mt-3 flex items-center gap-2 font-medium ${isRefundEligible ? "text-green-700" : "text-yellow-700"}`}>
              <DollarSign className="h-4 w-4" />
              {isRefundEligible ? labels.refundEligible : labels.noRefund}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">{labels.reasonLabel}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={labels.reasonPlaceholder}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            {labels.keepButton}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">⏳</span>
                {labels.processing}
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                {labels.cancelButton}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
