import { notification } from 'antd';
import type { NotificationArgsProps } from 'antd';

type NotificationConfig = {
  title: string;
  description?: string;
  type?: NotificationArgsProps['type'];
  placement?: NotificationArgsProps['placement'];
  duration?: number;
};

/**
 * Custom hook untuk menampilkan notification
 * 
 * @example
 * const showNotification = useNotification();
 * 
 * // Basic usage
 * showNotification({
 *   title: 'Success!',
 *   description: 'Data berhasil disimpan',
 *   type: 'success'
 * });
 * 
 * // With placement
 * showNotification({
 *   title: 'Error!',
 *   description: 'Gagal menyimpan data',
 *   type: 'error',
 *   placement: 'topRight'
 * });
 */
export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = ({
    title,
    description,
    type = 'info',
    placement = 'topRight',
    duration = 4.5,
  }: NotificationConfig) => {
    api[type]({
      message: title,
      description: description,
      placement,
      duration,
    });
  };

  return { showNotification, contextHolder };
};