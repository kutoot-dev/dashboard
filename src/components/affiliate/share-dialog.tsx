import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { buildAffiliateShareMessage } from "@/lib/utils/affiliate";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string | null;
  referralLink: string | null;
  onCopyLink: () => void;
}

export function ShareDialog({
  isOpen,
  onClose,
  referralCode,
  referralLink,
  onCopyLink,
}: ShareDialogProps) {
  const message = buildAffiliateShareMessage({
    referralCode,
    referralLink,
  });
  const disabled = !message;

  const encodedMessage = message ? encodeURIComponent(message) : "";
  const encodedSubject = encodeURIComponent("Join Kutoot Affiliate Program");

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share referral code">
      <p className="text-sm text-muted-foreground">
        Share your referral code with merchants through your preferred channel.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => openExternal(`https://wa.me/?text=${encodedMessage}`)}
        >
          WhatsApp
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => openExternal(`sms:?body=${encodedMessage}`)}
        >
          SMS
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            openExternal(
              `mailto:?subject=${encodedSubject}&body=${encodedMessage}`,
            )
          }
        >
          Email
        </Button>
        <Button
          type="button"
          disabled={!referralLink}
          onClick={onCopyLink}
        >
          Copy link
        </Button>
      </div>
    </Modal>
  );
}
