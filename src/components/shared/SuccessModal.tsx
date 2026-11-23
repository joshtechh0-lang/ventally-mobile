import React from 'react';
import { useTranslation } from 'react-i18next';
import GlassModal from './GlassModal';
import { tickIcon } from '../../assets/icons';

interface SuccessModalProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText,
  onButtonPress,
}) => {
  const { t } = useTranslation();

  const effectiveTitle = title ?? t('Common.success');
  const effectiveMessage = message ?? t('Common.operationSuccess');
  const effectiveButtonText = buttonText ?? t('Common.done');
  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      icon={tickIcon}
      title={effectiveTitle}
      message={effectiveMessage}
      primaryButtonText={effectiveButtonText}
      onPrimaryPress={onButtonPress || onClose}
      showButtons={true}
      secondaryButtonText=""
      dismissOnOverlayPress={true}
    />
  );
};

export default SuccessModal;