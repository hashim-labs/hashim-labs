'use client';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function baseOptions() {
  const light = typeof document !== 'undefined' && document.documentElement.dataset.workspaceTheme === 'light';
  return {
  background: light ? '#ffffff' : '#111827',
  color: light ? '#24364e' : '#e2e8f0',
  confirmButtonColor: light ? '#365a85' : '#b7c8e0',
  heightAuto: false,
  customClass: {
    popup: 'portfolio-alert',
    title: 'portfolio-alert-title',
    htmlContainer: 'portfolio-alert-copy',
    confirmButton: 'portfolio-alert-button',
  },
  };
}

export function showSuccess(title, text) {
  return Swal.fire({ ...baseOptions(), icon: 'success', iconColor: '#5aab87', title, text, timer: 2600, timerProgressBar: true, showConfirmButton: false });
}

export function showError(title, text) {
  return Swal.fire({ ...baseOptions(), icon: 'error', iconColor: '#ce6b82', title, text, confirmButtonText: 'Close' });
}

export function showInfo(title, text) {
  return Swal.fire({ ...baseOptions(), icon: 'info', iconColor: '#8fa8ca', title, text, confirmButtonText: 'Okay' });
}

export function confirmAction(title, text, confirmButtonText = 'Continue') {
  return Swal.fire({
    ...baseOptions(),
    icon: 'question',
    iconColor: '#8fa8ca',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    cancelButtonColor: '#334155',
    focusCancel: true,
    reverseButtons: true,
  });
}

export function showLoading(title = 'Working securely...') {
  Swal.fire({
    ...baseOptions(),
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });
}

export function closeAlert() {
  Swal.close();
}

export function showToast(title) {
  return Swal.fire({ ...baseOptions(), title, icon: 'success', iconColor: '#5aab87', toast: true, position: 'top-end', timer: 2200, timerProgressBar: true, showConfirmButton: false });
}
