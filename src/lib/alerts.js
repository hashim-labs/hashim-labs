'use client';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const baseOptions = {
  background: '#0f172a',
  color: '#e2e8f0',
  confirmButtonColor: '#67e8f9',
  customClass: {
    popup: 'portfolio-alert',
    title: 'portfolio-alert-title',
    htmlContainer: 'portfolio-alert-copy',
    confirmButton: 'portfolio-alert-button',
  },
};

export function showSuccess(title, text) {
  return Swal.fire({ ...baseOptions, icon: 'success', iconColor: '#6ee7b7', title, text, timer: 3200, timerProgressBar: true, showConfirmButton: false });
}

export function showError(title, text) {
  return Swal.fire({ ...baseOptions, icon: 'error', iconColor: '#fda4af', title, text, confirmButtonText: 'Close' });
}

export function showInfo(title, text) {
  return Swal.fire({ ...baseOptions, icon: 'info', iconColor: '#67e8f9', title, text, confirmButtonText: 'Okay' });
}
