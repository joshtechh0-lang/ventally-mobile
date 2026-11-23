import { ToastService } from './ToastService';
import { Theme } from '../theme/types';

const toastError = ({ text, duration = 3000 }: { text: string, duration?: number, theme?: Theme }) => {
  ToastService.error(text, duration);
};

const toastSuccess = ({ text, duration = 3000 }: { text: string, duration?: number, theme?: Theme }) => {
  ToastService.success(text, duration);
};

export { toastError, toastSuccess };
